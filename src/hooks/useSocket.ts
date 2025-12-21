/**
 * Hook useSocket
 * 
 * Gère la connexion WebSocket et les événements temps réel.
 * S'abonne aux notifications et met à jour le store.
 */

import { useEffect, useCallback } from 'react';

import {
  connectSocket,
  disconnectSocket,
  subscribeToNotifications,
  subscribeToNewMessages,
  isSocketConnected,
  type NotificationPayload,
} from '@/lib/socket';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { showInfo } from '@/components/ui/toast';

/**
 * Hook principal pour les WebSockets
 * 
 * Gère automatiquement :
 * - La connexion/déconnexion selon l'état d'authentification
 * - L'abonnement aux événements de notification
 * - La mise à jour du store de notifications
 */
export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Callback pour les nouvelles notifications
  const handleNotification = useCallback(
    (notification: NotificationPayload) => {
      // Ajouter au store
      addNotification({
        id: notification.id,
        userId: '', // Rempli par le serveur
        type: notification.type as never,
        title: notification.title,
        message: notification.message,
        relatedId: notification.relatedId || null,
        data: notification.data || null,
        read: false,
        readAt: null,
        emailSent: false,
        createdAt: notification.createdAt,
      });

      // Afficher un toast
      showInfo(notification.title, notification.message);
    },
    [addNotification]
  );

  // Connexion/déconnexion selon l'authentification
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      // Cleanup à la déconnexion
    };
  }, [isAuthenticated]);

  // Abonnement aux notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    // S'abonner aux notifications générales
    const unsubscribeNotifications = subscribeToNotifications(handleNotification);

    return () => {
      unsubscribeNotifications();
    };
  }, [isAuthenticated, handleNotification]);

  return {
    isConnected: isSocketConnected(),
  };
}

/**
 * Hook pour les notifications de messages
 * 
 * S'abonne spécifiquement aux nouveaux messages
 * pour mettre à jour l'interface de chat.
 */
export function useMessageSocket<T = NotificationPayload>(
  onNewMessage?: (message: T) => void
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !onNewMessage) return;

    const unsubscribe = subscribeToNewMessages(onNewMessage as (data: NotificationPayload) => void);

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, onNewMessage]);
}

/**
 * Hook pour vérifier l'état de connexion WebSocket
 */
export function useSocketStatus() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    isConnected: isAuthenticated && isSocketConnected(),
    shouldBeConnected: isAuthenticated,
  };
}
