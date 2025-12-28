/**
 * Application Constants
 * 
 * All constants aligned with backend for data consistency.
 */

// ==========================================
// PROFESSIONAL CATEGORIES
// ==========================================

/**
 * Available service categories
 * Used for filters and provider profile creation
 */
export const PROFESSIONAL_CATEGORIES = [
  'Hair Salon',
  'Beauty',
  'Massage',
  'Wellness',
  'Sports & Fitness',
  'Medical',
  'Paramedical',
  'Consulting',
  'Coaching',
  'Training',
  'Legal',
  'Accounting',
  'Real Estate',
  'Handcraft',
  'Photography',
  'Events',
  'Other',
] as const;

export type ProfessionalCategory = typeof PROFESSIONAL_CATEGORIES[number];

// ==========================================
// DAYS OF WEEK
// ==========================================

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', shortLabel: 'Sun' },
  { value: 1, label: 'Monday', shortLabel: 'Mon' },
  { value: 2, label: 'Tuesday', shortLabel: 'Tue' },
  { value: 3, label: 'Wednesday', shortLabel: 'Wed' },
  { value: 4, label: 'Thursday', shortLabel: 'Thu' },
  { value: 5, label: 'Friday', shortLabel: 'Fri' },
  { value: 6, label: 'Saturday', shortLabel: 'Sat' },
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
// SORT OPTIONS
// ==========================================

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Average Rating' },
  { value: 'reviews', label: 'Number of Reviews' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'Name' },
] as const;

// ==========================================
// PAGINATION OPTIONS
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
// BADGE INFO
// ==========================================

export const BADGE_INFO = {
  TOP_RATED: {
    icon: '🏆',
    label: 'Top Provider',
    description: 'Rating ≥ 4.5 with minimum 10 reviews',
    color: 'bg-yellow-100 text-yellow-800',
  },
  RESPONSIVE: {
    icon: '⚡',
    label: 'Responsive',
    description: 'Responds quickly to requests',
    color: 'bg-blue-100 text-blue-800',
  },
  RELIABLE: {
    icon: '💎',
    label: 'Reliable',
    description: 'Cancellation rate < 5%',
    color: 'bg-green-100 text-green-800',
  },
  POPULAR: {
    icon: '🌟',
    label: 'Popular',
    description: '50+ appointments in 3 months',
    color: 'bg-purple-100 text-purple-800',
  },
} as const;

// ==========================================
// NOTIFICATION INFO
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
// ROUTES
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
  
  // Provider
  PRESTATAIRE_DASHBOARD: '/prestataire/dashboard',
  PRESTATAIRE_PROFILE: '/prestataire/profile',
  PRESTATAIRE_SERVICES: '/prestataire/services',
  PRESTATAIRE_SLOTS: '/prestataire/slots',
  PRESTATAIRE_APPOINTMENTS: '/prestataire/appointments',
  PRESTATAIRE_APPOINTMENT_DETAIL: '/prestataire/appointments/:id',
  PRESTATAIRE_REVIEWS: '/prestataire/reviews',
  PRESTATAIRE_MESSAGES: '/prestataire/messages',
  PRESTATAIRE_NOTIFICATION: '/prestataire/notifications',
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
// CACHE DURATIONS (in milliseconds)
// ==========================================

export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'The provided data is invalid.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

// ==========================================
// SUCCESS MESSAGES
// ==========================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully signed in!',
  LOGOUT: 'Successfully signed out.',
  REGISTER: 'Registration successful! Please check your email.',
  PASSWORD_RESET_REQUEST: 'Password reset email sent.',
  PASSWORD_RESET: 'Password successfully changed.',
  PROFILE_UPDATE: 'Profile updated successfully.',
  BOOKING: 'Appointment booked successfully!',
  BOOKING_CANCEL: 'Appointment cancelled.',
  REVIEW_CREATE: 'Thank you for your review!',
  REVIEW_UPDATE: 'Review updated.',
  MESSAGE_SENT: 'Message sent.',
  SERVICE_CREATE: 'Service created.',
  SERVICE_UPDATE: 'Service updated.',
  SERVICE_DELETE: 'Service deleted.',
  SLOT_CREATE: 'Time slot created.',
  SLOT_UPDATE: 'Time slot updated.',
  SLOT_DELETE: 'Time slot deleted.',
} as const;