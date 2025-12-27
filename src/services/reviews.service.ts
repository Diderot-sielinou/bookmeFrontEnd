/**
 * Service des avis
 * 
 * Gère toutes les opérations liées aux avis :
 * - Création et modification d'avis (client)
 * - Réponse aux avis (prestataire)
 * - Consultation des avis
 * - Signalement
 */

import { api } from '@/lib/api';
import type { Review, PaginatedResponse } from '@/types/entities';
import type {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
  FlagReviewDto,
} from '@/types/forms';

// ==========================================
// LECTURE (Public)
// ==========================================

/**
 * Récupère les avis d'un prestataire
 * Endpoint public, triés par date décroissante
 */
export const getReviewsByPrestataire = async (
  prestataireId: string,
  options?: {
    rating?: number;      // Filtrer par note
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<Review>> => {
  const response = await api.get<PaginatedResponse<Review>>(
    `/reviews/prestataire/${prestataireId}`,
    { params: options }
  );
  return response.data;
};

/**
 * Récupère les statistiques des avis d'un prestataire
 */

export const getReviewStats = async (prestataireId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  averageQuality: number | null;
  averagePunctuality: number | null;
  averageCleanliness: number | null;
  // ✅ Accepter les deux formats
  distribution: Record<number, number> | Array<{ rating: number; count: number; percentage: number }>;
}> => {
  const response = await api.get<{
    data: {
      averageRating: number;
      totalReviews: number;
      averageQuality: number | null;
      averagePunctuality: number | null;
      averageCleanliness: number | null;
      distribution: Record<number, number> | Array<{ rating: number; count: number; percentage: number }>;
    };
  }>(`/reviews/prestataire/${prestataireId}/stats`);
  return response.data.data;
};

/**
 * Récupère un avis par son ID
 */
export const getReviewById = async (id: string): Promise<Review> => {
  const response = await api.get<{ data: Review }>(`/reviews/${id}`);
  return response.data.data;
};

// ==========================================
// ACTIONS CLIENT
// ==========================================

/**
 * Récupère les avis laissés par le client connecté
 */
export const getMyReviews = async (options?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Review>> => {
  const response = await api.get<PaginatedResponse<Review>>('/reviews/my/reviews', {
    params: options,
  });
  return response.data;
};

/**
 * Crée un nouvel avis
 * 
 * Conditions :
 * - Le RDV doit être terminé (COMPLETED)
 * - Aucun avis n'existe déjà pour ce RDV
 */
export const createReview = async (data: CreateReviewDto): Promise<Review> => {
  const response = await api.post<{ data: Review }>('/reviews', data);
  return response.data.data;
};

/**
 * Met à jour un avis
 * 
 * Limitations :
 * - Maximum 2 modifications autorisées
 * - Dans les 48h suivant la création
 */
export const updateReview = async (
  id: string,
  data: UpdateReviewDto
): Promise<Review> => {
  const response = await api.patch<{ data: Review }>(`/reviews/${id}`, data);
  return response.data.data;
};

/**
 * Supprime un avis
 * 
 * Note: L'avis ne peut être supprimé que par son auteur
 */
export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};

// Alias for services index
export const getPrestataireReviewsService = getReviewsByPrestataire;

// ==========================================
// ACTIONS PRESTATAIRE
// ==========================================

/**
 * Récupère les avis reçus par le prestataire connecté
 */
export const getReceivedReviews = async (options?: {
  rating?: number;
  hasResponse?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Review>> => {
  const response = await api.get<PaginatedResponse<Review>>('/reviews/received', {
    params: options,
  });
  return response.data;
};

/**
 * Répond à un avis
 * 
 * Note : Une seule réponse est autorisée par avis.
 * La réponse ne peut pas être modifiée.
 */
export const respondToReview = async (
  id: string,
  data: ReviewResponseDto
): Promise<Review> => {
  const response = await api.patch<{ data: Review }>(
    `/reviews/${id}/respond`,
    data
  );
  return response.data.data;
};

// ==========================================
// SIGNALEMENT
// ==========================================

/**
 * Signale un avis inapproprié
 * L'avis sera examiné par un administrateur
 */
export const flagReview = async (id: string, data: FlagReviewDto): Promise<void> => {
  await api.post(`/reviews/${id}/flag`, data);
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Vérifie si un avis peut encore être modifié
 */
export const canEditReview = (review: Review): boolean => {
  // Maximum 2 modifications
  if (review.editCount >= 2) return false;
  
  // Dans les 48h suivant la création
  const createdAt = new Date(review.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCreation <= 48;
};

/**
 * Vérifie si le prestataire peut répondre à un avis
 */
export const canRespondToReview = (review: Review): boolean => {
  return !review.prestataireResponse;
};
