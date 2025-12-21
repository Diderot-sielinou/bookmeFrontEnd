/**
 * Hook useAppointments
 * 
 * Gestion des rendez-vous avec React Query.
 * Fournit les queries et mutations pour les opérations CRUD.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as appointmentsService from '@/services/appointments.service';
import { queryKeys } from '@/lib/queryClient';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import type { AppointmentFilters } from '@/types';

// ==========================================
// QUERIES
// ==========================================

/**
 * Récupère la liste des rendez-vous de l'utilisateur
 */
export function useMyAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters as Record<string, unknown>),
    queryFn: () => appointmentsService.getMyAppointments(filters),
  });
}

/**
 * Récupère les rendez-vous du jour (prestataire)
 */
export function useTodayAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.today(),
    queryFn: appointmentsService.getTodayAppointments,
    // Rafraîchir toutes les 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Récupère un rendez-vous par ID
 */
export function useAppointmentById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id!),
    queryFn: () => appointmentsService.getAppointmentById(id!),
    enabled: !!id,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Réserve un nouveau rendez-vous
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsService.bookAppointment,
    onSuccess: () => {
      // Invalider les caches concernés
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      
      showSuccess('Rendez-vous réservé avec succès !');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// Alias for convenience
export const useCreateAppointment = useBookAppointment;

/**
 * Annule un rendez-vous
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsService.cancelAppointment(id, reason ? { reason } : undefined),
    onSuccess: (_, variables) => {
      // Invalider les caches concernés
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.detail(variables.id),
      });
      
      showSuccess('Rendez-vous annulé');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

/**
 * Marque un rendez-vous comme terminé (prestataire)
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsService.completeAppointment(id),
    onSuccess: (_, id) => {
      // Invalider les caches concernés
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      
      showSuccess('Rendez-vous marqué comme terminé');
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
 * Hook combiné pour la gestion complète des rendez-vous
 */
export function useAppointments(filters?: AppointmentFilters) {
  const appointments = useMyAppointments(filters);
  const bookMutation = useBookAppointment();
  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();

  return {
    // Data from query
    data: appointments.data,
    appointments: appointments.data?.data ?? [],
    pagination: appointments.data?.meta,
    isLoading: appointments.isLoading,
    error: appointments.error,
    
    // Actions
    book: bookMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    cancelAppointment: cancelMutation.mutateAsync,
    complete: completeMutation.mutateAsync,
    
    // États des mutations
    isBooking: bookMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCompleting: completeMutation.isPending,
    
    // Refetch
    refetch: appointments.refetch,
  };
}
