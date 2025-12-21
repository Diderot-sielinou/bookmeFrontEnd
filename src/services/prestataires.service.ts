/**
 * Service des prestataires
 * 
 * Gère toutes les opérations liées aux prestataires :
 * - Recherche et filtrage
 * - Profil public
 * - Mise à jour du profil (prestataire connecté)
 * - Services
 */

import { api } from '@/lib/api';
import type {
  Prestataire,
  Service,
  Review,
  SearchResult,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types/entities';
import type {
  UpdatePrestataireDto,
  CreateServiceDto,
  UpdateServiceDto,
} from '@/types/forms';

// ==========================================
// RECHERCHE (Public)
// ==========================================

/**
 * Recherche des prestataires avec filtres
 * Endpoint public pour les clients
 */
export const searchPrestataires = async (
  filters?: SearchFilters
): Promise<PaginatedResponse<SearchResult>> => {
  const response = await api.get<PaginatedResponse<SearchResult>>('/search', {
    params: filters,
  });
  return response.data;
};

/**
 * Récupère les suggestions de recherche (autocomplétion)
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const response = await api.get<{ data: string[] }>('/search/suggestions', {
    params: { query },
  });
  return response.data.data;
};

/**
 * Récupère les catégories populaires
 */
export const getPopularCategories = async (): Promise<Array<{
  category: string;
  count: number;
}>> => {
  const response = await api.get<{ data: Array<{ category: string; count: number }> }>(
    '/search/categories'
  );
  return response.data.data;
};

// ==========================================
// PROFIL PUBLIC
// ==========================================

/**
 * Récupère le profil public d'un prestataire
 * Inclut les services actifs et les badges
 */
export const getPrestataireById = async (id: string): Promise<Prestataire> => {
  const response = await api.get<{ data: Prestataire }>(`/users/prestataires/${id}`);
  return response.data.data;
};

/**
 * Récupère les services actifs d'un prestataire
 */
export const getPrestataireServices = async (prestataireId: string): Promise<Service[]> => {
  const response = await api.get<{ data: Service[] }>(
    `/services/prestataire/${prestataireId}`
  );
  return response.data.data;
};

/**
 * Récupère les avis d'un prestataire
 */
export const getPrestataireReviews = async (prestataireId: string): Promise<ApiResponse<Review[]>> => {
  const response = await api.get<ApiResponse<Review[]>>(
    `/reviews/prestataire/${prestataireId}`
  );
  return response.data;
};

// ==========================================
// PROFIL (Prestataire connecté)
// ==========================================

/**
 * Récupère le profil du prestataire connecté
 */
export const getMyPrestataireProfile = async (): Promise<Prestataire> => {
  const response = await api.get<{ data: Prestataire }>('/users/profile/prestataire');
  return response.data.data;
};

/**
 * Met à jour le profil du prestataire connecté
 */
export const updateMyPrestataireProfile = async (
  data: UpdatePrestataireDto
): Promise<Prestataire> => {
  const response = await api.patch<{ data: Prestataire }>(
    '/users/profile/prestataire',
    data
  );
  return response.data.data;
};

// ==========================================
// SERVICES (Prestataire connecté)
// ==========================================

/**
 * Récupère les services du prestataire connecté
 */
export const getMyServices = async (): Promise<Service[]> => {
  const response = await api.get<{ data: Service[] }>('/services');
  return response.data.data;
};

/**
 * Crée un nouveau service
 */
export const createService = async (data: CreateServiceDto): Promise<Service> => {
  const response = await api.post<{ data: Service }>('/services', data);
  return response.data.data;
};

/**
 * Met à jour un service
 */
export const updateService = async (
  id: string,
  data: UpdateServiceDto
): Promise<Service> => {
  const response = await api.patch<{ data: Service }>(`/services/${id}`, data);
  return response.data.data;
};

/**
 * Supprime un service
 * Note : Un service avec des RDV passés ne peut pas être supprimé (soft delete)
 */
export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/services/${id}`);
};

/**
 * Réordonne les services
 */
export const reorderServices = async (
  serviceIds: string[]
): Promise<Service[]> => {
  const response = await api.post<{ data: Service[] }>('/services/reorder', {
    serviceIds,
  });
  return response.data.data;
};

// ==========================================
// BADGES
// ==========================================

/**
 * Récupère les badges d'un prestataire
 */
export const getPrestataireBadges = async (prestataireId: string): Promise<Array<{
  type: string;
  awardedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}>> => {
  const response = await api.get<{ data: Array<{
    type: string;
    awardedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  }> }>(`/badges/prestataire/${prestataireId}`);
  return response.data.data;
};

/**
 * Récupère les badges du prestataire connecté
 */
export const getMyBadges = async (): Promise<Array<{
  type: string;
  awardedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}>> => {
  const response = await api.get<{ data: Array<{
    type: string;
    awardedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  }> }>('/badges/my');
  return response.data.data;
};

// ==========================================
// EXPORTS GROUPÉS
// ==========================================

export const prestatairesService = {
  searchPrestataires,
  getSearchSuggestions,
  getPopularCategories,
  getPrestataireById,
  getPrestataireServices,
  getPrestataireReviews,
  getMyPrestataireProfile,
  updateMyPrestataireProfile,
  getPrestataireBadges,
  getMyBadges,
};

export const servicesService = {
  getMyServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
