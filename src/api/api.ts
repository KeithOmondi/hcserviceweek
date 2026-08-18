// src/api/publicApi.ts
import axios from 'axios';

/**
 * Public API client — no auth, no token refresh, no interceptors.
 * Used for endpoints that don't require authentication
 * (e.g. Service Week user-facing lookups/submissions).
 */
export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  // no withCredentials needed unless the public endpoints also read cookies
});

export default publicApiClient;