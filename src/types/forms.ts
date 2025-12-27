/**
 * Types pour les formulaires et DTOs
 * 
 * Ces types représentent les données envoyées au backend.
 * Ils sont alignés avec les DTOs NestJS côté API.
 */

import type { BadgeType, NotificationPreferences } from './entities';

// ==========================================
// AUTHENTIFICATION
// ==========================================

/**
 * Données de connexion
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Réponse de connexion
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

/**
 * Inscription client
 */
export interface RegisterClientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Inscription prestataire
 */
export interface RegisterPrestataireDto {
  email: string;
  password: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  categories: string[];
}

/**
 * Demande de réinitialisation mot de passe
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Réinitialisation mot de passe
 */
export interface ResetPasswordDto {
  token: string;
  password: string;
}

/**
 * Changement de mot de passe (connecté)
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Vérification email
 */
export interface VerifyEmailDto {
  token: string;
}

/**
 * Rafraîchissement du token
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

// ==========================================
// PROFIL UTILISATEUR
// ==========================================

/**
 * Mise à jour profil client
 */
export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  notificationPreferences?: NotificationPreferences;
}

/**
 * Mise à jour profil prestataire
 */
export interface UpdatePrestataireDto {
  businessName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  categories?: string[];
  phone?: string;
  avatar?: string;
  portfolioImages?: string[];
  openingHours?: Record<string, Array<{ start: string; end: string }>>;
  pauseDuration?: number;
  minBookingNotice?: number;
  minCancellationHours?: number;
  cancellationPolicy?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notificationPreferences?: NotificationPreferences;
}

// ==========================================
// SERVICES
// ==========================================

/**
 * Création d'un service
 */
export interface CreateServiceDto {
  name: string;
  description?: string;
  duration: number;  // Minutes
  price: number;     // Euros
  image?: string;
}

/**
 * Mise à jour d'un service
 */
export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
  displayOrder?: number;
  image?: string;
}

// ==========================================
// CRÉNEAUX
// ==========================================

/**
 * Création d'un créneau manuel
 */
export interface CreateSlotDto {
  date: string;       // Format YYYY-MM-DD
  startTime: string;  // Format HH:mm
  endTime: string;    // Format HH:mm
  serviceId?: string;
  notes?: string;
}

/**
 * Création de créneaux récurrents
 */
export interface CreateRecurringSlotsDto {
  startDate: string;           // Format YYYY-MM-DD
  endDate: string;             // Format YYYY-MM-DD
  daysOfWeek: number[];        // 0=Dimanche, 1=Lundi, etc.
  startTime: string;           // Format HH:mm
  endTime: string;             // Format HH:mm
  slotDuration: number;        // Durée de chaque créneau en minutes
  breakDuration?: number;      // Durée de pause entre créneaux en minutes
  serviceId?: string;
}

/**
 * Mise à jour d'un créneau
 */
export interface UpdateSlotDto {
  date?: string;
  startTime?: string;
  endTime?: string;
  serviceId?: string;
  notes?: string;
}

/**
 * Blocage de période
 */
export interface BlockSlotsDto {
  startDate: string;
  endDate: string;
  reason?: string;
}

// ==========================================
// RENDEZ-VOUS
// ==========================================

/**
 * Réservation d'un rendez-vous
 */
export interface BookAppointmentDto {
  slotId: string;
  serviceId: string;
  clientNote?: string;
}

/**
 * Annulation d'un rendez-vous
 */
export interface CancelAppointmentDto {
  reason?: string;
}

// ==========================================
// AVIS
// ==========================================

/**
 * Création d'un avis
 */
export interface CreateReviewDto {
  appointmentId: string;
  rating: number;              // 1-5
  qualityRating?: number;
  punctualityRating?: number;
  cleanlinessRating?: number;
  comment?: string;
}

/**
 * Mise à jour d'un avis (max 2 modifications)
 */
export interface UpdateReviewDto {
  rating?: number;
  qualityRating?: number;
  punctualityRating?: number;
  cleanlinessRating?: number;
  comment?: string;
}

/**
 * Réponse prestataire à un avis
 */
export interface ReviewResponseDto {
  response: string;
}

/**
 * Signalement d'un avis
 */
export interface FlagReviewDto {
  reason: string;
}

// ==========================================
// MESSAGES
// ==========================================

/**
 * Envoi d'un message
 */
export interface SendMessageDto {
  appointmentId: string;
  content: string;
}

/**
 * Signalement d'un message
 */
export interface FlagMessageDto {
  reason: string;
}

// ==========================================
// RECHERCHE
// ==========================================

/**
 * Paramètres de recherche prestataires
 */
export interface SearchDto {
  query?: string;
  categories?: string[];
  city?: string;
  postalCode?: string;
  minRating?: number;
  maxPrice?: number;
  badges?: BadgeType[];
  hasAvailability?: boolean;
  sortBy?: 'rating' | 'reviews' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ==========================================
// ADMIN
// ==========================================

/**
 * Suspension d'un utilisateur
 */
export interface SuspendUserDto {
  reason?: string;
}

/**
 * Rejet d'un prestataire
 */
export interface RejectPrestataireDto {
  reason: string;
}

// ==========================================
// UPLOAD
// ==========================================

/**
 * Réponse upload fichier
 */
export interface UploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}
