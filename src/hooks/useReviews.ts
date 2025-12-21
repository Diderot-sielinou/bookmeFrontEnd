/**
 * Hook useReviews
 * 
 * Gestion des avis avec React Query.
 * Fournit les queries et mutations pour les opérations CRUD.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as reviewsService from '@/services/reviews.service';
import { queryKeys, CACHE_TIME } from '@/lib/queryClient';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import type { CreateReviewDto, UpdateReviewDto, ReviewResponseDto } from '@/types';

// ==========================================
// QUERIES - PUBLIC
// ==========================================

/**
 * Récupère les avis d'un prestataire
 */
export function useReviewsByPrestataire(
  prestataireId: string | undefined,
  options?: {
    rating?: number;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.reviews.byPrestataire(prestataireId!, options),
    queryFn: () => reviewsService.getReviewsByPrestataire(prestataireId!, options),
    enabled: !!prestataireId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

/**
 * Récupère les statistiques des avis d'un prestataire
 */
export function useReviewStats(prestataireId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(prestataireId!),
    queryFn: () => reviewsService.getReviewStats(prestataireId!),
    enabled: !!prestataireId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// ==========================================
// QUERIES - CLIENT
// ==========================================

/**
 * Récupère les avis laissés par le client connecté
 */
export function useMyReviews(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['reviews', 'my', options],
    queryFn: () => reviewsService.getMyReviews(options),
  });
}

// ==========================================
// QUERIES - PRESTATAIRE
// ==========================================

/**
 * Récupère les avis reçus par le prestataire connecté
 */
export function useReceivedReviews(options?: {
  rating?: number;
  hasResponse?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reviews', 'received', options],
    queryFn: () => reviewsService.getReceivedReviews(options),
  });
}

// ==========================================
// MUTATIONS - CLIENT
// ==========================================

/**
 * Crée un nouvel avis
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewsService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      showSuccess('Merci pour votre avis !');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Met à jour un avis
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewDto }) =>
      reviewsService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      showSuccess('Avis mis à jour');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// MUTATIONS - PRESTATAIRE
// ==========================================

/**
 * Répond à un avis
 */
export function useRespondToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewResponseDto }) =>
      reviewsService.respondToReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'received'] });
      showSuccess('Réponse publiée');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// MUTATIONS - SIGNALEMENT
// ==========================================

/**
 * Signale un avis inapproprié
 */
export function useFlagReview() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reviewsService.flagReview(id, { reason }),
    onSuccess: () => {
      showSuccess('Avis signalé. Notre équipe va l\'examiner.');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// HOOKS COMPOSÉS
// ==========================================

/**
 * Hook combiné pour les avis d'un prestataire (vue publique)
 */
export function usePrestataireReviews(prestataireId: string | undefined) {
  const reviewsQuery = useReviewsByPrestataire(prestataireId);
  const statsQuery = useReviewStats(prestataireId);

  return {
    // Data
    reviews: reviewsQuery.data?.data ?? [],
    pagination: reviewsQuery.data?.meta,
    stats: statsQuery.data,

    // États
    isLoading: reviewsQuery.isLoading || statsQuery.isLoading,
    error: reviewsQuery.error || statsQuery.error,

    // Refetch
    refetch: () => {
      reviewsQuery.refetch();
      statsQuery.refetch();
    },
  };
}

/**
 * Hook combiné pour la gestion des avis reçus (prestataire)
 */
export function useReviewsManagement() {
  const reviewsQuery = useReceivedReviews();
  const respondMutation = useRespondToReview();

  return {
    // Data
    reviews: reviewsQuery.data?.data ?? [],
    pagination: reviewsQuery.data?.meta,

    // États
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,

    // Actions
    respond: respondMutation.mutateAsync,
    isResponding: respondMutation.isPending,

    // Refetch
    refetch: reviewsQuery.refetch,
  };
}
