/**
 * WebSocket client configuration
 * 
 * Gère la connexion WebSocket avec le backend NestJS
 * ALIGNÉ AVEC LE BACKEND
 */

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

// ==========================================
// TYPES
// ==========================================

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string | null;
  data?: Record<string, unknown> | null;
  createdAt: string;
}

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
// SOCKET CONFIGURATION
// ==========================================

const SOCKET_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socket: Socket | null = null;

/**
 * Connecte au serveur WebSocket
 */
export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = getAccessToken();

  socket = io(`${SOCKET_BASE_URL}/notifications`, {
    auth: { token },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  socket.on('pong', (data) => {
    console.log('[Socket] Pong received:', data);
  });

  return socket;
}

/**
 * Déconnecte du serveur WebSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Vérifie si le socket est connecté
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Récupère l'instance du socket
 */
export function getSocket(): Socket | null {
  return socket;
}

// ==========================================
// ROOM MANAGEMENT
// ==========================================

/**
 * Rejoint une room d'appointment pour recevoir les messages
 */
export function joinAppointmentRoom(appointmentId: string): void {
  if (socket?.connected) {
    socket.emit('join-appointment', { appointmentId });
  }
}

/**
 * Quitte une room d'appointment
 */
export function leaveAppointmentRoom(appointmentId: string): void {
  if (socket?.connected) {
    socket.emit('leave-appointment', { appointmentId });
  }
}

// ==========================================
// EVENT SUBSCRIPTIONS
// ==========================================

type UnsubscribeFn = () => void;

/**
 * S'abonne aux notifications générales
 */
export function subscribeToNotifications(
  callback: (notification: NotificationPayload) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('notification', callback);
  return () => {
    socket?.off('notification', callback);
  };
}

/**
 * S'abonne aux nouveaux messages (dans une room)
 */
export function subscribeToNewMessages(
  callback: (message: SocketMessage) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('new-message', callback);
  return () => {
    socket?.off('new-message', callback);
  };
}

/**
 * S'abonne aux notifications de messages (preview)
 */
export function subscribeToMessageNotifications(
  callback: (notification: MessageNotification) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('message-notification', callback);
  return () => {
    socket?.off('message-notification', callback);
  };
}

/**
 * S'abonne aux événements de lecture de messages
 */
export function subscribeToMessagesRead(
  callback: (event: MessagesReadEvent) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('messages-read', callback);
  return () => {
    socket?.off('messages-read', callback);
  };
}

/**
 * S'abonne aux nouvelles réservations (prestataire)
 */
export function subscribeToNewBookings(
  callback: (data: { appointmentId: string }) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('new-booking', callback);
  return () => {
    socket?.off('new-booking', callback);
  };
}

/**
 * S'abonne aux annulations de réservation
 */
export function subscribeToBookingCancelled(
  callback: (data: { appointmentId: string; cancelledBy: string }) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('booking-cancelled', callback);
  return () => {
    socket?.off('booking-cancelled', callback);
  };
}

/**
 * S'abonne aux nouveaux avis (prestataire)
 */
export function subscribeToNewReviews(
  callback: (data: { reviewId: string; rating: number }) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('new-review', callback);
  return () => {
    socket?.off('new-review', callback);
  };
}

/**
 * S'abonne aux badges gagnés
 */
export function subscribeToBadgeEarned(
  callback: (data: { badgeType: string }) => void
): UnsubscribeFn {
  if (!socket) return () => {};

  socket.on('badge-earned', callback);
  return () => {
    socket?.off('badge-earned', callback);
  };
}