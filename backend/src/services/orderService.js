import pool from '../db/pool.js';
import AppError from '../utils/AppError.js';
import generateOrderRef from '../utils/generateOrderRef.js';
import { calculateTotals, lineTotal } from './pricing.js';

// A customer may cancel until the order starts being processed
const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

// ---------------------------------------------------------------- shaping

function toOrderItem(row) {
  const unitPrice = Number(row.unit_price);
  return {
    id: row.id,
    productId: row.product_id, // null if the product was deleted later
    name: row.product_name, // snapshot taken at purchase time
    unitPrice,
    quantity: row.quantity,
    lineTotal: lineTotal(unitPrice, row.quantity),
    imageUrl: row.image_url, // null if the product no longer exists
  };
}

function toOrder(row, items = []) {
  return {
    id: row.id,
    orderRef: row.order_ref,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canCancel: CANCELLABLE_STATUSES.includes(row.status),
    shipping: {
      name: row.shipping_name,
      phone: row.shipping_phone,
      line1: row.shipping_line1,
      line2: row.shipping_line2,
      city: row.shipping_city,
      state: row.shipping_state,
      postalCode: row.shipping_postal,
      country: row.shipping_country,
    },
    items,
  };
}

async function loadItems(db, orderIds) {
  const { rows } = await db.query(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.unit_price, oi.quantity, p.image_url
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ANY($1::int[])
      ORDER BY oi.id`,
    [orderIds]
  );
  return rows;
}

// ---------------------------------------------------------------- reading

export async function listOrders(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 100',
    [userId]
  );
  if (rows.length === 0) return [];

  const itemRows = await loadItems(pool, rows.map((r) => r.id));
  return rows.map((order) =>
    toOrder(order, itemRows.filter((i) => i.order_id === order.id).map(toOrderItem))
  );
}

// Customers only ever see their own orders. If it isn't theirs we answer 404 (not 403),
// so nobody can discover which order ids exist. Admins may open any order.
export async function getOrder(user, orderId) {
  const isAdmin = user.role === 'admin';
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND ($2::boolean OR user_id = $3)',
    [orderId, isAdmin, user.id]
  );
  if (!rows[0]) throw AppError.notFound('Order not found');

  const itemRows = await loadItems(pool, [orderId]);
  return toOrder(rows[0], itemRows.map(toOrderItem));
}

// ---------------------------------------------------------------- checkout

// THE IMPORTANT FUNCTION. Everything happens in ONE transaction: either the whole
// order is created, stock reduced and cart emptied, or nothing changes at all.
export async function placeOrder(userId, { shipping, paymentMethod }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Read the saved cart
    const cart = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    const cartId = cart.rows[0]?.id;
    const lines = cartId
      ? (await client.query(
          'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1 ORDER BY product_id',
          [cartId]
        )).rows
      : [];
    if (lines.length === 0) throw AppError.conflict('Your cart is empty');

    // 2. LOCK the product rows (FOR UPDATE). If another customer is buying the same
    //    product right now, we wait for them to finish, then see the real stock.
    //    Locking in id order means two checkouts can never deadlock each other.
    const { rows: products } = await client.query(
      `SELECT id, name, stock, ROUND(price * (100 - discount_percent) / 100.0, 2) AS unit_price
         FROM products
        WHERE id = ANY($1::int[])
        ORDER BY id
          FOR UPDATE`,
      [lines.map((l) => l.product_id)]
    );
    const byId = new Map(products.map((p) => [p.id, p]));

    // 3. Re-check stock under the lock. The prices come from the DATABASE, never from the browser.
    const issues = [];
    const orderLines = [];
    for (const line of lines) {
      const product = byId.get(line.product_id);
      if (!product) issues.push('An item in your cart is no longer available');
      else if (product.stock <= 0) issues.push(`${product.name} is out of stock`);
      else if (product.stock < line.quantity) issues.push(`Only ${product.stock} of ${product.name} available`);
      else {
        orderLines.push({
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.unit_price),
          quantity: line.quantity,
        });
      }
    }
    if (issues.length > 0) {
      throw AppError.conflict(`${issues.join('. ')}. Please review your cart.`);
    }

    // 4. Totals use the same pricing code as the cart page, so they always match
    const totals = calculateTotals(orderLines);

    // 5. Unique, readable reference such as NOVA-2026-A8F3K2
    let orderRef = null;
    for (let attempt = 0; attempt < 5 && !orderRef; attempt += 1) {
      const candidate = generateOrderRef();
      const taken = await client.query('SELECT 1 FROM orders WHERE order_ref = $1', [candidate]);
      if (taken.rowCount === 0) orderRef = candidate;
    }
    if (!orderRef) throw new Error('Could not generate a unique order reference');

    // Simulated payment: card and UPI "succeed" instantly (confirmed); cash on delivery waits (pending)
    const status = paymentMethod === 'cod' ? 'pending' : 'confirmed';

    // 6. Create the order. The address is COPIED in, so later profile edits don't change history.
    const { rows: created } = await client.query(
      `INSERT INTO orders
         (order_ref, user_id, status, subtotal, tax, shipping_fee, total, payment_method,
          shipping_name, shipping_phone, shipping_line1, shipping_line2,
          shipping_city, shipping_state, shipping_postal, shipping_country)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id`,
      [
        orderRef, userId, status, totals.subtotal, totals.tax, totals.shippingFee, totals.total, paymentMethod,
        shipping.name, shipping.phone, shipping.line1, shipping.line2 || null,
        shipping.city, shipping.state, shipping.postalCode, shipping.country,
      ]
    );
    const orderId = created[0].id;

    // 7. Items (with name and price snapshots) and inventory reduction
    for (const line of orderLines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, line.productId, line.name, line.unitPrice, line.quantity]
      );
      // The CHECK (stock >= 0) in the schema is a last safety net behind our own check
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [line.quantity, line.productId]);
    }

    // 8. Empty the cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');
    return orderId;
  } catch (err) {
    await client.query('ROLLBACK'); // undo everything above
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------- cancelling

// Puts the stock of every item in an order back on the shelf.
// Exported so the admin "cancel" in Phase 10 can reuse it.
export async function restockOrderItems(client, orderId) {
  await client.query(
    `UPDATE products p
        SET stock = p.stock + oi.quantity
       FROM order_items oi
      WHERE oi.order_id = $1 AND oi.product_id = p.id`,
    [orderId]
  );
}

export async function cancelOrder(user, orderId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FOR UPDATE stops two cancel clicks from both restocking the same items
    const { rows } = await client.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [orderId, user.id]
    );
    if (!rows[0]) throw AppError.notFound('Order not found');
    if (!CANCELLABLE_STATUSES.includes(rows[0].status)) {
      throw AppError.conflict('This order can no longer be cancelled');
    }

    await restockOrderItems(client, orderId);
    await client.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [orderId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return getOrder(user, orderId);
}
