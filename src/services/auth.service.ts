/**
 * Service d'authentification
 * 
 * Gère toutes les opérations liées à l'authentification :
 * - Connexion / Déconnexion
 * - Inscription client et prestataire
 * - Vérification email
 * - Réinitialisation mot de passe
 * - Gestion des tokens
 */

import { api, setTokens, clearTokens } from '@/lib/api';
import type {
  User,
  Client,
  Prestataire,
} from '@/types/entities';
import type {
  LoginDto,
  LoginResponse,
  RegisterClientDto,
  RegisterPrestataireDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  RefreshTokenDto,
} from '@/types/forms';

// ==========================================
// TYPES DE RÉPONSE
// ==========================================

interface MeResponse {
  user: User;
  profile: Client | Prestataire;
}

// ==========================================
// CONNEXION / DÉCONNEXION
// ==========================================

/**
 * Connecte un utilisateur avec email et mot de passe
 * Stocke automatiquement les tokens reçus
 */
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  
  // Stocker les tokens
  setTokens(response.data.accessToken, response.data.refreshToken);
  
  return response.data;
};

/**
 * Déconnecte l'utilisateur
 * Révoque le refresh token côté serveur et supprime les tokens locaux
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    // Toujours nettoyer les tokens, même en cas d'erreur
    clearTokens();
  }
};

/**
 * Rafraîchit le token d'accès
 */
export const refreshToken = async (data: RefreshTokenDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/refresh', data);
  
  // Mettre à jour les tokens
  setTokens(response.data.accessToken, response.data.refreshToken);
  
  return response.data;
};

// ==========================================
// INSCRIPTION
// ==========================================

/**
 * Inscrit un nouveau client
 */
export const registerClient = async (data: RegisterClientDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/register/client', data);
  return response.data;
};

/**
 * Inscrit un nouveau prestataire
 */
export const registerPrestataire = async (data: RegisterPrestataireDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/register/prestataire', data);
  return response.data;
};

// ==========================================
// VÉRIFICATION EMAIL
// ==========================================

/**
 * Vérifie l'email avec le token reçu par email
 */
export const verifyEmail = async (data: VerifyEmailDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/verify-email', data);
  return response.data;
};

/**
 * Renvoie l'email de vérification
 */
export const resendVerificationEmail = async (): Promise<{ message: string }> => {
  const response = await api.post('/auth/resend-verification');
  return response.data;
};

// ==========================================
// MOT DE PASSE
// ==========================================

/**
 * Demande un email de réinitialisation de mot de passe
 */
export const forgotPassword = async (data: ForgotPasswordDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Réinitialise le mot de passe avec le token reçu par email
 */
export const resetPassword = async (data: ResetPasswordDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

/**
 * Change le mot de passe (utilisateur connecté)
 */
export const changePassword = async (data: ChangePasswordDto): Promise<{ message: string }> => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

// ==========================================
// PROFIL UTILISATEUR
// ==========================================

/**
 * Récupère les informations de l'utilisateur connecté
 * Inclut le profil (client ou prestataire selon le rôle)
 */
export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>('/auth/me');
  return response.data;
};

/**
 * Met à jour le profil client
 */
export const updateClientProfile = async (data: Partial<Client>): Promise<Client> => {
  const response = await api.patch<Client>('/clients/profile', data);
  return response.data;
};

/**
 * Met à jour le profil prestataire
 */
export const updatePrestataireProfile = async (data: Partial<Prestataire>): Promise<Prestataire> => {
  const response = await api.patch<Prestataire>('/prestataires/profile', data);
  return response.data;
};

// ==========================================
// EXPORT GROUPÉ
// ==========================================

export const authService = {
  login,
  logout,
  refreshToken,
  registerClient,
  registerPrestataire,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateClientProfile,
  updatePrestataireProfile,
};
