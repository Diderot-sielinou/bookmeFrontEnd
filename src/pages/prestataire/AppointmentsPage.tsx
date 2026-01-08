/**
 * PrestataireAppointmentsPage - ENHANCED VERSION
 *
 * Appointment management with:
 * - Visual calendar overview
 * - Enhanced filtering
 * - Beautiful appointment cards
 * - Quick actions
 * - Status management
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  parseISO,
  startOfWeek,
  addDays,
  isSameDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  MoreVertical,
  CalendarDays,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice, formatTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { AppointmentStatus } from '@/types';
import type { Appointment } from '@/types';
import {
  useMyAppointments,
  useCancelAppointment,
  useCompleteAppointment,
} from '@/hooks/useAppointments';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Calendar as CalendarComponent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Textarea,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ==========================================
// TYPES & HELPERS
// ==========================================

const getStatusConfig = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return {
        label: 'Confirmed',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case AppointmentStatus.COMPLETED:
      return {
        label: 'Completed',
        variant: 'secondary' as const,
        icon: CheckCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
    case AppointmentStatus.CANCELLED:
      return {
        label: 'Cancelled',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    default:
      return {
        label: 'Unknown',
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
  }
};

const getDateLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMMM d', { locale: enUS });
};

const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const date = parseISO(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// ==========================================
// MINI CALENDAR COMPONENT
// ==========================================

interface MiniCalendarProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

function MiniCalendar({ appointments, selectedDate, onDateSelect }: MiniCalendarProps) {
  // Get dates with appointments
  const appointmentDates = useMemo(() => {
    return appointments
      .filter((a) => a.slot?.date)
      .map((a) => parseISO(a.slot!.date));
  }, [appointments]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-cyan-500" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          locale={enUS}
          modifiers={{
            hasAppointment: appointmentDates,
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: 'bold',
              backgroundColor: 'rgb(6, 182, 212, 0.2)',
              borderRadius: '50%',
            },
          }}
          className="rounded-md border"
        />
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => onDateSelect(undefined)}
          >
            Clear Date Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// APPOINTMENT CARD COMPONENT
// ==========================================

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onContact: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
  isActioning: boolean;
}

function AppointmentCard({
  appointment,
  onCancel,
  onComplete,
  onContact,
  onViewDetails,
  isActioning,
}: AppointmentCardProps) {
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  const slotDate = appointment.slot
    ? combineDateAndTime(appointment.slot.date, appointment.slot.startTime)
    : new Date();

  const isUpcoming = isFuture(slotDate) || isToday(slotDate);
  const clientName = `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        !isUpcoming && appointment.status !== AppointmentStatus.CANCELLED && 'opacity-75'
      )}>
        {/* Color strip */}
        <div className={cn('h-1', statusConfig.bgColor)} />

        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar
              src={appointment.client?.avatar}
              firstName={appointment.client?.firstName}
              lastName={appointment.client?.lastName}
              size="lg"
              className="shrink-0"
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{clientName || 'Client'}</h3>
                  <p className="text-cyan-600 font-medium">
                    {appointment.service?.name || 'Service'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig.variant}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isActioning}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(appointment)}>
                        <User className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContact(appointment)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Client
                      </DropdownMenuItem>

                      {appointment.status === AppointmentStatus.CONFIRMED && isUpcoming && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onComplete(appointment.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onCancel(appointment.id)}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {appointment.slot ? getDateLabel(appointment.slot.date) : 'Unknown date'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {appointment.slot?.startTime || '--:--'} - {appointment.slot?.endTime || '--:--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-charcoal">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatPrice(appointment.priceAtBooking)}</span>
                </div>
              </div>

              {/* Client Note */}
              {appointment.clientNote && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border-l-4 border-cyan-500">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-charcoal">Note: </span>
                    {appointment.clientNote}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              {appointment.status === AppointmentStatus.CONFIRMED && isUpcoming && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onContact(appointment)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onComplete(appointment.id)}
                    disabled={isActioning}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==========================================
// APPOINTMENT DETAILS SHEET
// ==========================================

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AppointmentDetails({ appointment, open, onOpenChange }: AppointmentDetailsProps) {
  if (!appointment) return null;

  const client = appointment.client;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Appointment Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Client Info */}
          <div className="flex items-center gap-4">
            <Avatar
              src={client?.avatar}
              firstName={client?.firstName}
              lastName={client?.lastName}
              size="xl"
            />
            <div>
              <h3 className="font-semibold text-lg">
                {client?.firstName} {client?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">Client</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            {client?.user?.email && (
              <a
                href={`mailto:${client.user.email}`}
                className="flex items-center gap-3 text-sm hover:text-cyan-600"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                {client.user.email}
              </a>
            )}
            {client?.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-3 text-sm hover:text-cyan-600"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {client.phone}
              </a>
            )}
          </div>

          <hr />

          {/* Appointment Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{appointment.service?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">
                {appointment.slot && format(parseISO(appointment.slot.date), 'EEEE, MMMM d, yyyy', { locale: enUS })}
              </p>
              <p className="text-sm">
                {appointment.slot?.startTime} - {appointment.slot?.endTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium text-lg text-cyan-600">
                {formatPrice(appointment.priceAtBooking)}
              </p>
            </div>
            {appointment.clientNote && (
              <div>
                <p className="text-sm text-muted-foreground">Client Note</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                  {appointment.clientNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==========================================
// STATS SUMMARY COMPONENT
// ==========================================

interface StatsSummaryProps {
  appointments: Appointment[];
}

function StatsSummary({ appointments }: StatsSummaryProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const todayCount = appointments.filter(
      (a) => a.slot && isToday(parseISO(a.slot.date))
    ).length;
    const upcomingCount = appointments.filter(
      (a) =>
        a.slot &&
        (isFuture(parseISO(a.slot.date)) || isToday(parseISO(a.slot.date))) &&
        a.status === AppointmentStatus.CONFIRMED
    ).length;
    const completedCount = appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED
    ).length;

    return { todayCount, upcomingCount, completedCount };
  }, [appointments]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-cyan-600">{stats.todayCount}</p>
          <p className="text-sm text-muted-foreground">Today</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-teal-600">{stats.upcomingCount}</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.completedCount}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PrestataireAppointmentsPage() {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [detailsSheet, setDetailsSheet] = useState<{ open: boolean; appointment: Appointment | null }>({
    open: false,
    appointment: null,
  });

  // Data
  const { data: appointmentsData, isLoading, refetch } = useMyAppointments();
  const { mutateAsync: cancelAppointment, isPending: isCancelling } = useCancelAppointment();
  const { mutateAsync: completeAppointment, isPending: isCompleting } = useCompleteAppointment();

  const appointments = appointmentsData?.data || [];
  const isActioning = isCancelling || isCompleting;

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const clientName = `${apt.client?.firstName || ''} ${apt.client?.lastName || ''}`.toLowerCase();
      const serviceName = (apt.service?.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      if (query && !clientName.includes(query) && !serviceName.includes(query)) {
        return false;
      }

      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      if (selectedDate && apt.slot) {
        const aptDate = parseISO(apt.slot.date);
        if (!isSameDay(aptDate, selectedDate)) {
          return false;
        }
      }

      if (apt.slot) {
        const slotDate = combineDateAndTime(apt.slot.date, apt.slot.startTime);
        if (activeTab === 'upcoming') {
          return isFuture(slotDate) || isToday(slotDate);
        } else if (activeTab === 'past') {
          return isPast(slotDate) && !isToday(slotDate);
        }
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, selectedDate, activeTab]);

  // Handlers
  const handleCancel = (id: string) => {
    setSelectedAppointmentId(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointmentId) return;

    try {
      await cancelAppointment({
        id: selectedAppointmentId,
        reason: cancelReason || undefined,
      });
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedAppointmentId(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeAppointment(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleContact = (appointment: Appointment) => {
    navigate(`${ROUTES.PRESTATAIRE_MESSAGES}?appointmentId=${appointment.id}`);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setDetailsSheet({ open: true, appointment });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
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
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your client appointments
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <StatsSummary appointments={appointments} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Calendar */}
        <div className="lg:col-span-1">
          <MiniCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search client or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                    <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={Calendar}
                      title="No appointments"
                      description={
                        activeTab === 'upcoming'
                          ? 'You have no upcoming appointments.'
                          : "You don't have any past appointments yet."
                      }
                    />
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onCancel={handleCancel}
                        onComplete={handleComplete}
                        onContact={handleContact}
                        onViewDetails={handleViewDetails}
                        isActioning={isActioning}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Details Sheet */}
      <AppointmentDetails
        appointment={detailsSheet.appointment}
        open={detailsSheet.open}
        onOpenChange={(open) => setDetailsSheet({ ...detailsSheet, open })}
      />

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              The client will be notified of the cancellation by email.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancelReason">Cancellation reason (optional)</Label>
            <Textarea
              id="cancelReason"
              placeholder="Explain why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}