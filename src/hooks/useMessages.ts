/**
 * Hook useMessages - CORRIGÉ
 * 
 * Fichier: src/hooks/useMessages.ts
 * 
 * CORRECTION: Ajout de `enabled` pour ne pas faire de requêtes si non authentifié
 */

import { useQuery } from '@tanstack/react-query';
import { messagesService } from '@/services/messages.service';
import { useMessageNotifications } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook for unread messages badge
 */
export function useMessagesBadge() {
  // ✅ CORRECTION: Vérifier l'authentification
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const { data, refetch } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: () => messagesService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    // ✅ Ne faire la requête que si authentifié ET initialisé
    enabled: isAuthenticated && isInitialized,
    // ✅ Rafraîchir seulement si authentifié
    refetchInterval: isAuthenticated ? 60 * 1000 : false,
  });

  // Listen to new message notifications via WebSocket
  useMessageNotifications(() => {
    // ✅ Ne rafraîchir que si authentifié
    if (isAuthenticated) {
      refetch();
    }
  });

  // ✅ Retourner 0 si non authentifié
  if (!isAuthenticated) {
    return {
      count: 0,
      hasUnread: false,
      refetch: () => {},
    };
  }

  return {
    count: data ?? 0,
    hasUnread: (data ?? 0) > 0,
    refetch,
  };
}

export default useMessagesBadge;