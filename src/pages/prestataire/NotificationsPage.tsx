/**
 * NotificationsPage (Provider)
 * 
 * Notification management page for providers.
 * Displays notifications for appointments, messages, reviews, and system.
 * ALIGNED WITH BACKEND
 */

import { useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
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
    return format(date, "'Today at' HH:mm", { locale: enUS });
  }
  
  if (isYesterday(date)) {
    return format(date, "'Yesterday at' HH:mm", { locale: enUS });
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE 'at' HH:mm", { locale: enUS });
  }
  
  return format(date, "MMMM d 'at' HH:mm", { locale: enUS });
};

const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  const groups: { [key: string]: Notification[] } = {};
  
  notifications.forEach((notification) => {
    const date = parseISO(notification.createdAt);
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = "Today";
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Older';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  const orderedKeys = ["Today", 'Yesterday', 'This Week', 'Older'];
  
  return orderedKeys
    .filter((key) => groups[key]?.length > 0)
    .map((key) => ({
      label: key,
      notifications: groups[key],
    }));
};

// Map types for filters
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

  // Extract additional data if available
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
                  Mark as Read
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Extra info from data */}
        {notificationData?.date && notificationData?.time && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(parseISO(notificationData.date), 'MMMM d, yyyy', { locale: enUS })} at {notificationData.time.slice(0, 5)}
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
              View Details
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
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notification Settings</SheetTitle>
          <SheetDescription>
            Choose how you want to be notified
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Email notifications */}
          <div>
            <h4 className="font-medium mb-4">Email Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-appointments" className="flex flex-col gap-1">
                  <span>Appointments</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    New bookings and cancellations
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
                    New messages from clients
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
                  <span>Reviews</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    New client reviews
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
                    Promotions and news
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
            <h4 className="font-medium mb-4">Push Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-appointments" className="flex flex-col gap-1">
                  <span>Appointments</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Real-time alerts
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
                    Instant notifications
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
                  <span>Reviews</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Be notified of new reviews
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

          <Button className="w-full">Save Preferences</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function NotificationsPage() {
  // ✅ Use useNotifications hook aligned with backend
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

  // Stats based on real data
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
        showSuccess('Notification deleted');
        refresh(); // Refresh list
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
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay informed
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
            Refresh
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
                <p className="text-xs text-muted-foreground">Unread</p>
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
                <p className="text-xs text-muted-foreground">Appointments</p>
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
                <p className="text-xs text-muted-foreground">Reviews</p>
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
                  All
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
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
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="system">System</SelectItem>
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
                    Mark All as Read
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
                title={activeTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
                description={
                  activeTab === 'unread'
                    ? "You're all caught up! All your notifications have been read."
                    : "You haven't received any notifications yet."
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
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The notification will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default NotificationsPage;