import pool from '../db/pool.js';
import AppError from '../utils/AppError.js';

// The price a customer actually pays. Computed in SQL so there is one source of truth.
const SALE_PRICE_SQL = 'ROUND(p.price * (100 - p.discount_percent) / 100.0, 2)';

// Whitelist of sort options. The client sends a KEY; we choose the SQL.
// User input is never placed into ORDER BY directly (that would allow SQL injection).
const SORT_OPTIONS = {
  newest: 'p.created_at DESC, p.id DESC',
  price_asc: `${SALE_PRICE_SQL} ASC, p.id ASC`,
  price_desc: `${SALE_PRICE_SQL} DESC, p.id ASC`,
  name: 'p.name ASC',
  rating: 'COALESCE(r.avg_rating, 0) DESC, COALESCE(r.review_count, 0) DESC, p.id ASC',
};
export const SORT_KEYS = Object.keys(SORT_OPTIONS);

// Shared SELECT: product + category + average rating from reviews
const SELECT_PRODUCT = `
  SELECT p.id, p.name, p.description, p.price, p.discount_percent, p.stock,
         p.image_url, p.specs, p.is_featured, p.created_at,
         ${SALE_PRICE_SQL} AS sale_price,
         c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
         r.avg_rating, COALESCE(r.review_count, 0) AS review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN (
      SELECT product_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
       GROUP BY product_id
    ) r ON r.product_id = p.id`;

// pg returns NUMERIC and COUNT as strings, so convert to real numbers here
function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    discountPercent: row.discount_percent,
    salePrice: Number(row.sale_price),
    stock: row.stock,
    inStock: row.stock > 0,
    imageUrl: row.image_url,
    specs: row.specs,
    isFeatured: row.is_featured,
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    rating: row.avg_rating === null ? null : Number(row.avg_rating),
    reviewCount: Number(row.review_count),
    createdAt: row.created_at,
  };
}

// Make % and _ in the search text match literally instead of acting as wildcards
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

export async function listProducts({
  search,
  category,
  minPrice,
  maxPrice,
  sort = 'newest',
  page = 1,
  limit = 12,
  featured = false,
  inStock = false,
}) {
  const conditions = [];
  const params = [];

  // Pushes the value into params and puts its $n placeholder into the SQL
  const addCondition = (sql, value) => {
    params.push(value);
    conditions.push(sql.replaceAll('?', `$${params.length}`));
  };

  if (search) addCondition('(p.name ILIKE ? OR p.description ILIKE ?)', `%${escapeLike(search)}%`);
  if (category) addCondition('c.slug = ?', category);
  if (minPrice !== undefined) addCondition(`${SALE_PRICE_SQL} >= ?`, minPrice);
  if (maxPrice !== undefined) addCondition(`${SALE_PRICE_SQL} <= ?`, maxPrice);
  if (featured) conditions.push('p.is_featured = TRUE');
  if (inStock) conditions.push('p.stock > 0');

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;
  const offset = (page - 1) * limit;

  const [countResult, listResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total
         FROM products p JOIN categories c ON c.id = p.category_id ${where}`,
      params
    ),
    pool.query(
      `${SELECT_PRODUCT} ${where} ORDER BY ${orderBy}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  const total = countResult.rows[0].total;
  return {
    products: listResult.rows.map(toProduct),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function findProductById(id) {
  const { rows } = await pool.query(`${SELECT_PRODUCT} WHERE p.id = $1`, [id]);
  return rows[0] ? toProduct(rows[0]) : null;
}

// Product page data: the product, 4 related products, and the latest reviews
export async function getProductDetail(id) {
  const product = await findProductById(id);
  if (!product) throw AppError.notFound('Product not found');

  const [relatedResult, reviewsResult] = await Promise.all([
    pool.query(
      `${SELECT_PRODUCT}
        WHERE p.category_id = $1 AND p.id <> $2
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT 4`,
      [product.category.id, id]
    ),
    pool.query(
      `SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS user_name
         FROM reviews rv
         JOIN users u ON u.id = rv.user_id
        WHERE rv.product_id = $1
        ORDER BY rv.created_at DESC
        LIMIT 10`,
      [id]
    ),
  ]);

  return {
    product,
    related: relatedResult.rows.map(toProduct),
    reviews: reviewsResult.rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      userName: row.user_name,
      createdAt: row.created_at,
    })),
  };
}

// A friendly 422 instead of a raw foreign-key error from Postgres
async function assertCategoryExists(categoryId) {
  const { rowCount } = await pool.query('SELECT 1 FROM categories WHERE id = $1', [categoryId]);
  if (!rowCount) {
    throw new AppError('Validation failed', 422, {
      errors: { categoryId: 'Selected category does not exist' },
    });
  }
}

export async function createProduct(data, imageUrl) {
  await assertCategoryExists(data.categoryId);

  const { rows } = await pool.query(
    `INSERT INTO products
       (category_id, name, description, price, discount_percent, stock, image_url, specs, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     RETURNING id`,
    [
      data.categoryId,
      data.name,
      data.description,
      data.price,
      data.discountPercent,
      data.stock,
      imageUrl,
      JSON.stringify(data.specs),
      data.isFeatured,
    ]
  );
  return findProductById(rows[0].id);
}

// Returns the old image URL too, so the controller can delete the replaced file
export async function updateProduct(id, data, newImageUrl) {
  const existing = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
  if (!existing.rowCount) throw AppError.notFound('Product not found');
  await assertCategoryExists(data.categoryId);

  await pool.query(
    `UPDATE products
        SET category_id = $1, name = $2, description = $3, price = $4,
            discount_percent = $5, stock = $6, specs = $7::jsonb, is_featured = $8,
            image_url = COALESCE($9, image_url)
      WHERE id = $10`,
    [
      data.categoryId,
      data.name,
      data.description,
      data.price,
      data.discountPercent,
      data.stock,
      JSON.stringify(data.specs),
      data.isFeatured,
      newImageUrl, // null keeps the current image
      id,
    ]
  );

  return {
    product: await findProductById(id),
    previousImageUrl: existing.rows[0].image_url,
  };
}

export async function updateStock(id, stock) {
  const { rowCount } = await pool.query('UPDATE products SET stock = $1 WHERE id = $2', [stock, id]);
  if (!rowCount) throw AppError.notFound('Product not found');
  return findProductById(id);
}

// Existing orders keep their snapshot (order_items.product_id becomes NULL),
// and the product disappears from carts automatically (ON DELETE CASCADE).
export async function deleteProduct(id) {
  const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING image_url', [id]);
  if (!rows[0]) throw AppError.notFound('Product not found');
  return rows[0].image_url;
}

// Products a user has saved, newest first. Same shape as the normal product list.
export async function listWishlistProducts(userId) {
  const { rows } = await pool.query(
    `${SELECT_PRODUCT}
       JOIN wishlist_items w ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC, w.id DESC`,
    [userId]
  );
  return rows.map(toProduct);
}
