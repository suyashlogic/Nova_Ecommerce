import pool from '../db/pool.js';
import AppError from '../utils/AppError.js';
import { LOW_STOCK_LIMIT, ORDER_TRANSITIONS } from '../config/constants.js';
import { getOrder, restockOrderItems } from './orderService.js';

// Make % and _ in search text match literally
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function paginate(total, page, limit) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

function toOrderRow(row) {
  return {
    id: row.id,
    orderRef: row.order_ref,
    status: row.status,
    total: Number(row.total),
    createdAt: row.created_at,
    itemCount: row.item_count,
    customer: { id: row.user_id, name: row.user_name, email: row.user_email },
    // The next statuses the dropdown may offer (the server decides, so rules live in one place)
    allowedStatuses: ORDER_TRANSITIONS[row.status] ?? [],
  };
}

const ORDER_SELECT = `
  SELECT o.id, o.order_ref, o.status, o.total, o.created_at,
         u.id AS user_id, u.name AS user_name, u.email AS user_email,
         (SELECT COALESCE(SUM(quantity), 0)::int FROM order_items WHERE order_id = o.id) AS item_count
    FROM orders o
    JOIN users u ON u.id = o.user_id`;

// ------------------------------------------------------------------ stats

export async function getStats() {
  const [totalsResult, recentResult] = await Promise.all([
    pool.query(
      `SELECT (SELECT COUNT(*) FROM products)::int AS products,
              (SELECT COUNT(*) FROM users)::int AS users,
              (SELECT COUNT(*) FROM orders)::int AS orders,
              (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status <> 'cancelled') AS revenue,
              (SELECT COUNT(*) FROM orders WHERE status = 'pending')::int AS pending_orders,
              (SELECT COUNT(*) FROM products WHERE stock <= $1)::int AS low_stock_products`,
      [LOW_STOCK_LIMIT]
    ),
    pool.query(`${ORDER_SELECT} ORDER BY o.created_at DESC, o.id DESC LIMIT 5`),
  ]);

  const t = totalsResult.rows[0];
  return {
    totals: {
      products: t.products,
      users: t.users,
      orders: t.orders,
      revenue: Number(t.revenue), // cancelled orders do not count as revenue
      pendingOrders: t.pending_orders,
      lowStockProducts: t.low_stock_products,
    },
    lowStockLimit: LOW_STOCK_LIMIT,
    recentOrders: recentResult.rows.map(toOrderRow),
  };
}

// ----------------------------------------------------------------- orders

export async function listOrders({ status, search, page, limit }) {
  const conditions = [];
  const params = [];
  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${escapeLike(search)}%`);
    const n = params.length;
    conditions.push(`(o.order_ref ILIKE $${n} OR u.email ILIKE $${n} OR u.name ILIKE $${n})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult, listResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM orders o JOIN users u ON u.id = o.user_id ${where}`, params),
    pool.query(
      `${ORDER_SELECT} ${where}
        ORDER BY o.created_at DESC, o.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]
    ),
  ]);

  return {
    orders: listResult.rows.map(toOrderRow),
    pagination: paginate(countResult.rows[0].total, page, limit),
  };
}

export async function updateOrderStatus(admin, orderId, newStatus) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the order so two admins (or an admin and the customer's own cancel) cannot clash
    const { rows } = await client.query('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
    if (!rows[0]) throw AppError.notFound('Order not found');

    const current = rows[0].status;
    if (!(ORDER_TRANSITIONS[current] ?? []).includes(newStatus)) {
      throw AppError.conflict(`An order that is ${current} cannot be changed to ${newStatus}`);
    }

    // Cancelling puts the items back on the shelf, in the same transaction
    if (newStatus === 'cancelled') await restockOrderItems(client, orderId);
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, orderId]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return getOrder(admin, orderId);
}

// ------------------------------------------------------------------ users

export async function listUsers({ search, page, limit }) {
  const params = [];
  let where = '';
  if (search) {
    params.push(`%${escapeLike(search)}%`);
    where = 'WHERE u.name ILIKE $1 OR u.email ILIKE $1';
  }

  const [countResult, listResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM users u ${where}`, params),
    // Columns are listed explicitly so password_hash can never be selected by accident
    pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(o.id)::int AS order_count,
              COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         ${where}
        GROUP BY u.id
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]
    ),
  ]);

  return {
    users: listResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      orderCount: row.order_count,
      totalSpent: Number(row.total_spent),
    })),
    pagination: paginate(countResult.rows[0].total, page, limit),
  };
}
