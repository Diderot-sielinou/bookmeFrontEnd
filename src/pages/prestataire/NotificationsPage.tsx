/**
 * NotificationsPage (Prestataire)
 * 
 * Page de gestion des notifications pour les prestataires.
 * Affiche les notifications de rendez-vous, messages, avis, et système.
 * ALIGNÉ AVEC LE BACKEND
 */

import { useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bell,
  BellOff,
  Calendar,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Settings,
  ChevronRight,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ROUTES } from '@/lib/constants';
import { useNotifications } from '@/hooks/useNotifications';
import { deleteNotification } from '@/services/notifications.service';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import type { Notification } from '@/types';
import { NotificationType } from '@/types';

// ==========================================
// TYPES
// ==========================================

interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

// ==========================================
// HELPERS
// ==========================================

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NEW_BOOKING:
      return { icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' };
    case NotificationType.CANCELLATION:
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
    case NotificationType.REMINDER:
      return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' };
    case NotificationType.NEW_MESSAGE:
      return { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' };
    case NotificationType.NEW_REVIEW:
      return { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case NotificationType.BADGE_EARNED:
      return { icon: Award, color: 'text-blue-600', bg: 'bg-blue-100' };
    case NotificationType.SYSTEM:
    default:
      return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  const { type, relatedId } = notification;

  switch (type) {
    case NotificationType.NEW_BOOKING:
    case NotificationType.CANCELLATION:
    case NotificationType.REMINDER:
      return relatedId 
        ? `${ROUTES.PRESTATAIRE_APPOINTMENTS}?id=${relatedId}` 
        : ROUTES.PRESTATAIRE_APPOINTMENTS;
    case NotificationType.NEW_MESSAGE:
      return relatedId 
        ? `${ROUTES.PRESTATAIRE_MESSAGES}?appointment=${relatedId}`
        : ROUTES.PRESTATAIRE_MESSAGES;
    case NotificationType.NEW_REVIEW:
      return ROUTES.PRESTATAIRE_REVIEWS;
    case NotificationType.BADGE_EARNED:
      return ROUTES.PRESTATAIRE_DASHBOARD;
    default:
      return null;
  }
};

const formatNotificationDate = (dateString: string): string => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return format(date, "'Aujourd'hui à' HH:mm", { locale: fr });
  }
  
  if (isYesterday(date)) {
    return format(date, "'Hier à' HH:mm", { locale: fr });
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE 'à' HH:mm", { locale: fr });
  }
  
  return format(date, "d MMMM 'à' HH:mm", { locale: fr });
};

const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  const groups: { [key: string]: Notification[] } = {};
  
  notifications.forEach((notification) => {
    const date = parseISO(notification.createdAt);
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = "Aujourd'hui";
    } else if (isYesterday(date)) {
      groupKey = 'Hier';
    } else if (isThisWeek(date)) {
      groupKey = 'Cette semaine';
    } else {
      groupKey = 'Plus ancien';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  const orderedKeys = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];
  
  return orderedKeys
    .filter((key) => groups[key]?.length > 0)
    .map((key) => ({
      label: key,
      notifications: groups[key],
    }));
};

// Mapper les types pour les filtres
const getTypeCategory = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_BOOKING:
    case NotificationType.CANCELLATION:
    case NotificationType.REMINDER:
      return 'appointments';
    case NotificationType.NEW_MESSAGE:
      return 'messages';
    case NotificationType.NEW_REVIEW:
      return 'reviews';
    case NotificationType.BADGE_EARNED:
    case NotificationType.SYSTEM:
    default:
      return 'system';
  }
};

