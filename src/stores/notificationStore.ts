/**
 * Store Zustand pour les notifications
 * 
 * Gère l'état global des notifications :
 * - Liste des notifications récentes
 * - Compteur de notifications non lues
 * - Actions de marquage comme lu
 * 
 * Ce store est mis à jour en temps réel via WebSocket.
 */

import { create } from 'zustand';

import type { Notification } from '@/types';
import * as notificationsService from '@/services/notifications.service';

// ==========================================
// TYPES
// ==========================================

interface NotificationState {
  // État
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

// ==========================================
// STORE
// ==========================================

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // État initial
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  /**
   * Récupère les notifications depuis l'API
   */
  fetchNotifications: async () => {
    set({ isLoading: true });
    
    try {
      const response = await notificationsService.getNotifications({
        limit: 20,
      });
      
      set({
        notifications: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erreur fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Récupère le compteur de notifications non lues
   */
  fetchUnreadCount: async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Erreur fetch unread count:', error);
    }
  },

  /**
   * Ajoute une notification (reçue via WebSocket)
   * 
   * Insère la notification au début de la liste
   * et incrémente le compteur de non lues.
   */
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Max 50
      unreadCount: state.unreadCount + 1,
    }));
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Erreur mark as read:', error);
    }
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead: async () => {
    try {
      await notificationsService.markAllAsRead();
      
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: n.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Erreur mark all as read:', error);
    }
  },

  /**
   * Vide les notifications (utilisé au logout)
   */
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));

// ==========================================
// SÉLECTEURS
// ==========================================

/**
 * Récupère les notifications non lues
 */
export const useUnreadNotifications = (): Notification[] => {
  return useNotificationStore((state) =>
    state.notifications.filter((n) => !n.read)
  );
};

/**
 * Vérifie s'il y a des notifications non lues
 */
export const useHasUnreadNotifications = (): boolean => {
  return useNotificationStore((state) => state.unreadCount > 0);
};
