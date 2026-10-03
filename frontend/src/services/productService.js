import api from './api';

// params example: { search: 'desk', category: 'audio', sort: 'price_asc', page: 1 }
// Returns { products, pagination }
export const listProducts = async (params = {}) => (await api.get('/products', { params })).data;

// Returns { product, related, reviews }
export const getProduct = async (id) => (await api.get(`/products/${id}`)).data;
