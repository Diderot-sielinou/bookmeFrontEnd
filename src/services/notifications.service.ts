/**
 * Service des notifications
 * 
 * Gère toutes les opérations liées aux notifications :
 * - Récupération des notifications
 * - Marquage comme lu
 * - Compteur de notifications non lues
 */

import { api } from '@/lib/api';
import type { Notification, PaginatedResponse } from '@/types/entities';

// ==========================================
// LECTURE
// ==========================================

/**
 * Récupère les notifications de l'utilisateur connecté
 */
export const getNotifications = async (options?: {
  read?: boolean;      // Filtrer par statut lu/non lu
  type?: string;       // Filtrer par type
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Notification>> => {
  const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
    params: options,
  });
  return response.data;
};

/**
 * Récupère le nombre de notifications non lues
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<{ data: { count: number } }>(
    '/notifications/unread-count'
  );
  return response.data.data.count;
};

// ==========================================
// ACTIONS
// ==========================================

/**
 * Marque une notification comme lue
 */
export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

// Alias for services index
export const markNotificationAsRead = markAsRead;

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

/**
 * Supprime une notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Génère l'URL de redirection pour une notification
 * Basé sur le type et l'ID de l'entité liée
 */
export const getNotificationLink = (notification: Notification): string | null => {
  const { type, relatedId } = notification;
  
  if (!relatedId) return null;
  
  switch (type) {
    case 'NEW_BOOKING':
    case 'CANCELLATION':
    case 'REMINDER':
      return `/appointments/${relatedId}`;
    
    case 'NEW_REVIEW':
      return `/reviews/${relatedId}`;
    
    case 'NEW_MESSAGE':
      return `/messages?appointment=${relatedId}`;
    
    case 'BADGE_EARNED':
      return '/prestataire/badges';
    
    default:
      return null;
  }
};

/**
 * Regroupe les notifications par date
 */
export const groupNotificationsByDate = (
  notifications: Notification[]
): Map<string, Notification[]> => {
  const groups = new Map<string, Notification[]>();
  
  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(notification);
  });
  
  return groups;
};
