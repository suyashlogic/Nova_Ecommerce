import api from './api';

export const listCategories = async () => (await api.get('/categories')).data.categories;
