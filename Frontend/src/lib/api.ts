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

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Ensure the path starts with /api if it doesn't already
  const apiPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  
  if (API_BASE.startsWith('/')) {
    // If API_BASE is relative (like '/api')
    if (API_BASE === '/api') return apiPath;
    return `${API_BASE}${apiPath.startsWith(API_BASE) ? apiPath.slice(API_BASE.length) : apiPath}`;
  }
  
  // If API_BASE is absolute (like 'http://localhost:5172')
  return `${API_BASE.replace(/\/$/, '')}${apiPath}`;
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
