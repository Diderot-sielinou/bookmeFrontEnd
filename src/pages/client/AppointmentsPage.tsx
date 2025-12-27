/**
 * Page Mes Rendez-vous (Client)
 * 
 * Liste des rendez-vous du client avec filtrage par statut
 * et actions (annuler, laisser un avis).
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  // [AppointmentStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [AppointmentStatus.CONFIRMED]: { label: 'Confirmé', variant: 'success' },
  [AppointmentStatus.CANCELLED]: { label: 'Annulé', variant: 'destructive' },
  [AppointmentStatus.COMPLETED]: { label: 'Terminé', variant: 'secondary' },
  // [AppointmentStatus.NO_SHOW]: { label: 'Absent', variant: 'destructive' },
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
          {/* Info principale */}
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
                      {slot ? format(new Date(slot.date), 'EEEE d MMMM yyyy', { locale: fr }) : '-'}
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
                        Avis
                      </Button>
                    )}
                    
                    {canCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancel(appointment)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Annuler
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
          <DialogTitle>Annuler le rendez-vous</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler ce rendez-vous avec{' '}
            {appointment?.prestataire?.businessName || 
              `${appointment?.prestataire?.firstName} ${appointment?.prestataire?.lastName}`} ?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison de l'annulation (optionnel)</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous annulez..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Retour
          </Button>
          <Button variant="destructive" onClick={handleConfirm} isLoading={isLoading}>
            Confirmer l'annulation
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

  // Queries par statut
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
    // Navigate to review page or open review dialog
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
      return <ErrorState message="Impossible de charger les rendez-vous" onRetry={refetch} />;
    }

    if (!data || data.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous"
          description={emptyMessage}
          actionLabel="Rechercher un prestataire"
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
          <h1 className="text-3xl font-bold">Mes rendez-vous</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos rendez-vous passés et à venir
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.SEARCH}>Nouveau rendez-vous</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            À venir
            {upcomingQuery.data?.data?.length ? (
              <Badge variant="secondary" className="ml-1">
                {upcomingQuery.data.data.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderAppointments(
            upcomingQuery.data?.data,
            upcomingQuery.isLoading,
            upcomingQuery.error as Error | null,
            upcomingQuery.refetch,
            "Vous n'avez aucun rendez-vous prévu. Trouvez un prestataire et réservez !"
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {renderAppointments(
            pastQuery.data?.data,
            pastQuery.isLoading,
            pastQuery.error as Error | null,
            pastQuery.refetch,
            "Vous n'avez pas encore de rendez-vous terminés."
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {renderAppointments(
            cancelledQuery.data?.data,
            cancelledQuery.isLoading,
            cancelledQuery.error as Error | null,
            cancelledQuery.refetch,
            "Vous n'avez aucun rendez-vous annulé."
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
