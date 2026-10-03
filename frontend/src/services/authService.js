import api from './api';

// Each function calls one endpoint and returns just the useful data.
export const getMe = async () => (await api.get('/auth/me')).data.user;
export const login = async (email, password) =>
  (await api.post('/auth/login', { email, password })).data.user;
export const register = async ({ name, email, password }) =>
  (await api.post('/auth/register', { name, email, password })).data.user;
export const logout = async () => api.post('/auth/logout');
export const updateProfile = async (profile) => (await api.put('/auth/me', profile)).data.user;
