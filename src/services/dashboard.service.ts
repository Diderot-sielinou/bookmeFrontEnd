/**
 * Service du tableau de bord - ALIGNÉ AVEC BACKEND
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
 * ✅ CORRIGÉ : Aligné avec le backend
 */
export const getStats = async (): Promise<DashboardStats> => {
  const response = await api.get<{ data: DashboardStats }>('/dashboard/stats');
  return response.data.data;
};

/**
 * Récupère les rendez-vous par jour (pour graphique)
 * ✅ CORRIGÉ : Parsing correct
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
 * ✅ CORRIGÉ : Parsing correct
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
 * ✅ CORRIGÉ : Utilise le bon endpoint
 */
export const getTodayAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<{ data: Appointment[] }>(
    '/appointments/today' // ✅ Utilise le endpoint appointments
  );
  return response.data.data;
};

/**
 * Récupère les derniers avis
 * ✅ CORRIGÉ : Parsing correct
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
 * ✅ CORRIGÉ : Le backend retourne un objet, pas un tableau
 */
export const getRatingDistribution = async (): Promise<Record<number, number>> => {
  const response = await api.get<{ data: Record<number, number> }>(
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
): Array<{ month: string; revenue: number }> => {
  return data.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('fr-FR', {
      month: 'short',
      year: '2-digit',
    }),
    revenue: item.revenue,
  }));
};