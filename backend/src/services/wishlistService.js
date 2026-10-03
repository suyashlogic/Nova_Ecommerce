import pool from '../db/pool.js';
import AppError from '../utils/AppError.js';
import { listWishlistProducts } from './productService.js';

export const getWishlist = (userId) => listWishlistProducts(userId);

export async function addToWishlist(userId, productId) {
  const product = await pool.query('SELECT 1 FROM products WHERE id = $1', [productId]);
  if (!product.rowCount) throw AppError.notFound('Product not found');

  // UNIQUE(user_id, product_id) + ON CONFLICT DO NOTHING makes this safe to repeat
  await pool.query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [userId, productId]
  );
}

// WHERE user_id = $1 comes from the verified token, so users can only touch their own list
export async function removeFromWishlist(userId, productId) {
  await pool.query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [
    userId,
    productId,
  ]);
}
