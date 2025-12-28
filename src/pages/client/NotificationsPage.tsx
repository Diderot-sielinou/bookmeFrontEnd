/**
 * Notifications Page (Client)
 * 
 * Notifications management page for clients.
 * Displays all notifications with filters and actions.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  Trash2,
  CheckCheck,
  Filter,
  Settings,
  Loader2,
  Award,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification as NotificationType } from '@/types';
import { NotificationType as NotificationTypeEnum } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ==========================================
// HELPERS
// ==========================================

const getNotificationIcon = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.NEW_BOOKING:
    case NotificationTypeEnum.CANCELLATION:
    case NotificationTypeEnum.REMINDER:
      return Calendar;
    case NotificationTypeEnum.NEW_MESSAGE:
      return MessageSquare;
    case NotificationTypeEnum.NEW_REVIEW:
      return Star;
    case NotificationTypeEnum.BADGE_EARNED:
      return Award;
    case NotificationTypeEnum.SYSTEM:
    default:
      return Info;
  }
};

const getNotificationColor = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.NEW_BOOKING:
      return 'text-green-600 bg-green-100';
    case NotificationTypeEnum.CANCELLATION:
      return 'text-red-600 bg-red-100';
    case NotificationTypeEnum.REMINDER:
      return 'text-orange-600 bg-orange-100';
    case NotificationTypeEnum.NEW_MESSAGE:
      return 'text-purple-600 bg-purple-100';
    case NotificationTypeEnum.NEW_REVIEW:
      return 'text-yellow-600 bg-yellow-100';
    case NotificationTypeEnum.BADGE_EARNED:
      return 'text-blue-600 bg-blue-100';
    case NotificationTypeEnum.SYSTEM:
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getNotificationTitle = (type: NotificationTypeEnum): string => {
  switch (type) {
    case NotificationTypeEnum.NEW_BOOKING:
      return 'New Appointment';
    case NotificationTypeEnum.CANCELLATION:
      return 'Appointment Cancelled';
    case NotificationTypeEnum.REMINDER:
      return 'Appointment Reminder';
    case NotificationTypeEnum.NEW_MESSAGE:
      return 'New Message';
    case NotificationTypeEnum.NEW_REVIEW:
      return 'New Review';
    case NotificationTypeEnum.BADGE_EARNED:
      return 'Badge Earned';
    case NotificationTypeEnum.SYSTEM:
    default:
      return 'System Notification';
  }
};

// ==========================================
// NOTIFICATION ITEM COMPONENT
// ==========================================

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: enUS,
  });
  
  const IconComponent = getNotificationIcon(notification.type);

  return (
    <div
      className={`p-4 border-b last:border-b-0 transition-colors ${
        !notification.read ? 'bg-primary/5' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                {notification.title || getNotificationTitle(notification.type)}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.read && (
                  <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(notification.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount,
    isLoading, 
    markAsRead, 
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, NotificationType[]>);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      // In a real app, call API to delete
      console.log('Delete notification:', notificationToDelete);
      setNotificationToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkAllLoading(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All notifications read'
            }
          </p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={markAllLoading}
          >
            {markAllLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs Filter */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              description={
                filter === 'unread'
                  ? "You're all caught up! All your notifications have been read."
                  : "You haven't received any notifications yet."
              }
            />
          ) : (
            <Card>
              <ScrollArea className="h-[calc(100vh-300px)]">
                {Object.entries(groupedNotifications).map(([date, notifs]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground capitalize border-b">
                      {date}
                    </div>
                    {notifs.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The notification will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}