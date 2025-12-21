/**
 * Hook useSlots
 * 
 * Gestion des créneaux horaires avec React Query.
 * Fournit les queries et mutations pour les opérations CRUD.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as slotsService from '@/services/slots.service';
import { queryKeys, CACHE_TIME } from '@/lib/queryClient';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import type {
  CreateSlotDto,
  CreateRecurringSlotsDto,
  UpdateSlotDto,
  BlockSlotsDto,
} from '@/types';

// ==========================================
// QUERIES - PUBLIC
// ==========================================

/**
 * Récupère les créneaux disponibles d'un prestataire
 * Utilisé pour la réservation côté client
 */
export function useAvailableSlots(
  prestataireId: string | undefined,
  options?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    serviceId?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.slots.available(prestataireId!, options),
    queryFn: () => slotsService.getAvailableSlots(prestataireId!, options),
    enabled: !!prestataireId,
    // Cache court car les créneaux changent souvent
    staleTime: CACHE_TIME.SHORT,
  });
}

// ==========================================
// QUERIES - PRESTATAIRE
// ==========================================

/**
 * Récupère les créneaux du prestataire connecté
 */
export function useMySlots(options?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.slots.list(options),
    queryFn: () => slotsService.getMySlots(options),
  });
}

/**
 * Récupère un créneau par ID
 */
export function useSlotById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.slots.detail(id!),
    queryFn: () => slotsService.getSlotById(id!),
    enabled: !!id,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Crée un créneau manuel
 */
export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlotDto) => slotsService.createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      showSuccess('Créneau créé avec succès');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Crée des créneaux récurrents
 */
export function useCreateRecurringSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringSlotsDto) =>
      slotsService.createRecurringSlots(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      showSuccess(`${result.count} créneaux créés avec succès`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Met à jour un créneau
 */
export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlotDto }) =>
      slotsService.updateSlot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.slots.detail(variables.id),
      });
      showSuccess('Créneau mis à jour');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Supprime un créneau
 */
export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slotsService.deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      showSuccess('Créneau supprimé');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Bloque une période
 */
export function useBlockSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockSlotsDto) => slotsService.blockSlots(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      
      if (result.existingAppointments > 0) {
        showSuccess(
          `${result.blockedCount} créneaux bloqués. Attention : ${result.existingAppointments} rendez-vous existants dans cette période.`
        );
      } else {
        showSuccess(`${result.blockedCount} créneaux bloqués`);
      }
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Débloque un créneau
 */
export function useUnblockSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slotsService.unblockSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      showSuccess('Créneau débloqué');
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
 * Hook combiné pour la gestion des créneaux (prestataire)
 */
export function useSlots(options?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  serviceId?: string;
}) {
  const slotsQuery = useMySlots(options);
  const createMutation = useCreateSlot();
  const createRecurringMutation = useCreateRecurringSlots();
  const updateMutation = useUpdateSlot();
  const deleteMutation = useDeleteSlot();
  const blockMutation = useBlockSlots();
  const unblockMutation = useUnblockSlot();

  return {
    // Data
    slots: slotsQuery.data?.data ?? [],
    pagination: slotsQuery.data?.meta,
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,

    // Actions
    create: createMutation.mutateAsync,
    createRecurring: createRecurringMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    block: blockMutation.mutateAsync,
    unblock: unblockMutation.mutateAsync,

    // États des mutations
    isCreating: createMutation.isPending,
    isCreatingRecurring: createRecurringMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBlocking: blockMutation.isPending,

    // Refetch
    refetch: slotsQuery.refetch,
  };
}

/**
 * Hook pour la sélection de créneaux (client)
 * Utilisé dans le flux de réservation
 */
export function useSlotSelection(
  prestataireId: string | undefined,
  serviceId?: string
) {
  const slotsQuery = useAvailableSlots(prestataireId, { serviceId });

  // Grouper les créneaux par date
  const slotsByDate = (slotsQuery.data ?? []).reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, typeof slotsQuery.data>);

  return {
    slots: slotsQuery.data ?? [],
    slotsByDate,
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
    refetch: slotsQuery.refetch,
  };
}
