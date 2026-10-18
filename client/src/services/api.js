import axios from 'axios';

// Fallback to /api/v1 if environment variable is not defined or is legacy /api
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
if (rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/v1`;
}
const API_BASE_URL = rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Supabase or session JWT token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novacart_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for standardized response handling and session expiration
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Session expiration handling
    if (error.response && error.response.status === 401) {
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      // If unauthorized on a protected route, remove stale token
      if (!isAuthCheck) {
        console.warn('[API Client] Unauthorized request or expired session. Clearing local token.');
        localStorage.removeItem('novacart_auth_token');
        // Dispatch custom session-expired event so React tree can react without reload
        window.dispatchEvent(new CustomEvent('novacart:session-expired'));
      }
    }

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    const enhancedError = new Error(errorMsg);
    enhancedError.status = error.response?.status;
    enhancedError.errors = error.response?.data?.errors;
    return Promise.reject(enhancedError);
  }
);

/**
 * Health check service
 */
export const checkHealth = async () => {
  return await apiClient.get('/health');
};

export default apiClient;
