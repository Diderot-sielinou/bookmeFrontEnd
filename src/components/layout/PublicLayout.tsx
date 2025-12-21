/**
 * Composant PublicLayout
 * 
 * Layout pour les pages publiques (landing, auth, search).
 * Combine Header + Contenu + Footer.
 */

import { Outlet } from 'react-router-dom';

import { Header } from './Header';
import { Footer } from './Footer';

// ==========================================
// TYPES
// ==========================================

interface PublicLayoutProps {
  /** Afficher le header */
  showHeader?: boolean;
  /** Afficher le footer */
  showFooter?: boolean;
  /** Afficher la barre de recherche dans le header */
  showSearch?: boolean;
  /** Contenu personnalisé */
  children?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

export function PublicLayout({
  showHeader = true,
  showFooter = true,
  showSearch = false,
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && <Header showSearch={showSearch} />}

      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default PublicLayout;
