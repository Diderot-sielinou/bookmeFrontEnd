/**
 * Client API Axios avec gestion automatique des tokens JWT
 *
 * Ce module configure axios avec :
 * - Injection automatique du token d'accès dans les headers
 * - Rafraîchissement automatique du token si expiré (401)
 * - Gestion des erreurs centralisée
 * - Retry automatique après refresh du token
 */

import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import qs from 'qs';

// ==========================================
// CONFIGURATION DE BASE
// ==========================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Instance axios configurée pour l'API BookMe
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 secondes
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

// ==========================================
// GESTION DES TOKENS
// ==========================================

const TOKEN_KEY = "bookme_access_token";
const REFRESH_TOKEN_KEY = "bookme_refresh_token";

/**
 * Récupère le token d'accès depuis le localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Récupère le refresh token depuis le localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Sauvegarde les tokens dans le localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  console.log(`accessToken :${accessToken} and refreshToken: ${refreshToken}`);
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Supprime les tokens (logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Vérifie si l'utilisateur est connecté (a un token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// ==========================================
// INTERCEPTEUR DE REQUÊTE
// Ajoute automatiquement le token aux headers
// ==========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // Ajoute le token d'authentification si disponible
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
// INTERCEPTEUR DE RÉPONSE
// Gère le refresh automatique du token et les erreurs
// ==========================================

/**
 * Variable pour éviter les appels multiples au refresh endpoint
 * pendant qu'un refresh est en cours
 */
let isRefreshing = false;

/**
 * File d'attente des requêtes en attente pendant le refresh
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Traite la file d'attente après un refresh réussi ou échoué
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
  // Cas succès : retourner la réponse telle quelle
  (response) => response,

  // Cas erreur : gérer le refresh du token si 401
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Vérifie si c'est une erreur 401 (non autorisé) et que ce n'est pas déjà un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = getRefreshToken();

      // Si le token est null, "undefined" (string) ou vide, on ne tente même pas le refresh
      if (!token || token === "undefined") {
        console.warn("Pas de refresh token valide trouvé. Redirection login.");
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }
      // Si c'est la route de login ou refresh, ne pas tenter de refresh
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      // Si un refresh est déjà en cours, mettre la requête en file d'attente
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

      // Marquer comme retry pour éviter les boucles infinies
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // Pas de refresh token, déconnecter l'utilisateur
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Tenter de rafraîchir le token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Sauvegarder les nouveaux tokens
        setTokens(accessToken, newRefreshToken);

        // Traiter la file d'attente avec le nouveau token
        processQueue(null, accessToken);

        // Relancer la requête originale avec le nouveau token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Échec du refresh, déconnecter l'utilisateur
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Pour les autres erreurs, les propager
    return Promise.reject(error);
  }
);

// ==========================================
// HELPERS POUR LES ERREURS API
// ==========================================

/**
 * Extrait le message d'erreur d'une réponse API
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Erreur avec réponse du serveur
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      return Array.isArray(message) ? message[0] : message;
    }
    // Erreur réseau
    if (error.code === "ECONNABORTED") {
      return "La requête a expiré. Veuillez réessayer.";
    }
    if (!error.response) {
      return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }
  }

  // Erreur générique
  return "Une erreur inattendue est survenue.";
};

/**
 * Vérifie si une erreur est une erreur de validation (400)
 */
export const isValidationError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 400;
};

/**
 * Vérifie si une erreur est une erreur d'authentification (401)
 */
export const isAuthError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

/**
 * Vérifie si une erreur est une erreur de permission (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
};

/**
 * Vérifie si une erreur est une erreur "non trouvé" (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

export default api;
