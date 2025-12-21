/**
 * Configuration du client Socket.io pour les notifications temps réel
 * 
 * Ce module gère :
 * - La connexion WebSocket au namespace /notifications
 * - L'authentification via JWT
 * - La reconnexion automatique
 * - Les événements de notification
 */

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

// ==========================================
// CONFIGURATION
// ==========================================

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Instance du socket (singleton)
 * Le socket est créé mais pas connecté automatiquement
 */
let socket: Socket | null = null;

// ==========================================
// TYPES D'ÉVÉNEMENTS
// ==========================================

/**
 * Types d'événements reçus du serveur
 */
export type SocketEventType = 
  | 'notification'
  | 'new-booking'
  | 'booking-cancelled'
  | 'new-message'
  | 'new-review'
  | 'badge-earned';

/**
 * Payload d'une notification
 */
export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Type pour les callbacks d'événements
 */
export type SocketEventCallback<T = unknown> = (data: T) => void;

// ==========================================
// GESTION DU SOCKET
// ==========================================

/**
 * Crée et configure le socket
 * Appelé lors de la connexion utilisateur
 */
export const createSocket = (): Socket => {
  // Si un socket existe déjà, le retourner
  if (socket?.connected) {
    return socket;
  }
  
  // Créer un nouveau socket avec authentification JWT
  socket = io(`${SOCKET_URL}/notifications`, {
    // Authentification via le token JWT
    auth: {
      token: getAccessToken(),
    },
    // Options de connexion
    autoConnect: false,           // Ne pas connecter automatiquement
    reconnection: true,           // Activer la reconnexion automatique
    reconnectionAttempts: 5,      // Nombre max de tentatives
    reconnectionDelay: 1000,      // Délai initial entre tentatives (ms)
    reconnectionDelayMax: 5000,   // Délai max entre tentatives (ms)
    timeout: 10000,               // Timeout de connexion (ms)
    transports: ['websocket', 'polling'], // Protocoles de transport
  });
  
  // Gestionnaire de connexion réussie
  socket.on('connect', () => {
    console.log('[Socket] Connecté au serveur de notifications');
  });
  
  // Gestionnaire de déconnexion
  socket.on('disconnect', (reason) => {
    console.log('[Socket] Déconnecté:', reason);
    
    // Si la déconnexion est côté serveur, tenter de reconnecter
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });
  
  // Gestionnaire d'erreur de connexion
  socket.on('connect_error', (error) => {
    console.error('[Socket] Erreur de connexion:', error.message);
    
    // Si l'erreur est liée à l'authentification, ne pas tenter de reconnecter
    if (error.message.includes('unauthorized') || error.message.includes('jwt')) {
      socket?.disconnect();
    }
  });
  
  // Gestionnaire de reconnexion réussie
  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket] Reconnecté après', attemptNumber, 'tentative(s)');
  });
  
  // Gestionnaire d'échec de reconnexion
  socket.on('reconnect_failed', () => {
    console.error('[Socket] Échec de la reconnexion après toutes les tentatives');
  });
  
  return socket;
};

/**
 * Connecte le socket au serveur
 * Appelé après la connexion utilisateur
 */
export const connectSocket = (): void => {
  if (!socket) {
    socket = createSocket();
  }
  
  // Mettre à jour le token d'authentification
  socket.auth = { token: getAccessToken() };
  
  // Connecter si pas déjà connecté
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Déconnecte le socket du serveur
 * Appelé lors de la déconnexion utilisateur
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Vérifie si le socket est connecté
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

/**
 * Obtient l'instance du socket (peut être null)
 */
export const getSocket = (): Socket | null => {
  return socket;
};

// ==========================================
// ABONNEMENT AUX ÉVÉNEMENTS
// ==========================================

/**
 * S'abonne à un événement du socket
 * Retourne une fonction pour se désabonner
 */
export const subscribeToEvent = <T>(
  event: SocketEventType,
  callback: SocketEventCallback<T>
): (() => void) => {
  if (!socket) {
    console.warn('[Socket] Tentative d\'abonnement sans socket initialisé');
    return () => {};
  }
  
  socket.on(event, callback);
  
  // Retourner la fonction de désabonnement
  return () => {
    socket?.off(event, callback);
  };
};

/**
 * S'abonne à tous les types de notifications
 * Utile pour le centre de notifications
 */
export const subscribeToNotifications = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('notification', callback);
};

/**
 * S'abonne aux nouveaux rendez-vous
 * Utile pour les prestataires
 */
export const subscribeToNewBookings = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('new-booking', callback);
};

/**
 * S'abonne aux annulations de rendez-vous
 */
export const subscribeToBookingCancellations = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('booking-cancelled', callback);
};

/**
 * S'abonne aux nouveaux messages
 */
export const subscribeToNewMessages = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('new-message', callback);
};

/**
 * S'abonne aux nouveaux avis
 * Utile pour les prestataires
 */
export const subscribeToNewReviews = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('new-review', callback);
};

/**
 * S'abonne aux badges gagnés
 */
export const subscribeToBadgeEarned = (
  callback: SocketEventCallback<NotificationPayload>
): (() => void) => {
  return subscribeToEvent('badge-earned', callback);
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Émet un événement vers le serveur
 * Peut être utilisé pour des actions spécifiques
 */
export const emitEvent = (event: string, data?: unknown): void => {
  if (!socket?.connected) {
    console.warn('[Socket] Impossible d\'émettre, socket non connecté');
    return;
  }
  
  socket.emit(event, data);
};

/**
 * Marque une notification comme lue côté serveur
 * (via WebSocket pour mise à jour temps réel)
 */
export const markNotificationAsRead = (notificationId: string): void => {
  emitEvent('notification:read', { notificationId });
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = (): void => {
  emitEvent('notifications:read-all');
};
