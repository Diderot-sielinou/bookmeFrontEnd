/**
 * Service Admin - ALIGNÉ AVEC BACKEND
 * 
 * Backend: /admin/*
 * Controller: AdminController
 * Service: AdminService
 * 
 * Tous les endpoints nécessitent: JWT + rôle ADMIN
 * 
 * @see backend/src/admin/admin.controller.ts
 * @see backend/src/admin/admin.service.ts
 */

import { api } from '@/lib/api';
import type { User, Prestataire, Review, PaginatedResponse } from '@/types';

// ==========================================
// TYPES - Alignés avec backend AdminService
// ==========================================

/**
 * Statistiques admin globales
 * @see backend/src/admin/admin.service.ts - AdminStats
 */
export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalPrestataires: number;
  pendingPrestataires: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

/**
 * Filtres pour la liste des utilisateurs
 */
export interface UsersFilters {
  role?: 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Filtres pour les logs d'audit
 */
export interface AuditLogsFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

/**
 * Log d'audit - Aligné avec backend AuditLog entity
 * @see backend/src/admin/entities/audit-log.entity.ts
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Utilisateur admin avec relations chargées
 * Le backend charge les relations client/prestataire via query builder
 */
export interface AdminUser extends User {
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatar: string | null;
  };
  prestataire?: {
    id: string;
    businessName: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string | null;
    status: string;
  };
}

/**
 * Prestataire en attente de validation
 * Backend retourne Prestataire avec relation user simplifiée
 */
export interface PendingPrestataire {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  categories: string[];
  phone: string;
  avatar: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  status: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  // Note: documents n'existe pas dans l'entité Prestataire backend
  // À implémenter si nécessaire
}

/**
 * Avis signalé - Aligné avec ce que retourne le backend
 * Le backend retourne Review avec relations client et prestataire
 * Note: flagReason, flaggedAt, flaggedBy doivent être ajoutés à l'entité Review côté backend
 */
