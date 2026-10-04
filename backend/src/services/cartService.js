import pool from '../db/pool.js';
import AppError from '../utils/AppError.js';
import { calculateTotals, lineTotal } from './pricing.js';

const SALE_PRICE_SQL = 'ROUND(p.price * (100 - p.discount_percent) / 100.0, 2)';

// Columns every cart line needs from the product (shared by the server cart and guest preview)
const PRODUCT_COLUMNS = `
  p.id AS product_id, p.name, p.image_url, p.price, p.discount_percent, p.stock,
  ${SALE_PRICE_SQL} AS sale_price, c.name AS category_name`;

// ---------------------------------------------------------------- helpers

// A row from the database -> the shape the frontend receives
function toItem(row) {
  const unitPrice = Number(row.sale_price);
  return {
    id: row.id, // cart_items.id for logged-in carts; the productId for guest previews
    productId: row.product_id,
    name: row.name,
    imageUrl: row.image_url,
    category: row.category_name,
    price: Number(row.price),
    discountPercent: row.discount_percent,
    unitPrice,
    stock: row.stock,
    quantity: row.quantity,
    lineTotal: lineTotal(unitPrice, row.quantity),
  };
}

// The one response shape for every cart endpoint: items + totals + notices
function buildView(items, adjustments = []) {
  return {
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      ...calculateTotals(items),
    },
    adjustments,
  };
}

// Decides what quantity is actually possible. Returns 0 if the line must be dropped.
// Pushes a human-readable notice into `adjustments` whenever it changes something.
function clampQuantity(row, wanted, adjustments) {
  if (row.stock <= 0) {
    adjustments.push({
      type: 'removed',
      productId: row.product_id,
      message: `${row.name} is out of stock and was removed from your cart`,
    });
    return 0;
  }
  if (wanted > row.stock) {
    adjustments.push({
      type: 'reduced',
      productId: row.product_id,
      message: `Only ${row.stock} of ${row.name} available. Quantity was reduced`,
    });
    return row.stock;
  }
  return wanted;
}

// Combines duplicate product ids by adding their quantities: [{productId, quantity}] -> Map
function dedupeLines(lines) {
  const merged = new Map();
  for (const { productId, quantity } of lines) {
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  return merged;
}

async function getOrCreateCartId(db, userId) {
  const existing = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows[0]) return existing.rows[0].id;

  // ON CONFLICT covers two requests creating the cart at the same moment
  const { rows } = await db.query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING id`,
    [userId]
  );
  return rows[0].id;
}

// ------------------------------------------------------- logged-in cart

// Loads the cart AND repairs it: if stock dropped since the item was added,
// the quantity is lowered (or the item removed) and a notice is returned.
export async function getCartView(userId) {
  const cartId = await getOrCreateCartId(pool, userId);
  const { rows } = await pool.query(
    `SELECT ci.id, ci.quantity, ${PRODUCT_COLUMNS}
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN categories c ON c.id = p.category_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id`,
    [cartId]
  );

  const adjustments = [];
  const items = [];
  for (const row of rows) {
    const quantity = clampQuantity(row, row.quantity, adjustments);
    if (quantity === 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1', [row.id]);
    } else {
      if (quantity !== row.quantity) {
        await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, row.id]);
      }
      items.push(toItem({ ...row, quantity }));
    }
  }
  return buildView(items, adjustments);
}

export async function addItem(userId, productId, quantity) {
  const { rows } = await pool.query('SELECT name, stock FROM products WHERE id = $1', [productId]);
  const product = rows[0];
  if (!product) throw AppError.notFound('Product not found');
  if (product.stock <= 0) throw AppError.conflict('This product is out of stock');

  const cartId = await getOrCreateCartId(pool, userId);
  const existing = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );
  const inCart = existing.rows[0]?.quantity ?? 0;

  // THE INVENTORY RULE: never let the cart hold more than we have
  if (inCart + quantity > product.stock) {
    throw AppError.conflict(
      inCart > 0
        ? `Only ${product.stock} available (you already have ${inCart} in your cart)`
        : `Only ${product.stock} available`
    );
  }

  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [cartId, productId, quantity]
  );
  return getCartView(userId);
}

export async function updateQuantity(userId, itemId, quantity) {
  // The JOIN on carts.user_id proves the item belongs to THIS user (ownership check in SQL)
  const { rows } = await pool.query(
    `SELECT p.stock
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
      WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId]
  );
  if (!rows[0]) throw AppError.notFound('Cart item not found');
  if (rows[0].stock <= 0) throw AppError.conflict('This product is out of stock');
  if (quantity > rows[0].stock) throw AppError.conflict(`Only ${rows[0].stock} available`);

  await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
  return getCartView(userId);
}

export async function removeItem(userId, itemId) {
  const { rowCount } = await pool.query(
    `DELETE FROM cart_items ci
      USING carts c
      WHERE ci.id = $1 AND ci.cart_id = c.id AND c.user_id = $2`,
    [itemId, userId]
  );
  if (!rowCount) throw AppError.notFound('Cart item not found');
  return getCartView(userId);
}

// Called right after login: folds the guest's localStorage cart into the saved cart.
// If a product is in both, the LARGER quantity wins instead of adding them together.
// That makes the call safe to repeat (a retry or double request can never double the cart).
export async function mergeGuestCart(userId, lines) {
  const merged = dedupeLines(lines);
  const adjustments = [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartId = await getOrCreateCartId(client, userId);

    for (const [productId, guestQuantity] of merged) {
      const { rows } = await client.query('SELECT name, stock FROM products WHERE id = $1', [productId]);
      const product = rows[0];

      if (!product || product.stock <= 0) {
        adjustments.push({
          type: 'removed',
          productId,
          message: product
            ? `${product.name} is out of stock and was not added to your cart`
            : 'An item is no longer available and was not added to your cart',
        });
        continue;
      }

      const existing = await client.query(
        'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      const wanted = Math.max(existing.rows[0]?.quantity ?? 0, guestQuantity);
      const quantity = Math.min(wanted, product.stock);
      if (quantity < wanted) {
        adjustments.push({
          type: 'reduced',
          productId,
          message: `Only ${product.stock} of ${product.name} available. Quantity was reduced`,
        });
      }

      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [cartId, productId, quantity]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const view = await getCartView(userId);
  return { ...view, adjustments: [...adjustments, ...view.adjustments] };
}

// -------------------------------------------------------- guest preview

// Guests keep only [{productId, quantity}] in localStorage. This turns those lines into
// the same view a logged-in user gets (fresh prices, stock checks, totals). Nothing is saved.
export async function previewCart(lines) {
  const merged = dedupeLines(lines);
  const ids = [...merged.keys()];

  let rows = [];
  if (ids.length > 0) {
    ({ rows } = await pool.query(
      `SELECT ${PRODUCT_COLUMNS}
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.id = ANY($1::int[])`,
      [ids]
    ));
  }
  const byId = new Map(rows.map((row) => [row.product_id, row]));

  const adjustments = [];
  const items = [];
  for (const [productId, wanted] of merged) {
    const row = byId.get(productId);
    if (!row) {
      adjustments.push({
        type: 'removed',
        productId,
        message: 'An item in your cart is no longer available and was removed',
      });
      continue;
    }
    const quantity = clampQuantity(row, wanted, adjustments);
    if (quantity > 0) items.push(toItem({ ...row, id: productId, quantity }));
  }
  return buildView(items, adjustments);
}
