/**
 * Hook useNotifications
 * 
 * Gestion des notifications avec React Query et Zustand.
 * Combine les données serveur avec les mises à jour temps réel.
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as notificationsService from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notificationStore';
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
  return useQuery({
    queryKey: queryKeys.notifications.list(options),
    queryFn: () => notificationsService.getNotifications(options),
  });
}

/**
 * Récupère le compteur de notifications non lues
 */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsService.getUnreadCount,
    // Rafraîchir régulièrement
    refetchInterval: 60 * 1000, // 1 minute
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
      // TODO: Rollback optimistic update
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
 * 
 * Combine :
 * - Les données du store Zustand (temps réel)
 * - Les queries React Query (persistance)
 * - Les mutations pour les actions
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  // Store Zustand
  const {
    notifications: storeNotifications,
    unreadCount: storeUnreadCount,
    isLoading: storeIsLoading,
    fetchNotifications,
    fetchUnreadCount,
    clearNotifications,
  } = useNotificationStore();

  // Queries
  const notificationsQuery = useNotificationsQuery({ limit: 20 });
  const unreadQuery = useUnreadCountQuery();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Synchroniser le store avec les queries au montage
  useEffect(() => {
    if (notificationsQuery.data) {
      // Le store sera mis à jour par WebSocket
      // Les queries servent de fallback
    }
  }, [notificationsQuery.data]);

  // Utiliser les données du store en priorité (temps réel)
  // Fallback sur les queries si le store est vide
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
      fetchNotifications();
      fetchUnreadCount();
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
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
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const unreadQuery = useUnreadCountQuery();

  return {
    count: unreadCount || unreadQuery.data || 0,
    hasUnread: (unreadCount || unreadQuery.data || 0) > 0,
  };
}
