/**
 * Service des créneaux horaires
 * 
 * Gère toutes les opérations liées aux créneaux :
 * - Création manuelle et récurrente
 * - Modification et suppression
 * - Blocage de périodes
 * - Récupération des créneaux disponibles
 */

import { api } from '@/lib/api';
import type { Slot, PaginatedResponse } from '@/types/entities';
import type {
  CreateSlotDto,
  CreateRecurringSlotsDto,
  UpdateSlotDto,
  BlockSlotsDto,
} from '@/types/forms';

// ==========================================
// LECTURE (Public)
// ==========================================

/**
 * Récupère les créneaux disponibles d'un prestataire
 * Endpoint public pour la réservation
 * 
 * @param prestataireId - ID du prestataire
 * @param options - Filtres optionnels (date, serviceId)
 */
export const getAvailableSlots = async (
  prestataireId: string,
  options?: {
    date?: string;       // Format YYYY-MM-DD
    startDate?: string;  // Pour une plage de dates
    endDate?: string;
    serviceId?: string;
  }
): Promise<Slot[]> => {
  const response = await api.get<{ data: Slot[] }>(
    `/slots/available/${prestataireId}`,
    { params: options }
  );
  return response.data.data;
};

// ==========================================
// LECTURE (Prestataire)
// ==========================================

/**
 * Récupère les créneaux du prestataire connecté
 * Inclut tous les statuts (disponible, réservé, bloqué)
 */
export const getMySlots = async (options?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Slot>> => {
  const response = await api.get<PaginatedResponse<Slot>>('/slots', {
    params: options,
  });
  return response.data;
};

/**
 * Récupère un créneau par son ID
 */
export const getSlotById = async (id: string): Promise<Slot> => {
  const response = await api.get<{ data: Slot }>(`/slots/${id}`);
  return response.data.data;
};

// ==========================================
// CRÉATION
// ==========================================

/**
 * Crée un créneau manuel
 * 
 * Vérifications automatiques :
 * - Pas de chevauchement avec des créneaux existants
 * - Cohérence des horaires (fin > début)
 */
export const createSlot = async (data: CreateSlotDto): Promise<Slot> => {
  const response = await api.post<{ data: Slot }>('/slots', data);
  return response.data.data;
};

/**
 * Crée des créneaux récurrents
 * 
 * Génère automatiquement des créneaux pour :
 * - Les jours sélectionnés
 * - La période spécifiée
 * - La durée de créneau indiquée
 * 
 * @returns Le nombre de créneaux créés
 */
export const createRecurringSlots = async (
  data: CreateRecurringSlotsDto
): Promise<{ count: number; slots: Slot[] }> => {
  const response = await api.post<{ data: { count: number; slots: Slot[] } }>(
    '/slots/recurring',
    data
  );
  return response.data.data;
};

// ==========================================
// MODIFICATION
// ==========================================

/**
 * Met à jour un créneau
 * Seulement possible si le créneau est disponible (non réservé)
 */
export const updateSlot = async (id: string, data: UpdateSlotDto): Promise<Slot> => {
  const response = await api.patch<{ data: Slot }>(`/slots/${id}`, data);
  return response.data.data;
};

/**
 * Supprime un créneau
 * Seulement possible si le créneau est disponible (non réservé)
 */
export const deleteSlot = async (id: string): Promise<void> => {
  await api.delete(`/slots/${id}`);
};

// ==========================================
// BLOCAGE
// ==========================================

/**
 * Bloque une période (congés, indisponibilité)
 * 
 * Attention : Cette action ne supprime pas les RDV existants.
 * Les créneaux disponibles dans la période sont marqués comme bloqués.
 * 
 * @returns Les créneaux affectés
 */
export const blockSlots = async (
  data: BlockSlotsDto
): Promise<{ blockedCount: number; existingAppointments: number }> => {
  const response = await api.post<{
    data: { blockedCount: number; existingAppointments: number };
  }>('/slots/block', data);
  return response.data.data;
};

/**
 * Débloque un créneau (le rend à nouveau disponible)
 */
export const unblockSlot = async (id: string): Promise<Slot> => {
  const response = await api.patch<{ data: Slot }>(`/slots/${id}/unblock`);
  return response.data.data;
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Génère les créneaux pour un aperçu avant création
 * (calcul côté client, ne fait pas d'appel API)
 */
export const previewRecurringSlots = (data: CreateRecurringSlotsDto): string[] => {
  const slots: string[] = [];
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  // Parcourir chaque jour de la période
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Si ce jour est sélectionné
    if (data.daysOfWeek.includes(dayOfWeek)) {
      // Calculer les créneaux pour ce jour
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      
      const dayStart = startHour * 60 + startMin;
      const dayEnd = endHour * 60 + endMin;
      
      let slotStart = dayStart;
      while (slotStart + data.slotDuration <= dayEnd) {
        const slotEnd = slotStart + data.slotDuration;
        
        const startTime = `${Math.floor(slotStart / 60).toString().padStart(2, '0')}:${(slotStart % 60).toString().padStart(2, '0')}`;
        const endTime = `${Math.floor(slotEnd / 60).toString().padStart(2, '0')}:${(slotEnd % 60).toString().padStart(2, '0')}`;
        
        slots.push(`${currentDate.toISOString().split('T')[0]} ${startTime}-${endTime}`);
        
        slotStart = slotEnd;
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};
