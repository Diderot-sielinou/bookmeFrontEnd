/**
 * Service des rendez-vous
 * 
 * Gère toutes les opérations liées aux rendez-vous :
 * - Réservation / Annulation
 * - Liste des rendez-vous (client et prestataire)
 * - Détails d'un rendez-vous
 * - Marquage comme terminé
 */

import { api } from '@/lib/api';
import type {
  Appointment,
  AppointmentFilters,
  PaginatedResponse,
} from '@/types/entities';
import type {
  BookAppointmentDto,
  CancelAppointmentDto,
} from '@/types/forms';

// ==========================================
// LECTURE
// ==========================================

/**
 * Récupère la liste des rendez-vous de l'utilisateur connecté
 * Filtrable par statut, date, etc.
 */
export const getMyAppointments = async (
  filters?: AppointmentFilters
): Promise<PaginatedResponse<Appointment>> => {
  const response = await api.get<PaginatedResponse<Appointment>>('/appointments/my', {
    params: filters,
  });
  return response.data;
};

/**
 * Récupère les rendez-vous du jour (pour prestataires)
 */
export const getTodayAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<{ data: Appointment[] }>('/appointments/today');
  return response.data.data;
};

/**
 * Récupère un rendez-vous par son ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get<{ data: Appointment }>(`/appointments/${id}`);
  return response.data.data;
};

// ==========================================
// ACTIONS CLIENT
// ==========================================

/**
 * Réserve un rendez-vous
 * 
 * Le système vérifie automatiquement :
 * - Disponibilité du créneau
 * - Respect du préavis minimum
 * - Statut actif du prestataire
 */
export const bookAppointment = async (data: BookAppointmentDto): Promise<Appointment> => {
  const response = await api.post<{ data: Appointment }>('/appointments/book', data);
  return response.data.data;
};

/**
 * Annule un rendez-vous
 * 
 * Le système vérifie :
 * - Que l'utilisateur est autorisé (client ou prestataire concerné)
 * - Respect du délai minimum d'annulation
 */
export const cancelAppointment = async (
  id: string,
  data?: CancelAppointmentDto
): Promise<Appointment> => {
  const response = await api.patch<{ data: Appointment }>(
    `/appointments/${id}/cancel`,
    data
  );
  return response.data.data;
};

// ==========================================
// ACTIONS PRESTATAIRE
// ==========================================

/**
 * Marque un rendez-vous comme terminé
 * Disponible uniquement pour les prestataires
 */
export const completeAppointment = async (id: string): Promise<Appointment> => {
  const response = await api.patch<{ data: Appointment }>(
    `/appointments/${id}/complete`
  );
  return response.data.data;
};

/**
 * Confirme un rendez-vous (prestataire)
 */
export const confirmAppointment = async (id: string): Promise<Appointment> => {
  const response = await api.patch<{ data: Appointment }>(
    `/appointments/${id}/confirm`
  );
  return response.data.data;
};

/**
 * Marque un client comme absent (no-show)
 */
export const markNoShow = async (id: string): Promise<Appointment> => {
  const response = await api.patch<{ data: Appointment }>(
    `/appointments/${id}/no-show`
  );
  return response.data.data;
};

/**
 * Récupère les rendez-vous du prestataire connecté
 */
export const getPrestataireAppointments = async (
  filters?: AppointmentFilters
): Promise<PaginatedResponse<Appointment>> => {
  const response = await api.get<PaginatedResponse<Appointment>>('/appointments/prestataire', {
    params: filters,
  });
  return response.data;
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Vérifie si un rendez-vous peut être annulé
 * (basé sur le délai minimum du prestataire)
 */
export const canCancelAppointment = (
  appointment: Appointment,
  minCancellationHours: number
): boolean => {
  if (appointment.status !== 'CONFIRMED') return false;
  
  const appointmentDate = new Date(appointment.slot?.date || '');
  const [hours, minutes] = (appointment.slot?.startTime || '00:00').split(':');
  appointmentDate.setHours(parseInt(hours), parseInt(minutes));
  
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= minCancellationHours;
};

/**
 * Vérifie si un avis peut être laissé pour un rendez-vous
 */
export const canLeaveReview = (appointment: Appointment): boolean => {
  return appointment.status === 'COMPLETED' && !appointment.review;
};
