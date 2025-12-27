// src/stores/messageStore.ts

/**
 * Store Zustand pour les messages
 *
 * Gère le compteur de messages non lus
 * Mis à jour via WebSocket
 */

import { create } from "zustand";
import { messagesService } from "@/services";

interface MessageState {
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchUnreadCount: () => Promise<void>;
  incrementUnread: () => void;
  decrementUnread: (count?: number) => void;
  resetUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    set({ isLoading: true });
    try {
      const count = await messagesService.getUnreadCount();
      set({ unreadCount: count, isLoading: false });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      set({ isLoading: false });
    }
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  decrementUnread: (count = 1) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - count),
    }));
  },

  resetUnread: () => {
    set({ unreadCount: 0 });
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },
}));

// Sélecteurs pour usage simplifié
export const useUnreadMessagesCount = () =>
  useMessageStore((state) => state.unreadCount);

export const useHasUnreadMessages = () =>
  useMessageStore((state) => state.unreadCount > 0);