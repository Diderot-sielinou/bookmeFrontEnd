/**
 * Header Component
 * 
 * Main navigation header with user menu, notifications, and search.
 * Features:
 * - Responsive design with mobile menu
 * - User profile dropdown
 * - Notification badges
 * - Message badges
 * - Search bar (optional)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  Calendar,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationBadge } from '@/hooks/useNotifications';
import { useMessagesBadge } from '@/hooks/useMessages';
import {
  Button,
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface HeaderProps {
  showSearch?: boolean;
  onMenuClick?: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function Header({ showSearch = false, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout, isClient, isPrestataire, isAdmin } = useAuth();
  const { count: notificationCount, hasUnread: hasUnreadNotifications } = useNotificationBadge();
  const { count: messageCount, hasUnread: hasUnreadMessages } = useMessagesBadge();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return ROUTES.ADMIN_DASHBOARD;
    if (isPrestataire) return ROUTES.PRESTATAIRE_DASHBOARD;
    return ROUTES.CLIENT_DASHBOARD;
  };

  const displayName = profile
    ? 'businessName' in profile
      ? profile.businessName
      : `${profile.firstName} ${profile.lastName}`
    : user?.email;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* LOGO & MOBILE MENU */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white font-bold">
              B
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">
              Book<span className="text-cyan-500">Me</span>
            </span>
          </Link>
        </div>

        {/* SEARCH BAR (DESKTOP) */}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                aria-label="Search providers"
              />
            </div>
          </form>
        )}

        {/* ACTIONS & USER MENU */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(isClient ? ROUTES.CLIENT_NOTIFICATIONS : ROUTES.PRESTATAIRE_NOTIFICATION)}
                aria-label={`Notifications${hasUnreadNotifications ? ` (${notificationCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(isClient ? ROUTES.CLIENT_MESSAGES : ROUTES.PRESTATAIRE_MESSAGES)}
                aria-label={`Messages${hasUnreadMessages ? ` (${messageCount} unread)` : ''}`}
              >
                <MessageSquare className="h-5 w-5" />
                {hasUnreadMessages && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-medium text-white">
                    {messageCount > 99 ? '99+' : messageCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar
                      src={profile && 'avatar' in profile ? profile.avatar : null}
                      firstName={profile && 'firstName' in profile ? profile.firstName : undefined}
                      lastName={profile && 'lastName' in profile ? profile.lastName : undefined}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isClient ? ROUTES.CLIENT_APPOINTMENTS : ROUTES.PRESTATAIRE_APPOINTMENTS)}>
                    <Calendar className="mr-2 h-4 w-4" /> My Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isClient ? ROUTES.CLIENT_PROFILE : ROUTES.PRESTATAIRE_PROFILE)}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  {isPrestataire && (
                    <DropdownMenuItem onClick={() => navigate(ROUTES.PRESTATAIRE_SETTINGS)}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to={ROUTES.SEARCH}>Find a Provider</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to={ROUTES.LOGIN}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.REGISTER}>Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;