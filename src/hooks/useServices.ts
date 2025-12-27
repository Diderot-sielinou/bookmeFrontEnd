// src/hooks/useServices.ts

/**
 * Hook useServices
 *
 * Gestion des services avec React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { servicesService } from "@/services";
import { queryKeys } from "@/lib/queryClient";
import { showSuccess, showError } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import type { CreateServiceDto, UpdateServiceDto } from "@/types";

// ==========================================
// QUERIES
// ==========================================

/**
 * Récupère les services du prestataire connecté
 */
export function useMyServices() {
  return useQuery({
    queryKey: queryKeys.services.lists(),
    queryFn: () => servicesService.getMyServices(),
  });
}

/**
 * Récupère les services d'un prestataire (public)
 */
export function usePrestataireServices(prestataireId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.services.list(prestataireId),
    queryFn: () =>
      import("@/services/prestataires.service").then((m) =>
        m.getPrestataireServices(prestataireId!)
      ),
    enabled: !!prestataireId,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Crée un service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => servicesService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      showSuccess("Service créé avec succès");
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
      servicesService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      showSuccess("Service mis à jour");
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
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      showSuccess("Service supprimé");
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Réordonne les services
 */
export function useReorderServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceIds: string[]) =>
      servicesService.reorderServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      showSuccess("Ordre mis à jour");
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// ==========================================
// HOOK COMPOSÉ
// ==========================================

/**
 * Hook combiné pour la gestion des services
 */
export function useServicesManagement() {
  const servicesQuery = useMyServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const reorderMutation = useReorderServices();

  return {
    // Data
    services: servicesQuery.data ?? [],
    activeServices: (servicesQuery.data ?? []).filter((s) => s.isActive),

    // États
    isLoading: servicesQuery.isLoading,
    error: servicesQuery.error,

    // Actions
    createService: createMutation.mutateAsync,
    updateService: updateMutation.mutateAsync,
    deleteService: deleteMutation.mutateAsync,
    reorderServices: reorderMutation.mutateAsync,

    // États des mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending,

    // Refetch
    refetch: servicesQuery.refetch,
  };
}