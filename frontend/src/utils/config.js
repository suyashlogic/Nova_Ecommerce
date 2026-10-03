// Reads the API address from frontend/.env (VITE_API_URL).
// Falls back to the local default so a missing .env doesn't blank the whole page.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
