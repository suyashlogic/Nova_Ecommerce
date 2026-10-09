import api from './api';

// `formData` is a FormData object so the optional image file can be sent with the fields.
// (Axios and the browser add the multipart boundary automatically.)
export const createProduct = async (formData) => (await api.post('/products', formData)).data.product;
export const updateProduct = async (id, formData) => (await api.put(`/products/${id}`, formData)).data.product;
export const deleteProduct = async (id) => api.delete(`/products/${id}`);
export const updateProductStock = async (id, stock) => (await api.patch(`/products/${id}/stock`, { stock })).data.product;