export interface FlaggedReview {
  id: string;
  rating: number;
  comment: string;
  prestataireResponse: string | null;
  flagged: boolean;
  flagReason: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  prestataire: {
    id: string;
    businessName: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

// ==========================================
// API RESPONSE WRAPPER
// ==========================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Interface pour les réponses paginées du backend
 * Le backend interceptor retourne { success, data: [...], meta: {...} }
 * où data est l'array directement et meta est au niveau supérieur
 */
interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Helper pour créer un meta par défaut avec toutes les propriétés requises
 */
const createDefaultMeta = (page = 1, limit = 20) => ({
  total: 0,
  page,
  limit,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: page > 1,
});

// ==========================================
// STATISTIQUES
// ==========================================

/**
 * Récupère les statistiques admin globales
 * 
 * @endpoint GET /admin/stats
 * @auth JWT + ADMIN
 * @returns AdminStats
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
  return response.data.data;
};

// ==========================================
// GESTION DES UTILISATEURS
// ==========================================

/**
 * Récupère la liste des utilisateurs avec filtres
 * 
 * @endpoint GET /admin/users?role=&page=&limit=&search=
 * @auth JWT + ADMIN
 * @param filters - Filtres optionnels
 * @returns PaginatedResponse<AdminUser>
 */
export const getUsers = async (
  filters?: UsersFilters
): Promise<PaginatedResponse<AdminUser>> => {
  const response = await api.get<PaginatedApiResponse<AdminUser>>(
    '/admin/users',
    { params: filters }
  );
  // Reconstruire la structure PaginatedResponse attendue par les pages
  return {
    data: response.data.data || [],
    meta: response.data.meta || createDefaultMeta(filters?.page, filters?.limit || 20),
  };
};

/**
 * Suspend un utilisateur
 * 
 * @endpoint PATCH /admin/users/:id/suspend
 * @auth JWT + ADMIN
 * @param userId - ID de l'utilisateur à suspendre
 * @param reason - Raison de la suspension (optionnel)
 */
export const suspendUser = async (
  userId: string,
  reason?: string
): Promise<void> => {
  await api.patch(`/admin/users/${userId}/suspend`, { reason });
};

/**
 * Réactive un utilisateur suspendu
 * 
 * @endpoint PATCH /admin/users/:id/reactivate
 * @auth JWT + ADMIN
 * @param userId - ID de l'utilisateur à réactiver
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  await api.patch(`/admin/users/${userId}/reactivate`);
};

/**
 * Supprime un utilisateur (soft delete via suspension)
 * Note: Le backend n'expose pas de DELETE /admin/users/:id
 * On suspend l'utilisateur à la place
 * 
 * @param userId - ID de l'utilisateur
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await suspendUser(userId, 'Account deleted by admin');
};

// ==========================================
// VALIDATION DES PRESTATAIRES
// ==========================================

/**
 * Récupère les prestataires en attente de validation
 * 
 * @endpoint GET /admin/prestataires/pending?page=&limit=
 * @auth JWT + ADMIN
 * @param page - Numéro de page
 * @param limit - Nombre par page
 * @returns PaginatedResponse<PendingPrestataire>
 */
export const getPendingPrestataires = async (
  page?: number,
  limit?: number
): Promise<PaginatedResponse<PendingPrestataire>> => {
  const response = await api.get<PaginatedApiResponse<PendingPrestataire>>(
    '/admin/prestataires/pending',
    { params: { page, limit } }
  );
  // Reconstruire la structure PaginatedResponse attendue par les pages
  return {
    data: response.data.data || [],
    meta: response.data.meta || createDefaultMeta(page, limit || 10),
  };
};

/**
 * Approuve un prestataire
 * 
 * @endpoint POST /admin/prestataires/:id/approve
 * @auth JWT + ADMIN
 * @param prestataireId - ID du prestataire
 * @returns Prestataire approuvé
 */
export const approvePrestataire = async (
  prestataireId: string
): Promise<Prestataire> => {
  const response = await api.post<ApiResponse<Prestataire>>(
    `/admin/prestataires/${prestataireId}/approve`
  );
  return response.data.data;
};

/**
 * Rejette un prestataire
 * 
 * @endpoint POST /admin/prestataires/:id/reject
 * @auth JWT + ADMIN
 * @param prestataireId - ID du prestataire
 * @param reason - Raison du rejet
 */
export const rejectPrestataire = async (
  prestataireId: string,
  reason: string
): Promise<void> => {
  await api.post(`/admin/prestataires/${prestataireId}/reject`, { reason });
};

// ==========================================
// MODÉRATION DES AVIS
// ==========================================

/**
 * Récupère les avis signalés
 * 
 * @endpoint GET /admin/reviews/flagged?page=&limit=
 * @auth JWT + ADMIN
 * @param page - Numéro de page
 * @param limit - Nombre par page
 * @returns PaginatedResponse<FlaggedReview>
 */
export const getFlaggedReviews = async (
  page?: number,
  limit?: number
): Promise<PaginatedResponse<FlaggedReview>> => {
  const response = await api.get<PaginatedApiResponse<FlaggedReview>>(
    '/admin/reviews/flagged',
    { params: { page, limit } }
  );
  // Reconstruire la structure PaginatedResponse attendue par les pages
  return {
    data: response.data.data || [],
    meta: response.data.meta || createDefaultMeta(page, limit || 10),
  };
};

/**
 * Masque un avis (le rend invisible)
 * 
 * @endpoint PATCH /admin/reviews/:id/hide
 * @auth JWT + ADMIN
 * @param reviewId - ID de l'avis
 */
export const hideReview = async (reviewId: string): Promise<void> => {
  await api.patch(`/admin/reviews/${reviewId}/hide`);
};

/**
 * Retire le signalement d'un avis (approuve l'avis)
 * 
 * @endpoint PATCH /admin/reviews/:id/unflag
 * @auth JWT + ADMIN
 * @param reviewId - ID de l'avis
 */
export const unflagReview = async (reviewId: string): Promise<void> => {
  await api.patch(`/admin/reviews/${reviewId}/unflag`);
};

/**
 * Approuve un avis signalé (alias de unflagReview)
 * @param reviewId - ID de l'avis
 */
export const approveReview = unflagReview;

/**
 * Supprime/masque un avis
 * Note: Utilise hideReview car le backend n'a pas de DELETE
 * 
 * @param reviewId - ID de l'avis
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  await hideReview(reviewId);
};

/**
 * Envoie un avertissement à l'auteur d'un avis
 * 
 * ⚠️ TODO: Cet endpoint n'existe pas côté backend
 * Pour l'instant, on unflag l'avis et on log
 * À implémenter: POST /admin/reviews/:id/warn
 * 
 * @param reviewId - ID de l'avis
 * @param message - Message d'avertissement
 */
export const warnReviewAuthor = async (
  reviewId: string,
  message: string
): Promise<void> => {
  console.warn('[TODO] warnReviewAuthor not implemented in backend', { reviewId, message });
  // Pour l'instant, on unflag simplement l'avis
  await unflagReview(reviewId);
};

// ==========================================
// LOGS D'AUDIT
// ==========================================

/**
 * Récupère les logs d'audit
 * 
 * @endpoint GET /admin/audit-logs?userId=&action=&entityType=&page=&limit=
 * @auth JWT + ADMIN
 * @param filters - Filtres optionnels
 * @returns PaginatedResponse<AuditLog>
 */
export const getAuditLogs = async (
  filters?: AuditLogsFilters
): Promise<PaginatedResponse<AuditLog>> => {
  const response = await api.get<PaginatedApiResponse<AuditLog>>(
    '/admin/audit-logs',
    { params: filters }
  );
  // Reconstruire la structure PaginatedResponse attendue par les pages
  return {
    data: response.data.data || [],
    meta: response.data.meta || createDefaultMeta(filters?.page, filters?.limit || 20),
  };
};

// ==========================================
// CATÉGORIES - TODO: À implémenter côté backend
// ==========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
  prestatairesCount: number;
  children?: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  console.warn('[TODO] Categories API not implemented in backend');
  throw new Error('Categories API not implemented');
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  console.warn('[TODO] Categories API not implemented in backend');
  throw new Error('Categories API not implemented');
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  console.warn('[TODO] Categories API not implemented in backend');
  throw new Error('Categories API not implemented');
};

export const deleteCategory = async (id: string): Promise<void> => {
  console.warn('[TODO] Categories API not implemented in backend');
  throw new Error('Categories API not implemented');
};

// ==========================================
// SERVICE GROUPÉ
// ==========================================

export const adminService = {
  // Statistiques
  getStats: getAdminStats,
  
  // Utilisateurs
  getUsers,
  suspendUser,
  reactivateUser,
  deleteUser,
  
  // Prestataires
  getPendingPrestataires,
  approvePrestataire,
  rejectPrestataire,
  
  // Avis
  getFlaggedReviews,
  hideReview,
  unflagReview,
  approveReview,
  deleteReview,
  warnReviewAuthor,
  
  // Logs
  getAuditLogs,
  
  // Catégories (TODO)
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default adminService;