// ==========================================
// NOTIFICATION ITEM COMPONENT
// ==========================================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
  const link = getNotificationLink(notification);
  
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  // Extraire les données supplémentaires si disponibles
  const notificationData = notification.data as {
    appointmentId?: string;
    date?: string;
    time?: string;
    badgeType?: string;
  } | null;

  const content = (
    <div
      className={`flex gap-4 p-4 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          
          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.read && (
                <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Marquer comme lu
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Extra info from data */}
        {notificationData?.date && notificationData?.time && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(parseISO(notificationData.date), 'd MMMM yyyy', { locale: fr })} à {notificationData.time.slice(0, 5)}
            </span>
          </div>
        )}

        {/* Timestamp and link */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatNotificationDate(notification.createdAt)}
          </span>
          {link && (
            <span className="text-xs text-primary flex items-center gap-1">
              Voir les détails
              <ChevronRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
      )}
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

// ==========================================
// NOTIFICATION SETTINGS COMPONENT
// ==========================================

interface NotificationSettings {
  emailAppointments: boolean;
  emailMessages: boolean;
  emailReviews: boolean;
  emailMarketing: boolean;
  pushAppointments: boolean;
  pushMessages: boolean;
  pushReviews: boolean;
}

function NotificationSettingsSheet() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailAppointments: true,
    emailMessages: true,
    emailReviews: true,
    emailMarketing: false,
    pushAppointments: true,
    pushMessages: true,
    pushReviews: true,
  });

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Paramètres de notification</SheetTitle>
          <SheetDescription>
            Choisissez comment vous souhaitez être notifié
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Email notifications */}
          <div>
            <h4 className="font-medium mb-4">Notifications par email</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-appointments" className="flex flex-col gap-1">
                  <span>Rendez-vous</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Nouvelles réservations et annulations
                  </span>
                </Label>
                <Switch
                  id="email-appointments"
                  checked={settings.emailAppointments}
                  onCheckedChange={(v) => updateSetting('emailAppointments', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="email-messages" className="flex flex-col gap-1">
                  <span>Messages</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Nouveaux messages des clients
                  </span>
                </Label>
                <Switch
                  id="email-messages"
                  checked={settings.emailMessages}
                  onCheckedChange={(v) => updateSetting('emailMessages', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="email-reviews" className="flex flex-col gap-1">
                  <span>Avis</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Nouveaux avis clients
                  </span>
                </Label>
                <Switch
                  id="email-reviews"
                  checked={settings.emailReviews}
                  onCheckedChange={(v) => updateSetting('emailReviews', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="email-marketing" className="flex flex-col gap-1">
                  <span>Marketing</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Promotions et nouveautés
                  </span>
                </Label>
                <Switch
                  id="email-marketing"
                  checked={settings.emailMarketing}
                  onCheckedChange={(v) => updateSetting('emailMarketing', v)}
                />
              </div>
            </div>
          </div>

          {/* Push notifications */}
          <div>
            <h4 className="font-medium mb-4">Notifications push</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-appointments" className="flex flex-col gap-1">
                  <span>Rendez-vous</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Alertes en temps réel
                  </span>
                </Label>
                <Switch
                  id="push-appointments"
                  checked={settings.pushAppointments}
                  onCheckedChange={(v) => updateSetting('pushAppointments', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="push-messages" className="flex flex-col gap-1">
                  <span>Messages</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Notifications instantanées
                  </span>
                </Label>
                <Switch
                  id="push-messages"
                  checked={settings.pushMessages}
                  onCheckedChange={(v) => updateSetting('pushMessages', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="push-reviews" className="flex flex-col gap-1">
                  <span>Avis</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Soyez alerté des nouveaux avis
                  </span>
                </Label>
                <Switch
                  id="push-reviews"
                  checked={settings.pushReviews}
                  onCheckedChange={(v) => updateSetting('pushReviews', v)}
                />
              </div>
            </div>
          </div>

          <Button className="w-full">Enregistrer les préférences</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function NotificationsPage() {
  // ✅ Utiliser le hook useNotifications aligné avec le backend
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
    isMarkingAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats basées sur les vraies données
  const appointmentCount = notifications.filter(
    (n) => [NotificationType.NEW_BOOKING, NotificationType.CANCELLATION, NotificationType.REMINDER].includes(n.type) && !n.read
  ).length;
  const messageCount = notifications.filter(
    (n) => n.type === NotificationType.NEW_MESSAGE && !n.read
  ).length;
  const reviewCount = notifications.filter(
    (n) => n.type === NotificationType.NEW_REVIEW && !n.read
  ).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'unread' && notification.read) return false;
    if (typeFilter !== 'all') {
      const category = getTypeCategory(notification.type);
      if (category !== typeFilter) return false;
    }
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // Actions
  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      setIsDeleting(true);
      try {
        await deleteNotification(notificationToDelete);
        showSuccess('Notification supprimée');
        refresh(); // Rafraîchir la liste
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setIsDeleting(false);
      }
    }
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et restez informé
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <NotificationSettingsSheet />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer hover:bg-muted/50 ${typeFilter === 'all' ? 'ring-2 ring-primary' : ''}`} 
          onClick={() => setTypeFilter('all')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Non lues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:bg-muted/50 ${typeFilter === 'appointments' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter('appointments')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointmentCount}</p>
                <p className="text-xs text-muted-foreground">Rendez-vous</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:bg-muted/50 ${typeFilter === 'messages' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter('messages')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{messageCount}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:bg-muted/50 ${typeFilter === 'reviews' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter('reviews')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviewCount}</p>
                <p className="text-xs text-muted-foreground">Avis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Card>
        <div className="p-4 pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
              <TabsList>
                <TabsTrigger value="all">
                  Toutes
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="appointments">Rendez-vous</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="reviews">Avis</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleMarkAllAsRead} 
                    disabled={unreadCount === 0 || isMarkingAllAsRead}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Tout marquer comme lu
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<BellOff className="h-12 w-12" />}
                title={activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                description={
                  activeTab === 'unread'
                    ? 'Vous êtes à jour ! Toutes vos notifications ont été lues.'
                    : "Vous n'avez pas encore reçu de notification."
                }
              />
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {groupedNotifications.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-2 bg-muted/50 sticky top-0">
                      <p className="text-sm font-medium text-muted-foreground">
                        {group.label}
                      </p>
                    </div>
                    <div className="divide-y">
                      {group.notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la notification ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La notification sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default NotificationsPage;