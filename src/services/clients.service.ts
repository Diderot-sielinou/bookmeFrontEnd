/**
 * Service des clients
 * 
 * Gère les opérations liées aux profils clients :
 * - Récupération du profil
 * - Mise à jour du profil
 */

import { api } from '@/lib/api';
import type { Client } from '@/types/entities';
import type { UpdateClientDto } from '@/types/forms';

// ==========================================
// PROFIL CLIENT
// ==========================================

/**
 * Récupère le profil du client connecté
 */
export const getMyClientProfile = async (): Promise<Client> => {
  const response = await api.get<{ data: Client }>('/users/profile/client');
  return response.data.data;
};

// Alias for services index
export const getClientProfile = getMyClientProfile;

/**
 * Met à jour le profil du client connecté
 */
export const updateMyClientProfile = async (
  data: UpdateClientDto
): Promise<Client> => {
  const response = await api.patch<{ data: Client }>(
    '/users/profile/client',
    data
  );
  return response.data.data;
};

// Alias for services index
export const updateClientProfileService = updateMyClientProfile;

/**
 * Récupère un client par son ID (admin seulement)
 */
export const getClientById = async (id: string): Promise<Client> => {
  const response = await api.get<{ data: Client }>(`/users/clients/${id}`);
  return response.data.data;
};
