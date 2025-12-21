/**
 * Composant AuthLayout
 * 
 * Layout minimaliste pour les pages d'authentification.
 * Centré avec un fond décoratif.
 */

import { Link, Outlet } from 'react-router-dom';

import { ROUTES } from '@/lib/constants';

// ==========================================
// TYPES
// ==========================================

interface AuthLayoutProps {
  children?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-mint">
      {/* Pattern décoratif en arrière-plan */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2312B2C1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header minimal */}
      <header className="relative z-10 p-6">
        <Link to={ROUTES.HOME} className="flex items-center space-x-2 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-white font-bold text-lg">
            B
          </div>
          <span className="font-bold text-2xl text-charcoal">
            Book<span className="text-cyan-500">Me</span>
          </span>
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BookMe. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}

export default AuthLayout;
