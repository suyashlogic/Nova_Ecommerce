import * as adminService from '../services/adminService.js';

// Express 5: req.query is re-parsed on every access, so validators cannot convert it.
// We convert here, with safe defaults.
function readPaging(query, defaultLimit = 10) {
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const limit = Math.min(50, Math.max(1, Math.floor(Number(query.limit)) || defaultLimit));
  return { page, limit };
}

export async function stats(req, res) {
  res.json({ status: 'success', ...(await adminService.getStats()) });
}

export async function orders(req, res) {
  const result = await adminService.listOrders({
    status: req.query.status || undefined,
    search: req.query.search?.trim() || undefined,
    ...readPaging(req.query),
  });
  res.json({ status: 'success', ...result });
}

export async function updateOrderStatus(req, res) {
  const order = await adminService.updateOrderStatus(req.user, Number(req.params.id), req.body.status);
  res.json({ status: 'success', order });
}

export async function users(req, res) {
  const result = await adminService.listUsers({
    search: req.query.search?.trim() || undefined,
    ...readPaging(req.query),
  });
  res.json({ status: 'success', ...result });
}
