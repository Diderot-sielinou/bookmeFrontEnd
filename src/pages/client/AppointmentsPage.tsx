/**
 * My Appointments Page (Client)
 * 
 * List of client appointments with status filtering
 * and actions (cancel, leave review).
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice, formatTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentStatus } from '@/types';
import type { Appointment } from '@/types';
import {
  Card,
  CardContent,
  Button,
  Avatar,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
} from '@/components/ui';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared';

// ==========================================
// STATUS CONFIG
// ==========================================

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  [AppointmentStatus.CONFIRMED]: { label: 'Confirmed', variant: 'success' },
  [AppointmentStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' },
  [AppointmentStatus.COMPLETED]: { label: 'Completed', variant: 'secondary' },
};

// ==========================================
// APPOINTMENT CARD
// ==========================================

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
  onReview: (appointment: Appointment) => void;
  onMessage: (appointment: Appointment) => void;
}

function AppointmentCard({ appointment, onCancel, onReview, onMessage }: AppointmentCardProps) {
  const { status, prestataire, service, slot, priceAtBooking, review } = appointment;
  const config = statusConfig[status];
  
  const isPast = slot ? new Date(slot.date) < new Date() : false;
  const canCancel = status === AppointmentStatus.CONFIRMED && !isPast;
  const canReview = status === AppointmentStatus.COMPLETED && !review;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Main info */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={prestataire?.avatar}
                firstName={prestataire?.firstName}
                lastName={prestataire?.lastName}
                size="lg"
                className="hidden sm:flex"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {prestataire?.businessName || `${prestataire?.firstName} ${prestataire?.lastName}`}
                    </h3>
                    <p className="text-muted-foreground">{service?.name}</p>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {slot ? format(new Date(slot.date), 'EEEE, MMMM d, yyyy', { locale: enUS }) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {slot ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}` : '-'}
                    </span>
                  </div>
                  {prestataire?.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{prestataire.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="font-semibold text-lg text-cyan-600">
                    {formatPrice(priceAtBooking)}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMessage(appointment)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    {canReview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReview(appointment)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    {canCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancel(appointment)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    
                    {review && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {review.rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// CANCEL DIALOG
// ==========================================

interface CancelDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

function CancelDialog({ appointment, open, onOpenChange, onConfirm, isLoading }: CancelDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment with{' '}
            {appointment?.prestataire?.businessName || 
              `${appointment?.prestataire?.firstName} ${appointment?.prestataire?.lastName}`}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button variant="destructive" onClick={handleConfirm} isLoading={isLoading}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function ClientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointment: Appointment | null }>({
    open: false,
    appointment: null,
  });

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, []);

  // Queries by status
  const upcomingQuery = useAppointments({
    status: [AppointmentStatus.CONFIRMED],
    startDate: today,
  });

  const pastQuery = useAppointments({
    status: AppointmentStatus.COMPLETED,
  });

  const cancelledQuery = useAppointments({
    status: [AppointmentStatus.CANCELLED],
  });

  const { cancelAppointment, isCancelling } = upcomingQuery;

  // Handlers
  const handleCancel = (appointment: Appointment) => {
    setCancelDialog({ open: true, appointment });
  };

  const handleConfirmCancel = async (reason: string) => {
    if (cancelDialog.appointment) {
      await cancelAppointment({ id: cancelDialog.appointment.id, reason });
      setCancelDialog({ open: false, appointment: null });
    }
  };

  const handleReview = (appointment: Appointment) => {
    window.location.href = `${ROUTES.CLIENT_REVIEWS}?appointmentId=${appointment.id}`;
  };

  const handleMessage = (appointment: Appointment) => {
    window.location.href = `${ROUTES.CLIENT_MESSAGES}?appointmentId=${appointment.id}`;
  };

  // Render appointments list
  const renderAppointments = (
    data: Appointment[] | undefined,
    isLoading: boolean,
    error: Error | null,
    refetch: () => void,
    emptyMessage: string
  ) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }

    if (error) {
      return <ErrorState message="Unable to load appointments" onRetry={refetch} />;
    }

    if (!data || data.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="No appointments"
          description={emptyMessage}
          actionLabel="Search for a provider"
          onAction={() => window.location.href = ROUTES.SEARCH}
        />
      );
    }

    return (
      <div className="space-y-4">
        {data.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={handleCancel}
            onReview={handleReview}
            onMessage={handleMessage}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your past and upcoming appointments
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.SEARCH}>New Appointment</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingQuery.data?.data?.length ? (
              <Badge variant="secondary" className="ml-1">
                {upcomingQuery.data.data.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderAppointments(
            upcomingQuery.data?.data,
            upcomingQuery.isLoading,
            upcomingQuery.error as Error | null,
            upcomingQuery.refetch,
            "You don't have any upcoming appointments. Find a provider and book now!"
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {renderAppointments(
            pastQuery.data?.data,
            pastQuery.isLoading,
            pastQuery.error as Error | null,
            pastQuery.refetch,
            "You don't have any completed appointments yet."
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {renderAppointments(
            cancelledQuery.data?.data,
            cancelledQuery.isLoading,
            cancelledQuery.error as Error | null,
            cancelledQuery.refetch,
            "You don't have any cancelled appointments."
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <CancelDialog
        appointment={cancelDialog.appointment}
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}

export default ClientAppointmentsPage;