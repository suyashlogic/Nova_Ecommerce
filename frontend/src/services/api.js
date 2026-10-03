import axios from 'axios';
import { API_URL } from '../utils/config';

// One Axios instance for the whole app. Every service file imports this.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send and receive the httpOnly auth cookie
  headers: { 'X-Requested-With': 'NOVA' }, // CSRF defence checked by the backend
});

// A tidy error type so components never dig through Axios internals.
export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors; // e.g. { email: 'Enter a valid email' }
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all: server down, no internet, or blocked by CORS
    if (!error.response) {
      return Promise.reject(
        new ApiError('Cannot reach the server. Please check your connection and try again.')
      );
    }

    const { status, data } = error.response;
    const url = error.config?.url ?? '';

    // A 401 on a normal request means the session expired. Tell AuthContext.
    // (Auth calls like /auth/me and /auth/login legitimately return 401.)
    if (status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('nova:unauthorized'));
    }

    return Promise.reject(new ApiError(data?.message || 'Something went wrong', status, data?.errors));
  }
);

export default api;
