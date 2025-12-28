/**
 * Hook useAuth
 *
 * Gère l'authentification et expose les données utilisateur.
 * Wrapper autour du store Zustand avec logique additionnelle.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";
import { showError, showSuccess } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

/**
 * Hook d'authentification principal
 *
 * Fournit :
 * - État utilisateur (user, profile, isAuthenticated)
 * - Actions (login, logout, initialize)
 * - Helpers (isClient, isPrestataire, isAdmin)
 */
export function useAuth() {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,
    login: storeLogin,
    logout: storeLogout,
    initialize,
    updateProfile,
  } = useAuthStore();

  const navigate = useNavigate();

  // Initialiser au montage
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  /**
   * Connecte l'utilisateur et redirige selon le rôle
   */
  const login = async (email: string, password: string) => {
    try {
      await storeLogin(email, password);
      showSuccess("Login successful!");
      // Redirection selon le rôle
      const user = useAuthStore.getState().user;
      switch (user?.role) {
        case "CLIENT":
          navigate(ROUTES.CLIENT_DASHBOARD);
          break;
        case "PRESTATAIRE":
          navigate(ROUTES.PRESTATAIRE_DASHBOARD);
          break;
        case "ADMIN":
          navigate(ROUTES.ADMIN_DASHBOARD);
          break;
        default:
          navigate(ROUTES.HOME);
      }
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  /**
   * Déconnecte l'utilisateur et redirige vers login
   */
  const logout = async () => {
    try {
      await storeLogout();
       showSuccess('Logout successful'); 
      navigate(ROUTES.LOGIN);
    } catch (error) {
      // Même en cas d'erreur, on redirige
      navigate(ROUTES.LOGIN);
    }
  };

  // Helpers de rôle
  const isClient = user?.role === "CLIENT";
  const isPrestataire = user?.role === "PRESTATAIRE";
  const isAdmin = user?.role === "ADMIN";

  return {
    // État
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,

    // Actions
    login,
    logout,
    initialize,
    updateProfile,

    // Helpers
    isClient,
    isPrestataire,
    isAdmin,
  };
}

/**
 * Hook pour vérifier si l'utilisateur est connecté
 * Redirige vers login si non authentifié
 */
export function useRequireAuth(redirectTo = ROUTES.LOGIN) {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isInitialized, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading: !isInitialized || isLoading };
}

/**
 * Hook pour vérifier un rôle spécifique
 * Redirige si le rôle ne correspond pas
 */
export function useRequireRole(
  allowedRoles: Array<"CLIENT" | "PRESTATAIRE" | "ADMIN">,
  redirectTo = ROUTES.HOME
) {
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
      } else if (
        user &&
        !allowedRoles.includes(user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN")
      ) {
        navigate(redirectTo);
      }
    }
  }, [
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    allowedRoles,
    navigate,
    redirectTo,
  ]);

  return {
    isAuthorized: user
      ? allowedRoles.includes(user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN")
      : false,
    isLoading: !isInitialized || isLoading,
  };
}
