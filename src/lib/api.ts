/**
 * Axios API Client with Automatic JWT Token Management
 *
 * This module configures axios with:
 * - Automatic access token injection in headers
 * - Automatic token refresh on expiry (401)
 * - Centralized error handling
 * - Automatic retry after token refresh
 */

import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import qs from 'qs';

// ==========================================
// BASE CONFIGURATION
// ==========================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Axios instance configured for BookMe API
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

const TOKEN_KEY = "bookme_access_token";
const REFRESH_TOKEN_KEY = "bookme_refresh_token";

/**
 * Gets access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Gets refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Saves tokens to localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Removes tokens (logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Checks if user is authenticated (has a token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// ==========================================
// REQUEST INTERCEPTOR
// Automatically adds token to headers
// ==========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // Add authentication token if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handles automatic token refresh and errors
// ==========================================

/**
 * Variable to prevent multiple refresh calls
 * while a refresh is in progress
 */
let isRefreshing = false;

/**
 * Queue of requests waiting during refresh
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Processes queue after successful or failed refresh
 */
const processQueue = (
  error: Error | null,
  token: string | null = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // Success case: return response as is
  (response) => response,

  // Error case: handle token refresh on 401
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if it's a 401 error and not already a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // If no valid refresh token, don't attempt refresh
      if (!refreshToken || refreshToken === "undefined") {
        console.warn("No valid refresh token found. Redirecting to login.");
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      // Don't attempt refresh for login or refresh routes
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark as retry to avoid infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        setTokens(accessToken, newRefreshToken);

        // Process queue with new token
        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, log out user
        processQueue(refreshError as Error, null);
        clearTokens();
        
        // Only redirect if we're in a browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, propagate them
    return Promise.reject(error);
  }
);

// ==========================================
// API ERROR HELPERS
// ==========================================

/**
 * Extracts error message from API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Error with server response
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      return Array.isArray(message) ? message[0] : message;
    }
    
    // Network error
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    
    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection.";
    }
    
    if (!error.response) {
      return "Unable to reach the server. Please check your connection.";
    }
    
    // HTTP status errors
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Authentication required. Please sign in.";
      case 403:
        return "Access denied. You don't have permission.";
      case 404:
        return "Resource not found.";
      case 409:
        return "Conflict. This resource already exists.";
      case 422:
        return "Validation error. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
        return "Service temporarily unavailable. Please try again.";
      default:
        return "An unexpected error occurred.";
    }
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

/**
 * Checks if error is a validation error (400/422)
 */
export const isValidationError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && 
    (error.response?.status === 400 || error.response?.status === 422);
};

/**
 * Checks if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

/**
 * Checks if error is a permission error (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
};

/**
 * Checks if error is a "not found" error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

/**
 * Checks if error is a conflict error (409)
 */
export const isConflictError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 409;
};

/**
 * Checks if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  return error.code === "ERR_NETWORK" || !error.response;
};

/**
 * Extracts validation errors by field from API response
 */
export const getValidationErrors = (error: unknown): Record<string, string> | null => {
  if (!axios.isAxiosError(error)) return null;
  
  const errors = error.response?.data?.errors;
  if (!errors || typeof errors !== 'object') return null;
  
  const fieldErrors: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages[0];
    } else if (typeof messages === 'string') {
      fieldErrors[field] = messages;
    }
  }
  
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};

export default api;