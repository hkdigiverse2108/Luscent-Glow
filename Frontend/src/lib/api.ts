/**
 * API Configuration
 * 
 * We use a relative '/api' proxy as the default. 
 * This is truly dynamic: it works regardless of whether you are on 
 * localhost, 127.0.0.1, or a network IP.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE_URL = API_BASE.includes('http') 
  ? API_BASE.split('/api')[0] 
  : ''; // Relative fallback

/**
 * Builds a dynamic URL for the API.
 * @param path The relative path to the endpoint (e.g., "/auth/signin")
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.startsWith('/')) return `${API_BASE}${cleanPath}`;
  return `${API_BASE.replace(/\/$/, '')}${cleanPath}`;
};

/**
 * Builds a dynamic URL for static assets (uploads).
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith('http')) return path; // Already absolute
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Since we moved assets to Frontend/public/uploads, they are served relative to the frontend origin
  return cleanPath;
};

/**
 * Common headers for all API requests
 */
export const getApiHeaders = (extraHeaders = {}) => ({
  "Content-Type": "application/json",
  ...extraHeaders
});
