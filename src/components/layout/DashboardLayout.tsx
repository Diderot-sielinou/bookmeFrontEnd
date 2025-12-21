/**
 * Composant DashboardLayout
 * 
 * Layout pour les pages de dashboard (client, prestataire, admin).
 * Combine Header + Sidebar + Contenu principal.
 * 
 * Fonctionnalités :
 * - Sidebar collapsible sur desktop
 * - Drawer mobile pour la navigation
 * - Gestion du scroll
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface DashboardLayoutProps {
  /** Contenu à afficher (si pas utilisé avec Outlet) */
  children?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // État de la sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex">
        {/* Sidebar Desktop */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex h-[calc(100vh-4rem)] sticky top-16"
        />

        {/* Sidebar Mobile (Drawer) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar className="w-full border-r-0" />
          </SheetContent>
        </Sheet>

        {/* Contenu principal */}
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300',
            'p-4 sm:p-6 lg:p-8'
          )}
        >
          {/* Utilise children si fourni, sinon Outlet pour le routing */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
