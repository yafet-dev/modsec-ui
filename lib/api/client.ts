import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { authApi } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to check if token is expired or about to expire (within 5 minutes)
const isTokenExpired = (expiresAt: number): boolean => {
  if (!expiresAt) return true;
  // Check if token expires within 5 minutes (300000 ms)
  const bufferTime = 5 * 60 * 1000;
  return Date.now() >= expiresAt * 1000 - bufferTime;
};

// Helper function to refresh token
const refreshToken = async (): Promise<string | null> => {
  const authData = localStorage.getItem('modsecurity_auth');
  if (!authData) return null;

  try {
    const parsed = JSON.parse(authData);
    const { refresh_token } = parsed;

    if (!refresh_token) return null;

    const response = await authApi.refreshToken({ refresh_token });
    const { access_token, refresh_token: newRefreshToken, expires_at } = response.session;

    // Update stored auth data
    const updatedAuthData = {
      ...parsed,
      access_token,
      refresh_token: newRefreshToken,
      expires_at,
    };
    localStorage.setItem('modsecurity_auth', JSON.stringify(updatedAuthData));

    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear auth data on refresh failure
    localStorage.removeItem('modsecurity_auth');
    return null;
  }
};

// Request interceptor to add auth token and refresh if needed
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip adding auth header for refresh token endpoint
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }

    const authData = localStorage.getItem('modsecurity_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        let { access_token, expires_at } = parsed;

        // Check if token is expired or about to expire
        if (isTokenExpired(expires_at)) {
          // Refresh token before making the request
          if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshToken();
            isRefreshing = false;

            if (newToken) {
              access_token = newToken;
              // Update expires_at from the refreshed token
              const updatedAuthData = JSON.parse(localStorage.getItem('modsecurity_auth') || '{}');
              expires_at = updatedAuthData.expires_at;
            } else {
              // Refresh failed, redirect to login
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
              return Promise.reject(new Error('Token refresh failed'));
            }
          } else {
            // Wait for ongoing refresh
            await new Promise((resolve) => {
              failedQueue.push({ resolve, reject: () => {} });
            });
            // Get the updated token
            const updatedAuthData = localStorage.getItem('modsecurity_auth');
            if (updatedAuthData) {
              const parsed = JSON.parse(updatedAuthData);
              access_token = parsed.access_token;
            }
          }
        }

        if (access_token && config.headers) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, wait for it
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        isRefreshing = false;

        if (newToken) {
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // Refresh failed, clear auth and redirect
          processQueue(error, null);
          localStorage.removeItem('modsecurity_auth');
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(error, null);
        localStorage.removeItem('modsecurity_auth');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

