/**
 * Service de messagerie
 * ALIGNÉ AVEC LE BACKEND
 */

import { api } from '@/lib/api';
import type { Message, Appointment } from '@/types';

// ==========================================
// TYPES
// ==========================================

export interface Conversation {
  appointment: Appointment;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface PaginatedConversations {
  data: Conversation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedMessages {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==========================================
// CONVERSATIONS
// ==========================================

/**
 * Récupère la liste des conversations
 */
export const getConversations = async (options?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedConversations> => {
  const response = await api.get<PaginatedConversations>(
    '/messages/conversations',
    { params: options }
  );
  return response.data;
};

/**
 * Récupère le nombre total de messages non lus
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<{
    [x: string]: any; unreadCount: number 
}>('/messages/unread-count');
  // console.log(`unreadCount : ${JSON.stringify(response)}`)
  return Number(response.data.data.unreadCount) ;
};

// ==========================================
// MESSAGES
// ==========================================

/**
 * Récupère les messages d'une conversation
 */
export const getMessagesByAppointment = async (
  appointmentId: string,
  options?: {
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
  }
): Promise<PaginatedMessages> => {
  const response = await api.get<PaginatedMessages>(
    `/messages/appointment/${appointmentId}`,
    { params: options }
  );
  return response.data;
};

/**
 * Envoie un message
 */
export const sendMessage = async (data: {
  appointmentId: string;
  content: string;
}): Promise<Message> => {
  const response = await api.post<Message>('/messages', data);
  return response.data;
};

/**
 * Marque tous les messages d'une conversation comme lus
 */
export const markAsRead = async (appointmentId: string): Promise<{ marked: number }> => {
  const response = await api.patch<{ marked: number }>(
    `/messages/appointment/${appointmentId}/read`
  );
  return response.data;
};

// ✅ Alias pour compatibilité avec l'ancien code
export const markMessagesAsRead = markAsRead;

// ==========================================
// SIGNALEMENT
// ==========================================

/**
 * Signale un message inapproprié
 */
export const flagMessage = async (id: string, reason: string): Promise<Message> => {
  const response = await api.post<Message>(`/messages/${id}/flag`, { reason });
  return response.data;
};

// ==========================================
// EXPORT
// ==========================================

export const messagesService = {
  getConversations,
  getUnreadCount,
  getMessagesByAppointment,
  sendMessage,
  markAsRead,
  markMessagesAsRead, // ✅ Alias ajouté
  flagMessage,
};