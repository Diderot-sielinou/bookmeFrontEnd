/**
 * Service de messagerie
 *
 * Gère toutes les opérations liées à la messagerie :
 * - Envoi et réception de messages
 * - Gestion des conversations
 * - Marquage comme lu
 * - Signalement
 */

import { api } from "@/lib/api";
import type {
  Message,
  Conversation,
  PaginatedResponse,
  ApiResponse,
} from "@/types/entities";
import type { SendMessageDto, FlagMessageDto } from "@/types/forms";

// ==========================================
// CONVERSATIONS
// ==========================================

/**
 * Récupère la liste des conversations
 * Chaque conversation est liée à un rendez-vous
 */
export const getConversations = async (options?: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}): Promise<Conversation[]> => {
  const response = await api.get<{ data: Conversation[] }>(
    "/messages/conversations",
    {
      params: options,
    }
  );
  return response.data.data;
};

/**
 * Récupère le nombre total de messages non lus
 */
// export const getUnreadCount = async (): Promise<number> => {
//   const response = await api.get<{ data: { count: number } }>('/messages/unread-count');
//   return response.data.data.count;
// };

// ==========================================
// MESSAGES
// ==========================================

/**
 * Récupère les messages d'une conversation (par rendez-vous)
 */
export const getMessagesByAppointment = async (
  appointmentId: string,
  options?: {
    cursor?: string;
    limit?: number;
    sortOrder?: "ASC" | "DESC";
  }
): Promise<ApiResponse<Message[]>> => {
  const response = await api.get<ApiResponse<Message[]>>(
    `/messages/appointment/${appointmentId}`,
    { params: options }
  );
  return response.data;
};

/**
 * Envoie un message
 *
 * Le message est associé à un rendez-vous spécifique.
 * Seuls le client et le prestataire du RDV peuvent échanger.
 */
export const sendMessage = async (data: {
  appointmentId: string;
  content: string;
}): Promise<Message> => {
  const response = await api.post<{ data: Message }>("/messages", data);
  return response.data.data;
};

/**
 * Marque tous les messages d'une conversation comme lus
 */
export const markAsRead = async (appointmentId: string): Promise<void> => {
  await api.patch(`/messages/appointment/${appointmentId}/read`);
};

/**
 * Récupère le nombre de messages non lus
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<{ data: { unreadCount: number } }>(
    "/messages/unread-count"
  );
  return response.data.data.unreadCount;
};

// Alias for services index
export const markMessagesAsRead = markAsRead;

// ==========================================
// SIGNALEMENT
// ==========================================

/**
 * Signale un message inapproprié
 */

export const flagMessage = async (
  id: string,
  reason: string
): Promise<void> => {
  await api.post(`/messages/${id}/flag`, { reason });
};

// ==========================================
// UTILITAIRES POUR WEBSOCKET
// ==========================================

/**
 * Structure d'un message reçu via WebSocket
 */
export interface WebSocketMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/**
 * Ajoute un message reçu via WebSocket à la liste locale
 * Utile pour la mise à jour temps réel de l'interface
 */
export const addMessageToList = (
  messages: Message[],
  newMessage: WebSocketMessage
): Message[] => {
  // Vérifier que le message n'existe pas déjà
  if (messages.some((m) => m.id === newMessage.id)) {
    return messages;
  }

  // Ajouter le nouveau message à la fin
  return [
    ...messages,
    {
      ...newMessage,
      read: false,
      readAt: null,
      flagged: false,
      flagReason: null,
    },
  ];
};

/**
 * Met à jour le statut "lu" d'un message local
 */
export const markMessageAsReadLocal = (
  messages: Message[],
  messageId: string
): Message[] => {
  return messages.map((m) =>
    m.id === messageId
      ? { ...m, read: true, readAt: new Date().toISOString() }
      : m
  );
};

export const messagesService = {
  getConversations,
  getMessagesByAppointment,
  sendMessage,
  markAsRead,
  getUnreadCount,
  flagMessage,
};
