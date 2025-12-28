/**
 * Hook for messages
 * Manages unread message count
 */

import { useEffect } from 'react';
import { messagesService } from '@/services/messages.service';
import { useMessageNotifications } from '@/hooks/useSocket';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook for unread messages badge
 */
export function useMessagesBadge() {
  const { data, refetch } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: () => messagesService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every 60 seconds
  });

  // Listen to new message notifications via WebSocket
  useMessageNotifications(() => {
    // Refresh count when a new message arrives
    refetch();
  });

  return {
    count: data ?? 0,
    hasUnread: (data ?? 0) > 0,
    refetch,
  };
}

export default useMessagesBadge;