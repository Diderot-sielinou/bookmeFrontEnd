/**
 * Service du tableau de bord
 * 
 * Gère les statistiques et données du dashboard :
 * - Statistiques globales
 * - Graphiques (RDV par jour, revenus par mois)
 * - Distribution des notes
 */

import { api } from '@/lib/api';
import type {
  DashboardStats,
  AppointmentsByDay,
  RevenueByMonth,
  RatingDistribution,
  Appointment,
  Review,
} from '@/types/entities';

// ==========================================
// STATISTIQUES PRESTATAIRE
// ==========================================

/**
 * Récupère les statistiques globales du prestataire
 */
export const getStats = async (): Promise<DashboardStats> => {
  const response = await api.get<{ data: DashboardStats }>('/dashboard/stats');
  return response.data.data;
};

/**
 * Récupère les données du dashboard client
 */
export const getClientDashboard = async (): Promise<{
  upcomingAppointments: Appointment[];
  recentAppointments: Appointment[];
  stats: {
    totalAppointments: number;
    pendingReviews: number;
    favoritePrestataires: number;
  };
}> => {
  const response = await api.get('/dashboard/client');
  return response.data.data;
};

/**
 * Récupère les données du dashboard prestataire
 */
export const getPrestataireDashboard = async (): Promise<{
  stats: DashboardStats;
  todayAppointments: Appointment[];
  recentReviews: Review[];
}> => {
  const response = await api.get('/dashboard/prestataire');
  return response.data.data;
};

/**
 * Récupère les données du dashboard admin
 */
export const getAdminDashboard = async (): Promise<{
  stats: {
    totalUsers: number;
    totalPrestataires: number;
    totalClients: number;
    totalAppointments: number;
    pendingValidations: number;
    flaggedReviews: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}> => {
  const response = await api.get('/dashboard/admin');
  return response.data.data;
};

/**
 * Récupère les rendez-vous par jour (pour graphique)
 * 
 * @param days - Nombre de jours à inclure (par défaut 30)
 */
export const getAppointmentsByDay = async (
  days: number = 30
): Promise<AppointmentsByDay[]> => {
  const response = await api.get<{ data: AppointmentsByDay[] }>(
    '/dashboard/appointments/chart',
    { params: { days } }
  );
  return response.data.data;
};

/**
 * Récupère les revenus par mois (pour graphique)
 * 
 * @param months - Nombre de mois à inclure (par défaut 12)
 */
export const getRevenueByMonth = async (
  months: number = 12
): Promise<RevenueByMonth[]> => {
  const response = await api.get<{ data: RevenueByMonth[] }>(
    '/dashboard/revenue/chart',
    { params: { months } }
  );
  return response.data.data;
};

/**
 * Récupère les rendez-vous du jour
 */
export const getTodayAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<{ data: Appointment[] }>(
    '/dashboard/appointments/today'
  );
  return response.data.data;
};

/**
 * Récupère les derniers avis
 * 
 * @param limit - Nombre d'avis à récupérer (par défaut 5)
 */
export const getRecentReviews = async (limit: number = 5): Promise<Review[]> => {
  const response = await api.get<{ data: Review[] }>(
    '/dashboard/reviews/recent',
    { params: { limit } }
  );
  return response.data.data;
};

/**
 * Récupère la distribution des notes (pour graphique)
 */
export const getRatingDistribution = async (): Promise<RatingDistribution[]> => {
  const response = await api.get<{ data: RatingDistribution[] }>(
    '/dashboard/reviews/distribution'
  );
  return response.data.data;
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Calcule le taux de variation entre deux valeurs
 */
export const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Formate les données pour Recharts
 */
export const formatChartData = (
  data: AppointmentsByDay[]
): Array<{ date: string; value: number }> => {
  return data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    }),
    value: item.count,
  }));
};

/**
 * Formate les données de revenus pour Recharts
 */
export const formatRevenueChartData = (
  data: RevenueByMonth[]
): Array<{ month: string; revenue: number; count: number }> => {
  return data.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('fr-FR', {
      month: 'short',
      year: '2-digit',
    }),
    revenue: item.revenue,
    count: item.count,
  }));
};
