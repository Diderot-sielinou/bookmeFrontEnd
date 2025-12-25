/**
 * Hook usePrestataires
 * 
 * Gestion des prestataires avec React Query.
 * Fournit les queries pour la recherche et les profils.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as prestatairesService from '@/services/prestataires.service';
import { queryKeys, CACHE_TIME } from '@/lib/queryClient';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import type { SearchFilters, UpdatePrestataireDto, CreateServiceDto, UpdateServiceDto } from '@/types';

// ==========================================
// QUERIES - RECHERCHE
// ==========================================

/**
 * Recherche des prestataires avec filtres
 */
export function useSearchPrestataires(filters?: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.prestataires.search(filters as Record<string, unknown>),
    queryFn: () => prestatairesService.searchPrestataires(filters),
    staleTime: CACHE_TIME.MEDIUM,
  });
}

/**
 * Récupère les suggestions de recherche
 */
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => prestatairesService.getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

/**
 * Récupère les catégories populaires
 */
export function usePopularCategories() {
  return useQuery({
    queryKey: ['search', 'categories'],
    queryFn: prestatairesService.getPopularCategories,
    staleTime: CACHE_TIME.LONG,
  });
}

// ==========================================
// QUERIES - PROFIL PUBLIC
// ==========================================

/**
 * Récupère le profil public d'un prestataire
 */
export function usePrestataireById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.prestataires.detail(id!),
    queryFn: () => prestatairesService.getPrestataireById(id!),
    enabled: !!id,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// Alias for convenience
export const usePrestataire = usePrestataireById;

/**
 * Récupère les services d'un prestataire
 */
export function usePrestataireServices(prestataireId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.services.list(prestataireId),
    queryFn: () => prestatairesService.getPrestataireServices(prestataireId!),
    enabled: !!prestataireId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

/**
 * Récupère les avis d'un prestataire
 */
export function usePrestataireReviews(prestataireId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byPrestataire(prestataireId!, {}),
    queryFn: () => prestatairesService.getPrestataireReviews(prestataireId!),
    enabled: !!prestataireId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// ==========================================
// QUERIES - PROFIL PRESTATAIRE CONNECTÉ
// ==========================================

/**
 * Récupère le profil du prestataire connecté
 */
export function useMyPrestataireProfile() {
  return useQuery({
    queryKey: ['profile', 'prestataire'],
    queryFn: prestatairesService.getMyPrestataireProfile,
  });
}

/**
 * Récupère les services du prestataire connecté
 */
export function useMyServices() {
  return useQuery({
    queryKey: queryKeys.services.lists(),
    queryFn: prestatairesService.getMyServices,
    staleTime: CACHE_TIME.SHORT, // ✅ Rafraîchir plus souvent
  });
}

/**
 * Récupère les badges du prestataire connecté
 */
export function useMyBadges() {
  return useQuery({
    queryKey: queryKeys.badges.my(),
    queryFn: prestatairesService.getMyBadges,
  });
}

// ==========================================
// MUTATIONS - PROFIL
// ==========================================

/**
 * Met à jour le profil du prestataire
 */
export function useUpdatePrestataireProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePrestataireDto) =>
      prestatairesService.updateMyPrestataireProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'prestataire'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      showSuccess('Profil mis à jour avec succès');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// MUTATIONS - SERVICES
// ==========================================

/**
 * Crée un nouveau service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) =>
      prestatairesService.createService(data),
    onSuccess: () => {
      // ✅ CORRECTION: Invalider toutes les queries de services
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.lists() });
      showSuccess('Service créé avec succès');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Met à jour un service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      prestatairesService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.lists() });
      showSuccess('Service mis à jour');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Supprime un service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => prestatairesService.deleteService(id),
    onSuccess: () => {
      // ✅ CORRECTION CRITIQUE: Invalider ET refetch immédiatement
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.services.all,
        refetchType: 'active', // ← Force le refetch des queries actives
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.services.lists(),
        refetchType: 'active',
      });
      
      // ✅ ALTERNATIVE: Mise à jour optimiste du cache
      // queryClient.setQueryData(queryKeys.services.lists(), (oldData: any) => {
      //   if (!oldData) return oldData;
      //   return oldData.filter((service: any) => service.id !== id);
      // });
      
      showSuccess('Service supprimé');
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
 * Hook combiné pour la recherche de prestataires
 */
export function useSearch(initialFilters?: SearchFilters) {
  const searchQuery = useSearchPrestataires(initialFilters);
  const categoriesQuery = usePopularCategories();

  return {
    // Résultats
    results: searchQuery.data?.data ?? [],
    pagination: searchQuery.data?.meta,
    categories: categoriesQuery.data ?? [],
    
    // États
    isLoading: searchQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    error: searchQuery.error,
    
    // Actions
    refetch: searchQuery.refetch,
  };
}

/**
 * Hook combiné pour le profil prestataire
 */
export function usePrestataireProfile() {
  const profileQuery = useMyPrestataireProfile();
  const servicesQuery = useMyServices();
  const badgesQuery = useMyBadges();
  const updateMutation = useUpdatePrestataireProfile();

  return {
    // Data
    profile: profileQuery.data,
    services: servicesQuery.data ?? [],
    badges: badgesQuery.data ?? [],
    
    // États
    isLoading: profileQuery.isLoading || servicesQuery.isLoading,
    error: profileQuery.error || servicesQuery.error,
    
    // Actions
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    // Refetch
    refetch: () => {
      profileQuery.refetch();
      servicesQuery.refetch();
      badgesQuery.refetch();
    },
  };
}