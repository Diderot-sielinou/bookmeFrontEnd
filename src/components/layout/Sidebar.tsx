/**
 * Composant Sidebar
 * 
 * Barre latérale de navigation pour les dashboards.
 * Adaptée selon le rôle (client, prestataire, admin).
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  User,
  Settings,
  Briefcase,
  Users,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface SidebarProps {
  /** Sidebar réduite */
  collapsed?: boolean;
  /** Callback pour toggle collapse */
  onToggle?: () => void;
  /** Classes additionnelles */
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

// ==========================================
// CONFIGURATION NAVIGATION
// ==========================================

const clientNavItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.CLIENT_DASHBOARD, icon: LayoutDashboard },
  { label: 'My Appointments', href: ROUTES.CLIENT_APPOINTMENTS, icon: Calendar },
  { label: 'Messages', href: ROUTES.CLIENT_MESSAGES, icon: MessageSquare },
  { label: 'My Reviews', href: ROUTES.CLIENT_REVIEWS, icon: Star },
  { label: 'My Profile', href: ROUTES.CLIENT_PROFILE, icon: User },
];

const prestataireNavItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.PRESTATAIRE_DASHBOARD, icon: LayoutDashboard },
  { label: 'My Profile', href: ROUTES.PRESTATAIRE_PROFILE, icon: User },
  { label: 'My Services', href: ROUTES.PRESTATAIRE_SERVICES, icon: Briefcase },
  { label: 'My Availability', href: ROUTES.PRESTATAIRE_SLOTS, icon: Clock }, // "Availability" ou "Time Slots"
  { label: 'Appointments', href: ROUTES.PRESTATAIRE_APPOINTMENTS, icon: Calendar },
  { label: 'Reviews', href: ROUTES.PRESTATAIRE_REVIEWS, icon: Star },
  { label: 'Messages', href: ROUTES.PRESTATAIRE_MESSAGES, icon: MessageSquare },
  { label: 'Settings', href: ROUTES.PRESTATAIRE_SETTINGS, icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Users', href: ROUTES.ADMIN_USERS, icon: Users },
  { label: 'Verification', href: ROUTES.ADMIN_PRESTATAIRES_VALIDATION, icon: Shield }, // "Verification" est plus pro que "Validation"
  { label: 'Moderation', href: ROUTES.ADMIN_REVIEWS_MODERATION, icon: Star },
  { label: 'Categories', href: ROUTES.ADMIN_CATEGORIES, icon: Briefcase },
  { label: 'Audit Logs', href: ROUTES.ADMIN_LOGS, icon: FileText },
];

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
  const location = useLocation();
  const { isClient, isPrestataire, isAdmin } = useAuth();

  // Sélectionner les items de navigation selon le rôle
  let navItems: NavItem[] = [];
  if (isAdmin) {
    navItems = adminNavItems;
  } else if (isPrestataire) {
    navItems = prestataireNavItems;
  } else if (isClient) {
    navItems = clientNavItems;
  }

  // Vérifier si un lien est actif
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* En-tête sidebar */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="font-semibold text-lg">Navigation</span>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(collapsed && 'mx-auto')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-100'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active && 'text-cyan-600')} />
              
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pied de sidebar */}
      <div className="border-t p-4">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            BookMe © 2024
          </p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
