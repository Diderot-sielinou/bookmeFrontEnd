/**
 * Composants de protection des routes
 * 
 * ProtectedRoute : Route accessible uniquement si authentifié
 * GuestRoute : Route accessible uniquement si non authentifié
 */

import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { LoadingOverlay } from '@/components/ui/spinner';

// ==========================================
// TYPES
// ==========================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'CLIENT' | 'PRESTATAIRE' | 'ADMIN'>;
}

interface GuestRouteProps {
  children: React.ReactNode;
}

// ==========================================
// PROTECTED ROUTE
// ==========================================

/**
 * Route protégée nécessitant une authentification
 * 
 * @param allowedRoles - Rôles autorisés (si non spécifié, tous les utilisateurs authentifiés)
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Attendre l'initialisation
  if (!isInitialized) {
    return <LoadingOverlay />;
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Vérifier le rôle si spécifié
  if (allowedRoles && user && !allowedRoles.includes(user.role as 'CLIENT' | 'PRESTATAIRE' | 'ADMIN')) {
    // Rediriger vers le dashboard approprié selon le rôle
    const redirectTo = getDefaultDashboard(user.role);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// ==========================================
// GUEST ROUTE
// ==========================================

/**
 * Route accessible uniquement aux visiteurs non connectés
 * Redirige vers le dashboard si déjà authentifié
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Attendre l'initialisation
  if (!isInitialized) {
    return <LoadingOverlay />;
  }

  // Rediriger vers le dashboard si déjà connecté
  if (isAuthenticated && user) {
    const redirectTo = getDefaultDashboard(user.role);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Retourne le dashboard par défaut selon le rôle
 */
function getDefaultDashboard(role: string): string {
  switch (role) {
    case 'CLIENT':
      return ROUTES.CLIENT_DASHBOARD;
    case 'PRESTATAIRE':
      return ROUTES.PRESTATAIRE_DASHBOARD;
    case 'ADMIN':
      return ROUTES.ADMIN_DASHBOARD;
    default:
      return ROUTES.HOME;
  }
}
