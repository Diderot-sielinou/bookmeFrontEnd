/**
 * Hook pour les messages
 * Gère le compteur de messages non lus
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messagesService } from '@/services/messages.service';
import { useMessageNotifications } from '@/hooks/useSocket';

/**
 * Hook pour le badge de messages non lus
 */
export function useMessagesBadge() {
  const { data, refetch } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: () => messagesService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Rafraîchir toutes les 60 secondes
  });

  // Écouter les nouvelles notifications de messages via WebSocket
  useMessageNotifications(() => {
    // Rafraîchir le compteur quand un nouveau message arrive
    refetch();
  });

  return {
    count: data ?? 0,
    hasUnread: (data ?? 0) > 0,
    refetch,
  };
}

export default useMessagesBadge;