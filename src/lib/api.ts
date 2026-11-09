/**
 * API configuration and helper utilities.
 * When frontend is deployed to Vercel/Netlify and backend is hosted elsewhere
 * (e.g. Render, Railway, Koyeb, VPS), setting VITE_API_URL routes all
 * frontend API calls to that backend URL.
 * When VITE_API_URL is unset, relative paths are used.
 */
const rawApiUrl = typeof import.meta !== 'undefined' && (import.meta as any).env 
  ? (import.meta as any).env.VITE_API_URL 
  : '';

export const API_BASE_URL: string = (rawApiUrl || '').trim().replace(/\/+$/, '');

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return normalizedPath;
  return `${API_BASE_URL}${normalizedPath}`;
};
