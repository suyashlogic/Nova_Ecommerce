import api from './api';

export const getWishlist = async () => (await api.get('/wishlist')).data.products;
export const addToWishlist = async (productId) => api.post('/wishlist', { productId });
export const removeFromWishlist = async (productId) => api.delete(`/wishlist/${productId}`);
