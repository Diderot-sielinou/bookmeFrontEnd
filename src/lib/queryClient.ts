/**
 * Configuration de TanStack Query (React Query)
 * 
 * Configure le client de cache avec des options par défaut
 * optimisées pour l'application BookMe.
 */

import { QueryClient } from '@tanstack/react-query';

// ==========================================
// TEMPS DE CACHE
// ==========================================

export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 heure
};

/**
 * Instance du QueryClient avec configuration par défaut
 * 
 * Options configurées :
 * - staleTime: Temps avant qu'une donnée soit considérée périmée
 * - gcTime: Temps de conservation en cache (garbage collection)
 * - retry: Nombre de tentatives en cas d'échec
 * - refetchOnWindowFocus: Rafraîchir au retour sur l'onglet
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Les données sont fraîches pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Conserver en cache pendant 30 minutes
      gcTime: 30 * 60 * 1000,
      
      // Une seule tentative en cas d'échec
      retry: 1,
      
      // Ne pas rafraîchir automatiquement au focus
      refetchOnWindowFocus: false,
      
      // Ne pas rafraîchir à la reconnexion
      refetchOnReconnect: false,
    },
    mutations: {
      // Pas de retry sur les mutations
      retry: 0,
    },
  },
});

// ==========================================
// CLÉS DE CACHE
// ==========================================

/**
 * Clés de cache standardisées pour React Query
 * 
 * Organisation hiérarchique :
 * - Niveau 1 : Domaine (appointments, slots, etc.)
 * - Niveau 2 : Type de requête (list, detail, etc.)
 * - Niveau 3+ : Paramètres (id, filtres, etc.)
 */
export const queryKeys = {
  // Authentification
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Rendez-vous
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.appointments.lists(), filters] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
    today: () => [...queryKeys.appointments.all, 'today'] as const,
  },
  
  // Créneaux
  slots: {
    all: ['slots'] as const,
    lists: () => [...queryKeys.slots.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.slots.lists(), filters] as const,
    details: () => [...queryKeys.slots.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.slots.details(), id] as const,
    available: (prestataireId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.slots.all, 'available', prestataireId, filters] as const,
  },
  
  // Prestataires
  prestataires: {
    all: ['prestataires'] as const,
    lists: () => [...queryKeys.prestataires.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.prestataires.lists(), filters] as const,
    details: () => [...queryKeys.prestataires.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.prestataires.details(), id] as const,
    search: (filters?: Record<string, unknown>) =>
      [...queryKeys.prestataires.all, 'search', filters] as const,
  },
  
  // Services
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (prestataireId?: string) =>
      [...queryKeys.services.lists(), prestataireId] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.services.details(), id] as const,
  },
  
  // Avis
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.reviews.lists(), filters] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    byPrestataire: (prestataireId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.reviews.all, 'prestataire', prestataireId, filters] as const,
    stats: (prestataireId: string) =>
      [...queryKeys.reviews.all, 'stats', prestataireId] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    byAppointment: (appointmentId: string) =>
      [...queryKeys.messages.all, 'appointment', appointmentId] as const,
    unreadCount: () => [...queryKeys.messages.all, 'unread'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, 'list', filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    appointmentsByDay: (days?: number) =>
      [...queryKeys.dashboard.all, 'appointments-by-day', days] as const,
    revenueByMonth: (months?: number) =>
      [...queryKeys.dashboard.all, 'revenue-by-month', months] as const,
    ratingDistribution: () =>
      [...queryKeys.dashboard.all, 'rating-distribution'] as const,
  },
  
  // Badges
  badges: {
    all: ['badges'] as const,
    byPrestataire: (prestataireId: string) =>
      [...queryKeys.badges.all, 'prestataire', prestataireId] as const,
    my: () => [...queryKeys.badges.all, 'my'] as const,
  },
};

// ==========================================
// HELPERS D'INVALIDATION
// ==========================================

/**
 * Invalide toutes les requêtes liées aux rendez-vous
 */
export const invalidateAppointments = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
};

/**
 * Invalide toutes les requêtes liées aux créneaux
 */
export const invalidateSlots = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
};

/**
 * Invalide toutes les requêtes liées aux messages
 */
export const invalidateMessages = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
};

/**
 * Invalide toutes les requêtes liées aux notifications
 */
export const invalidateNotifications = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
};

/**
 * Invalide toutes les requêtes liées aux avis
 */
export const invalidateReviews = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
};

/**
 * Invalide toutes les requêtes du dashboard
 */
export const invalidateDashboard = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
};
