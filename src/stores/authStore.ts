/**
 * Store Zustand pour l'authentification
 *
 * Gère l'état global de l'authentification :
 * - Utilisateur connecté
 * - Profil (client ou prestataire)
 * - Actions de connexion/déconnexion
 *
 * Ce store persiste les données de session et gère
 * la connexion WebSocket automatiquement.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User, Client, Prestataire, UserRole } from "@/types";
import * as authService from "@/services/auth.service";
import { setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

// ==========================================
// TYPES
// ==========================================

interface AuthState {
  // État
  user: User | null;
  profile: Client | Prestataire | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (profile: Partial<Client | Prestataire>) => void;
  setUser: (user: User | null) => void;
}

// ==========================================
// STORE
// ==========================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      /**
       * Initialise l'état d'authentification
       * Appelé au démarrage de l'application pour vérifier
       * si l'utilisateur a une session valide
       */
      initialize: async () => {
        const token = getAccessToken();
        if (!token || token === "undefined") {
          set({ isAuthenticated: false, isInitialized: true });
          return;
        }

        // Éviter les appels multiples si déjà en cours
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
          const data = await authService.getMe();
          set({
            user: data.user,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          // Si erreur (ex: 429 ou token invalide), on arrête tout proprement
          set({
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
          console.error("Erreur initialisation auth:", error);
        }
      },

      /**
       * Connecte un utilisateur
       *
       * @param email - Email de l'utilisateur
       * @param password - Mot de passe
       * @throws Erreur si les identifiants sont invalides
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Appel API de connexion
          const response = await authService.login({ email, password });

          // Stocker les tokens
          setTokens(response.accessToken, response.refreshToken);

          // Récupérer le profil complet
          const { user, profile } = await authService.getMe();

          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connecter le WebSocket
          connectSocket();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Déconnecte l'utilisateur
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Erreur lors du logout:", error);
        } finally {
          // Toujours nettoyer l'état local
          clearTokens();
          disconnectSocket();

          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        }
      },

      /**
       * Met à jour le profil localement
       * Utilisé après une modification de profil réussie
       */
      updateProfile: (profileUpdate: Partial<Client | Prestataire>) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, ...profileUpdate } as
              | Client
              | Prestataire,
          });
        }
      },

      /**
       * Met à jour l'utilisateur
       */
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "bookme-auth",
      // Ne persister que certaines données (pas isLoading, etc.)
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ==========================================
// SÉLECTEURS
// ==========================================

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const useHasRole = (role: UserRole): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === role;
};

/**
 * Vérifie si l'utilisateur est un client
 */
export const useIsClient = (): boolean => {
  return useHasRole("CLIENT" as UserRole);
};

/**
 * Vérifie si l'utilisateur est un prestataire
 */
export const useIsPrestataire = (): boolean => {
  return useHasRole("PRESTATAIRE" as UserRole);
};

/**
 * Vérifie si l'utilisateur est un admin
 */
export const useIsAdmin = (): boolean => {
  return useHasRole("ADMIN" as UserRole);
};

/**
 * Récupère le profil client (typé)
 */
export const useClientProfile = (): Client | null => {
  const profile = useAuthStore((state) => state.profile);
  const isClient = useIsClient();
  return isClient ? (profile as Client) : null;
};

/**
 * Récupère le profil prestataire (typé)
 */
export const usePrestataireProfile = (): Prestataire | null => {
  const profile = useAuthStore((state) => state.profile);
  const isPrestataire = useIsPrestataire();
  return isPrestataire ? (profile as Prestataire) : null;
};
