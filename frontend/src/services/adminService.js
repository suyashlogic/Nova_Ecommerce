import api from './api';

export const getStats = async () => (await api.get('/admin/stats')).data;
export const listAdminOrders = async (params = {}) => (await api.get('/admin/orders', { params })).data;
export const updateOrderStatus = async (id, status) => (await api.patch(`/admin/orders/${id}/status`, { status })).data.order;
export const listAdminUsers = async (params = {}) => (await api.get('/admin/users', { params })).data;
