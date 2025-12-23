/**
 * Service des prestataires
 */

import { api } from "@/lib/api";
import type {
  Prestataire,
  Service,
  Review,
  SearchResult,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types/entities";
import type {
  UpdatePrestataireDto,
  CreateServiceDto,
  UpdateServiceDto,
} from "@/types/forms";

// ==========================================
// RECHERCHE (Public)
// ==========================================

export const searchPrestataires = async (
  filters?: SearchFilters
): Promise<PaginatedResponse<SearchResult>> => {
  const response = await api.get<PaginatedResponse<SearchResult>>("/search", {
    params: filters,
  });
  return response.data;
};

export const getSearchSuggestions = async (
  query: string
): Promise<string[]> => {
  const response = await api.get<{ data: string[] }>("/search/suggestions", {
    params: { query },
  });
  return response.data.data;
};

export const getPopularCategories = async (): Promise<
  Array<{
    category: string;
    count: number;
  }>
> => {
  const response = await api.get<{
    data: Array<{ category: string; count: number }>;
  }>("/search/categories");
  return response.data.data;
};

// ==========================================
// PROFIL PUBLIC
// ==========================================

export const getPrestataireById = async (id: string): Promise<Prestataire> => {
  const response = await api.get<{ data: Prestataire }>(
    `/users/prestataires/${id}`
  );
  return response.data.data;
};

export const getPrestataireServices = async (
  prestataireId: string
): Promise<Service[]> => {
  const response = await api.get<{ data: Service[] }>(
    `/services/prestataire/${prestataireId}`
  );
  return response.data.data;
};

export const getPrestataireReviews = async (
  prestataireId: string
): Promise<ApiResponse<Review[]>> => {
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
 * Route: GET /users/prestataires/me
 */
export const getMyPrestataireProfile = async (): Promise<Prestataire> => {
  const response = await api.get<{ data: Prestataire }>(
    "/users/prestataires/me"
  );
  return response.data.data;
};

/**
 * Met à jour le profil du prestataire connecté
 * Route: PATCH /users/prestataires/me
 */
export const updateMyPrestataireProfile = async (
  data: UpdatePrestataireDto
): Promise<Prestataire> => {
  const response = await api.patch<{ data: Prestataire }>(
    "/users/prestataires/me",
    data
  );
  return response.data.data;
};

/**
 * Récupère les stats du prestataire connecté
 * Route: GET /users/prestataires/me/stats
 */
export const getMyPrestataireStats = async (): Promise<{
  totalAppointments: number;
  totalReviews: number;
  averageRating: number;
  cancellationRate: number;
}> => {
  const response = await api.get<{
    data: {
      totalAppointments: number;
      totalReviews: number;
      averageRating: number;
      cancellationRate: number;
    };
  }>("/users/prestataires/me/stats");
  return response.data.data;
};

// ==========================================
// SERVICES (Prestataire connecté)
// ==========================================

/**
 * Récupère les services du prestataire connecté
 * ⚠️ Cette route n'existe pas dans le controller actuel
 * Option 1: Utiliser /services/prestataire/:id avec l'ID du prestataire
 * Option 2: Ajouter une route GET /services/me dans le backend
 */
export const getMyServices = async (): Promise<Service[]> => {
  const response = await api.get<{ data: Service[] }>(`/services`);
  return response.data.data;
};

export const createService = async (
  data: CreateServiceDto
): Promise<Service> => {
  const response = await api.post<{ data: Service }>("/services", data);
  return response.data.data;
};

export const updateService = async (
  id: string,
  data: UpdateServiceDto
): Promise<Service> => {
  const response = await api.patch<{ data: Service }>(`/services/${id}`, data);
  return response.data.data;
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/services/${id}`);
};

export const reorderServices = async (
  serviceIds: string[]
): Promise<Service[]> => {
  const response = await api.patch<{ data: Service[] }>("/services/reorder", {
    serviceIds,
  });
  return response.data.data;
};

// ==========================================
// BADGES
// ==========================================

export const getPrestataireBadges = async (
  prestataireId: string
): Promise<
  Array<{
    type: string;
    awardedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  }>
> => {
  const response = await api.get<{
    data: Array<{
      type: string;
      awardedAt: string;
      expiresAt: string | null;
      isActive: boolean;
    }>;
  }>(`/badges/prestataire/${prestataireId}`);
  return response.data.data;
};

export const getMyBadges = async (): Promise<
  Array<{
    type: string;
    awardedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  }>
> => {
  const response = await api.get<{
    data: Array<{
      type: string;
      awardedAt: string;
      expiresAt: string | null;
      isActive: boolean;
    }>;
  }>("/badges/my");
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
  getMyPrestataireStats,
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
