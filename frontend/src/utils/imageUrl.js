import { API_URL } from './config';

// The API stores image paths like "/uploads/products/abc.jpg".
// The browser needs the full address of the API server in front of it.
// VITE_API_URL is "http://localhost:5000/api", so we keep only the origin.
const API_ORIGIN = new URL(API_URL).origin;

export default function imageUrl(path) {
  if (!path) return '/no-image.svg'; // local fallback in /public
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}
