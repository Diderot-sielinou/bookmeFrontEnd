/**
 * Hook useSocket
 * 
 * Gère la connexion WebSocket et les événements temps réel.
 * S'abonne aux notifications et messages et met à jour les stores.
 * ALIGNÉ AVEC LE BACKEND
 */

import { useEffect, useCallback, useRef } from 'react';

import {
  connectSocket,
  disconnectSocket,
  subscribeToNotifications,
  subscribeToNewMessages,
  subscribeToMessageNotifications,
  subscribeToMessagesRead,
  joinAppointmentRoom,
  leaveAppointmentRoom,
  isSocketConnected,
  type NotificationPayload,
} from '@/lib/socket';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { showInfo } from '@/components/ui/toast';
import { NotificationType } from '@/types';

// ==========================================
// TYPES
// ==========================================

export interface SocketMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface MessageNotification {
  appointmentId: string;
  preview: string;
}

export interface MessagesReadEvent {
  appointmentId: string;
  readBy: string;
}

// ==========================================
// MAIN SOCKET HOOK
// ==========================================

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
        userId: '',
        type: notification.type as NotificationType,
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
      // Cleanup handled by disconnectSocket
    };
  }, [isAuthenticated]);

  // Abonnement aux notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribeNotifications = subscribeToNotifications(handleNotification);

    return () => {
      unsubscribeNotifications();
    };
  }, [isAuthenticated, handleNotification]);

  return {
    isConnected: isSocketConnected(),
  };
}

// ==========================================
// MESSAGE SOCKET HOOKS
// ==========================================

/**
 * Hook pour les messages en temps réel dans une conversation
 * 
 * S'abonne à une room d'appointment pour recevoir les messages
 */
export function useMessageSocket(
  appointmentId: string | null,
  callbacks: {
    onNewMessage?: (message: SocketMessage) => void;
    onMessagesRead?: (event: MessagesReadEvent) => void;
  }
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { onNewMessage, onMessagesRead } = callbacks;

  // Rejoindre/quitter la room d'appointment
  useEffect(() => {
    if (!isAuthenticated || !appointmentId) return;

    joinAppointmentRoom(appointmentId);

    return () => {
      leaveAppointmentRoom(appointmentId);
    };
  }, [isAuthenticated, appointmentId]);

  // S'abonner aux nouveaux messages
  useEffect(() => {
    if (!isAuthenticated || !onNewMessage) return;

    const unsubscribe = subscribeToNewMessages((message: SocketMessage) => {
      // Filtrer pour l'appointment courant si spécifié
      if (!appointmentId || message.appointmentId === appointmentId) {
        onNewMessage(message);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, appointmentId, onNewMessage]);

  // S'abonner aux événements de lecture
  useEffect(() => {
    if (!isAuthenticated || !onMessagesRead) return;

    const unsubscribe = subscribeToMessagesRead((event: MessagesReadEvent) => {
      if (!appointmentId || event.appointmentId === appointmentId) {
        onMessagesRead(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, appointmentId, onMessagesRead]);
}

/**
 * Hook pour les notifications de messages (préview)
 * 
 * Utilisé pour mettre à jour la liste des conversations
 */
export function useMessageNotifications(
  onNotification?: (notification: MessageNotification) => void
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !onNotification) return;

    const unsubscribe = subscribeToMessageNotifications(onNotification);

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, onNotification]);
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