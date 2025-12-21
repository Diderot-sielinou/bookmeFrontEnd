/**
 * Composants de garde pour les routes protégées
 * 
 * Ces composants vérifient l'authentification et les rôles
 * avant de rendre les routes enfants.
 */

import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { LoadingOverlay } from '@/components/ui/spinner';
import { ROUTES } from '@/lib/constants';
import type { UserRole } from '@/types';

// ==========================================
// PROTECTED ROUTE
// Vérifie que l'utilisateur est authentifié
// ==========================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** URL de redirection si non authentifié */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  // Afficher un loader pendant l'initialisation
  if (!isInitialized || isLoading) {
    return <LoadingOverlay />;
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    // Sauvegarder l'URL actuelle pour redirection après login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}

// ==========================================
// ROLE GUARD
// Vérifie que l'utilisateur a le bon rôle
// ==========================================

interface RoleGuardProps {
  children: React.ReactNode;
  /** Rôles autorisés */
  allowedRoles: Array<'CLIENT' | 'PRESTATAIRE' | 'ADMIN'>;
  /** URL de redirection si rôle non autorisé */
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = ROUTES.HOME,
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  // Vérifier si l'utilisateur a un rôle autorisé
  const hasAllowedRole = user && allowedRoles.includes(user.role as 'CLIENT' | 'PRESTATAIRE' | 'ADMIN');

  if (!hasAllowedRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// ==========================================
// GUEST ONLY
// Route accessible uniquement aux utilisateurs non connectés
// ==========================================

interface GuestOnlyProps {
  children: React.ReactNode;
  /** URL de redirection si authentifié */
  redirectTo?: string;
}

export function GuestOnly({
  children,
  redirectTo,
}: GuestOnlyProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Afficher le loader pendant l'initialisation
  if (!isInitialized) {
    return <LoadingOverlay />;
  }

  // Rediriger vers le dashboard approprié si authentifié
  if (isAuthenticated) {
    const defaultRedirect =
      user?.role === 'CLIENT'
        ? ROUTES.CLIENT_DASHBOARD
        : user?.role === 'PRESTATAIRE'
        ? ROUTES.PRESTATAIRE_DASHBOARD
        : user?.role === 'ADMIN'
        ? ROUTES.ADMIN_DASHBOARD
        : ROUTES.HOME;

    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
}

// ==========================================
// EMAIL VERIFIED GUARD
// Vérifie que l'email de l'utilisateur est vérifié
// ==========================================

interface EmailVerifiedGuardProps {
  children: React.ReactNode;
  /** URL de redirection si email non vérifié */
  redirectTo?: string;
}

export function EmailVerifiedGuard({
  children,
  redirectTo = '/verify-email-required',
}: EmailVerifiedGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (user && !user.emailVerified) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
