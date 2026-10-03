import pool from '../db/pool.js';

export async function listCategories() {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.slug, c.description,
            COUNT(p.id)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id`
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    productCount: row.product_count,
  }));
}
