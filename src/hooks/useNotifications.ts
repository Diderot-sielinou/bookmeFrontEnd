/**
 * Hook useNotifications - CORRIGÉ
 * 
 * Fichier: src/hooks/useNotifications.ts
 * 
 * CORRECTION: Ajout de `enabled` pour ne pas faire de requêtes si non authentifié
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as notificationsService from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { queryKeys } from '@/lib/queryClient';
import { showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';

// ==========================================
// QUERIES
// ==========================================

/**
 * Récupère les notifications depuis l'API
 */
export function useNotificationsQuery(options?: {
  read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}) {
  // ✅ CORRECTION: Vérifier l'authentification
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: queryKeys.notifications.list(options),
    queryFn: () => notificationsService.getNotifications(options),
    // ✅ Ne faire la requête que si authentifié
    enabled: isAuthenticated && isInitialized,
  });
}

/**
 * Récupère le compteur de notifications non lues
 */
export function useUnreadCountQuery() {
  // ✅ CORRECTION: Vérifier l'authentification
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsService.getUnreadCount,
    // ✅ Ne faire la requête que si authentifié
    enabled: isAuthenticated && isInitialized,
    // Rafraîchir régulièrement
    refetchInterval: isAuthenticated ? 60 * 1000 : false, // 1 minute, seulement si authentifié
  });
}

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Marque une notification comme lue
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore((state) => state.markAsRead);

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: async (id) => {
      // Optimistic update dans le store
      storeMarkAsRead(id);
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Marque toutes les notifications comme lues
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead
  );

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: async () => {
      // Optimistic update dans le store
      storeMarkAllAsRead();
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// HOOK COMBINÉ
// ==========================================

/**
 * Hook principal pour les notifications
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  
  // ✅ CORRECTION: Vérifier l'authentification
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Store Zustand
  const {
    notifications: storeNotifications,
    unreadCount: storeUnreadCount,
    isLoading: storeIsLoading,
    fetchNotifications,
    fetchUnreadCount,
    clearNotifications,
  } = useNotificationStore();

  // Queries (seront désactivées si non authentifié grâce à `enabled`)
  const notificationsQuery = useNotificationsQuery({ limit: 20 });
  const unreadQuery = useUnreadCountQuery();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Synchroniser le store avec les queries au montage
  useEffect(() => {
    if (notificationsQuery.data) {
      // Le store sera mis à jour par WebSocket
    }
  }, [notificationsQuery.data]);

  const notifications =
    storeNotifications.length > 0
      ? storeNotifications
      : notificationsQuery.data?.data ?? [];

  const unreadCount = storeUnreadCount || unreadQuery.data || 0;

  return {
    // Data
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0,

    // États
    isLoading: storeIsLoading || notificationsQuery.isLoading,
    error: notificationsQuery.error,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refresh: () => {
      // ✅ Ne rafraîchir que si authentifié
      if (isAuthenticated) {
        fetchNotifications();
        fetchUnreadCount();
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      }
    },
    clear: clearNotifications,

    // États des mutations
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

/**
 * Hook pour le badge de notifications (header)
 * Version légère qui ne charge que le compteur
 */
export function useNotificationBadge() {
  // ✅ CORRECTION: Vérifier l'authentification
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const unreadQuery = useUnreadCountQuery(); // Cette query est maintenant protégée

  // ✅ Retourner 0 si non authentifié
  if (!isAuthenticated) {
    return {
      count: 0,
      hasUnread: false,
    };
  }

  return {
    count: unreadCount || unreadQuery.data || 0,
    hasUnread: (unreadCount || unreadQuery.data || 0) > 0,
  };
}