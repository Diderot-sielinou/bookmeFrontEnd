/**
 * Axios API Client - VERSION CORRIGÉE
 * 
 * Fichier: src/lib/api.ts
 * 
 * CORRECTION MAJEURE:
 * - Suppression des redirections automatiques vers /login
 * - Les composants React gèrent la redirection via les Route Guards
 * - L'intercepteur ne fait que rejeter l'erreur
 */

import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import qs from 'qs';

// ==========================================
// DEBUG
// ==========================================
const DEBUG_API = true;

function debugLog(action: string, data?: any) {
  if (DEBUG_API) {
    console.log(`[API:${action}]`, data || '');
  }
}

// ==========================================
// BASE CONFIGURATION
// ==========================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

const TOKEN_KEY = "bookme_access_token";
const REFRESH_TOKEN_KEY = "bookme_refresh_token";

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  // Retourner null si le token est invalide
  if (!token || token === "undefined" || token === "null" || token === "") {
    return null;
  }
  return token;
};

export const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!token || token === "undefined" || token === "null" || token === "") {
    return null;
  }
  return token;
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (accessToken && accessToken !== "undefined") {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }
  if (refreshToken && refreshToken !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  debugLog('setTokens', 'Tokens sauvegardés');
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  debugLog('clearTokens', 'Tokens supprimés');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    debugLog('request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR - CORRIGÉ
// ==========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

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
  (response) => {
    debugLog('response:success', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    debugLog('response:error', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Gérer les erreurs 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // Ne PAS tenter de refresh pour les routes d'auth
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        debugLog('401:skip', 'Route auth, pas de refresh');
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();

      // ✅ CORRECTION: Pas de refresh token = juste rejeter l'erreur
      // NE PAS REDIRIGER - laisser React gérer ça
      if (!refreshToken) {
        debugLog('401:noRefreshToken', 'Pas de refresh token, rejet simple');
        clearTokens();
        // ❌ SUPPRIMÉ: window.location.href = "/login";
        return Promise.reject(error);
      }

      // Si refresh déjà en cours, mettre en queue
      if (isRefreshing) {
        debugLog('401:queued', 'Refresh en cours, mise en queue');
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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        debugLog('401:refreshing', 'Tentative de refresh...');
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        debugLog('401:refreshSuccess', 'Token rafraîchi avec succès');

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);

      } catch (refreshError) {
        debugLog('401:refreshFailed', 'Échec du refresh');
        
        processQueue(refreshError as Error, null);
        clearTokens();
        
        // ✅ CORRECTION: NE PAS REDIRIGER
        // Laisser les composants React (ProtectedRoute) gérer la redirection
        // ❌ SUPPRIMÉ: window.location.href = "/login";
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// ERROR HELPERS (inchangé)
// ==========================================

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      return Array.isArray(message) ? message[0] : message;
    }
    
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    
    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection.";
    }
    
    if (!error.response) {
      return "Unable to reach the server. Please check your connection.";
    }
    
    switch (error.response.status) {
      case 400: return "Invalid request. Please check your input.";
      case 401: return "Authentication required. Please sign in.";
      case 403: return "Access denied. You don't have permission.";
      case 404: return "Resource not found.";
      case 409: return "Conflict. This resource already exists.";
      case 422: return "Validation error. Please check your input.";
      case 429: return "Too many requests. Please try again later.";
      case 500: return "Server error. Please try again later.";
      case 502:
      case 503: return "Service temporarily unavailable. Please try again.";
      default: return "An unexpected error occurred.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const isValidationError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && 
    (error.response?.status === 400 || error.response?.status === 422);
};

export const isAuthError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

export const isForbiddenError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
};

export const isNotFoundError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

export const isConflictError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 409;
};

export const isNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  return error.code === "ERR_NETWORK" || !error.response;
};

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