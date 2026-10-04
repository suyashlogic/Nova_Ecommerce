import api from './api';

// payload: { shipping: { name, phone, line1, line2, city, state, postalCode, country }, paymentMethod }
export const placeOrder = async (payload) => (await api.post('/orders', payload)).data.order;
export const listOrders = async () => (await api.get('/orders')).data.orders;
export const getOrder = async (id) => (await api.get(`/orders/${id}`)).data.order;
export const cancelOrder = async (id) => (await api.patch(`/orders/${id}/cancel`)).data.order;
