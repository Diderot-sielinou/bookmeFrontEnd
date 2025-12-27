/**
 * Service des rendez-vous - ALIGNÉ AVEC BACKEND
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
 */
export const getMyAppointments = async (
  filters?: AppointmentFilters
): Promise<PaginatedResponse<Appointment>> => {
  const response = await api.get<PaginatedResponse<Appointment>>('/appointments/my', {
    params: filters,
  });
  // ✅ Le backend retourne déjà { success: true, data: [...], meta: {...} }
  // L'intercepteur transforme en { data: [...], meta: {...} }
  return response.data;
};

/**
 * Récupère les rendez-vous du jour (pour prestataires)
 * ✅ CORRIGÉ : Le backend retourne un tableau enveloppé
 */
export const getTodayAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<{ data: Appointment[] }>('/appointments/today');
  // ✅ Le backend/intercepteur enveloppe dans { success: true, data: [...] }
  // Axios ajoute .data, donc response.data = { data: [...] }
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
 */
export const bookAppointment = async (data: BookAppointmentDto): Promise<Appointment> => {
  // console.log(`BookAppointmentDto ${JSON.stringify(data)}`)
  const response = await api.post<{ data: Appointment }>('/appointments/book', data);
  return response.data.data;
};

/**
 * Annule un rendez-vous
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
 */
export const completeAppointment = async (id: string): Promise<Appointment> => {
  const response = await api.patch<{ data: Appointment }>(
    `/appointments/${id}/complete`
  );
  return response.data.data;
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Vérifie si un rendez-vous peut être annulé
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
 * Vérifie si un avis peut être laissé
 */
export const canLeaveReview = (appointment: Appointment): boolean => {
  return appointment.status === 'COMPLETED' && !appointment.review;
};