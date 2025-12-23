/**
 * Service des clients
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
  const response = await api.get<{ data: Client }>('/users/clients/me');
  return response.data.data;
};

// Alias
export const getClientProfile = getMyClientProfile;

/**
 * Met à jour le profil du client connecté
 */
export const updateMyClientProfile = async (
  data: UpdateClientDto
): Promise<Client> => {
  const response = await api.patch<{ data: Client }>(
    '/users/clients/me',
    data
  );
  return response.data.data;
};

// Alias
export const updateClientProfileService = updateMyClientProfile;

/**
 * Récupère un client par son ID (admin seulement)
 */
export const getClientById = async (id: string): Promise<Client> => {
  const response = await api.get<{ data: Client }>(`/users/clients/${id}`);
  return response.data.data;
};