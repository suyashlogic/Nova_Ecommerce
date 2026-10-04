import api from './api';

// Every cart endpoint returns the same shape: { items, summary, adjustments }
export const getCart = async () => (await api.get('/cart')).data.cart;
export const addItem = async (productId, quantity) => (await api.post('/cart', { productId, quantity })).data.cart;
export const updateItem = async (itemId, quantity) => (await api.put(`/cart/${itemId}`, { quantity })).data.cart;
export const removeItem = async (itemId) => (await api.delete(`/cart/${itemId}`)).data.cart;

// Logged in, right after login: send the guest's saved lines to be merged
export const mergeCart = async (items) => (await api.post('/cart/merge', { items })).data.cart;

// Guest: turn [{productId, quantity}] into full items with prices and totals
export const previewCart = async (items) => (await api.post('/cart/preview', { items })).data.cart;
