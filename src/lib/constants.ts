/**
 * Constantes de l'application BookMe
 * 
 * Ces valeurs sont alignées avec celles du backend
 * pour assurer la cohérence des données.
 */

// ==========================================
// CATÉGORIES PROFESSIONNELLES
// ==========================================

/**
 * Liste des catégories de services disponibles
 * Utilisée pour les filtres et la création de profil prestataire
 */
export const PROFESSIONAL_CATEGORIES = [
  'Coiffure',
  'Esthétique',
  'Massage',
  'Bien-être',
  'Sport & Fitness',
  'Médical',
  'Paramédical',
  'Conseil',
  'Coaching',
  'Formation',
  'Juridique',
  'Comptabilité',
  'Immobilier',
  'Artisanat',
  'Photographie',
  'Événementiel',
  'Autre',
] as const;

export type ProfessionalCategory = typeof PROFESSIONAL_CATEGORIES[number];

// ==========================================
// JOURS DE LA SEMAINE
// ==========================================

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', shortLabel: 'Dim' },
  { value: 1, label: 'Lundi', shortLabel: 'Lun' },
  { value: 2, label: 'Mardi', shortLabel: 'Mar' },
  { value: 3, label: 'Mercredi', shortLabel: 'Mer' },
  { value: 4, label: 'Jeudi', shortLabel: 'Jeu' },
  { value: 5, label: 'Vendredi', shortLabel: 'Ven' },
  { value: 6, label: 'Samedi', shortLabel: 'Sam' },
] as const;

export const DAYS_OF_WEEK_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

// ==========================================
// OPTIONS DE TRI
// ==========================================

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Note moyenne' },
  { value: 'reviews', label: 'Nombre d\'avis' },
  { value: 'price', label: 'Prix' },
  { value: 'name', label: 'Nom' },
] as const;

// ==========================================
// OPTIONS DE PAGINATION
// ==========================================

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

// ==========================================
// VALIDATION
// ==========================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  BIO_MAX_LENGTH: 500,
  SERVICE_NAME_MAX_LENGTH: 100,
  SERVICE_DESCRIPTION_MAX_LENGTH: 500,
  REVIEW_COMMENT_MIN_LENGTH: 10,
  REVIEW_COMMENT_MAX_LENGTH: 1000,
  REVIEW_RESPONSE_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 2000,
  PORTFOLIO_MAX_IMAGES: 10,
  FILE_MAX_SIZE_MB: 5,
  SERVICE_MIN_DURATION: 15,
  SERVICE_MAX_DURATION: 480,
} as const;

// ==========================================
// ICÔNES DE BADGES
// ==========================================

export const BADGE_INFO = {
  TOP_RATED: {
    icon: '🏆',
    label: 'Top Prestataire',
    description: 'Note ≥ 4.5 avec minimum 10 avis',
    color: 'bg-yellow-100 text-yellow-800',
  },
  RESPONSIVE: {
    icon: '⚡',
    label: 'Réactif',
    description: 'Répond rapidement aux demandes',
    color: 'bg-blue-100 text-blue-800',
  },
  RELIABLE: {
    icon: '💎',
    label: 'Fiable',
    description: 'Taux d\'annulation < 5%',
    color: 'bg-green-100 text-green-800',
  },
  POPULAR: {
    icon: '🌟',
    label: 'Populaire',
    description: 'Plus de 50 rendez-vous sur 3 mois',
    color: 'bg-purple-100 text-purple-800',
  },
} as const;

// ==========================================
// TYPES DE NOTIFICATION
// ==========================================

export const NOTIFICATION_INFO = {
  NEW_BOOKING: {
    icon: '📅',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  CANCELLATION: {
    icon: '❌',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  REMINDER: {
    icon: '⏰',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  NEW_REVIEW: {
    icon: '⭐',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
  },
  NEW_MESSAGE: {
    icon: '💬',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  BADGE_EARNED: {
    icon: '🏅',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
  },
  SYSTEM: {
    icon: 'ℹ️',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
} as const;

// ==========================================
// ROUTES DE L'APPLICATION
// ==========================================

export const ROUTES = {
  // Public
  HOME: '/',
  SEARCH: '/search',
  PRESTATAIRE_PUBLIC_PROFILE: '/prestataires/:id',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Client
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_APPOINTMENTS: '/client/appointments',
  CLIENT_APPOINTMENT_DETAIL: '/client/appointments/:id',
  CLIENT_MESSAGES: '/client/messages',
  CLIENT_REVIEWS: '/client/reviews',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_NOTIFICATIONS: '/client/notifications',
  
  // Prestataire
  PRESTATAIRE_DASHBOARD: '/prestataire/dashboard',
  PRESTATAIRE_PROFILE: '/prestataire/profile',
  PRESTATAIRE_SERVICES: '/prestataire/services',
  PRESTATAIRE_SLOTS: '/prestataire/slots',
  PRESTATAIRE_APPOINTMENTS: '/prestataire/appointments',
  PRESTATAIRE_APPOINTMENT_DETAIL: '/prestataire/appointments/:id',
  PRESTATAIRE_REVIEWS: '/prestataire/reviews',
  PRESTATAIRE_MESSAGES: '/prestataire/messages',
  PRESTATAIRE_SETTINGS: '/prestataire/settings',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRESTATAIRES_VALIDATION: '/admin/prestataires/validation',
  ADMIN_REVIEWS_MODERATION: '/admin/reviews/moderation',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_LOGS: '/admin/logs',
} as const;

// ==========================================
// DURÉES DE CACHE (en millisecondes)
// ==========================================

export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 heure
} as const;

// ==========================================
// MESSAGES D'ERREUR
// ==========================================

export const ERROR_MESSAGES = {
  GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  NETWORK: 'Problème de connexion. Vérifiez votre réseau.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Vous n\'avez pas les droits pour effectuer cette action.',
  NOT_FOUND: 'La ressource demandée n\'existe pas.',
  VALIDATION: 'Les données saisies ne sont pas valides.',
} as const;

// ==========================================
// MESSAGES DE SUCCÈS
// ==========================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie !',
  LOGOUT: 'Déconnexion réussie.',
  REGISTER: 'Inscription réussie ! Vérifiez votre email.',
  PASSWORD_RESET_REQUEST: 'Email de réinitialisation envoyé.',
  PASSWORD_RESET: 'Mot de passe modifié avec succès.',
  PROFILE_UPDATE: 'Profil mis à jour avec succès.',
  BOOKING: 'Rendez-vous réservé avec succès !',
  BOOKING_CANCEL: 'Rendez-vous annulé.',
  REVIEW_CREATE: 'Merci pour votre avis !',
  REVIEW_UPDATE: 'Avis mis à jour.',
  MESSAGE_SENT: 'Message envoyé.',
  SERVICE_CREATE: 'Service créé.',
  SERVICE_UPDATE: 'Service mis à jour.',
  SERVICE_DELETE: 'Service supprimé.',
  SLOT_CREATE: 'Créneau créé.',
  SLOT_UPDATE: 'Créneau mis à jour.',
  SLOT_DELETE: 'Créneau supprimé.',
} as const;
