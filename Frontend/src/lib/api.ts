/**
 * API Configuration
 * 
 * We use a relative '/api' proxy as the default. 
 * This is truly dynamic: it works regardless of whether you are on 
 * localhost, 127.0.0.1, or a network IP.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Builds a dynamic URL for the API.
 * @param path The relative path to the endpoint (e.g., "/auth/signin")
 * @returns The full URL string
 */
export const getApiUrl = (path: string): string => {
  // Ensure the base doesn't end with a slash if the path starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If API_BASE is relative (starts with /), just return concatenated strings
  if (API_BASE.startsWith('/')) {
    return `${API_BASE}${cleanPath}`;
  }
  
  // If it's a full URL from .env, ensure no double slashes
  return `${API_BASE.replace(/\/$/, '')}${cleanPath}`;
};

/**
 * Common headers for all API requests
 */
export const getApiHeaders = (extraHeaders = {}) => ({
  "Content-Type": "application/json",
  ...extraHeaders
});
