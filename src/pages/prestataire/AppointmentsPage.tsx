/**
 * AppointmentsPage (Provider)
 *
 * Appointment management page for providers.
 * Lists, filters, and allows actions on appointments.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  parseISO,
} from "date-fns";
import { enUS } from "date-fns/locale";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar } from "@/components/ui";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { AppointmentStatus } from "@/types";
import type { Appointment } from "@/types";

// Hooks
import {
  useMyAppointments,
  useCancelAppointment,
  useCompleteAppointment,
} from "@/hooks/useAppointments";

// ==========================================
// HELPERS
// ==========================================

const getStatusConfig = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return {
        label: "Confirmed",
        variant: "default" as const,
        icon: CheckCircle,
      };
    case AppointmentStatus.COMPLETED:
      return {
        label: "Completed",
        variant: "secondary" as const,
        icon: CheckCircle,
      };
    case AppointmentStatus.CANCELLED:
      return {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      return {
        label: "Unknown",
        variant: "secondary" as const,
        icon: AlertCircle,
      };
  }
};

const getDateLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMMM d", { locale: enUS });
};

/**
 * Combine date and time (HH:mm) into Date object
 */
const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const date = parseISO(dateStr);
  const [hours, minutes] = timeStr.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// ==========================================
// APPOINTMENT CARD COMPONENT
// ==========================================

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onContact: (appointment: Appointment) => void;
  isActioning: boolean;
}

function AppointmentCard({
  appointment,
  onCancel,
  onComplete,
  onContact,
  isActioning,
}: AppointmentCardProps) {
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  // Build slot date/time
  const slotDate = appointment.slot
    ? combineDateAndTime(appointment.slot.date, appointment.slot.startTime)
    : new Date();
  const slotEndDate = appointment.slot
    ? combineDateAndTime(appointment.slot.date, appointment.slot.endTime)
    : new Date();

  const isUpcoming = isFuture(slotDate) || isToday(slotDate);

  const clientName = `${appointment.client?.firstName || ""} ${
    appointment.client?.lastName || ""
  }`.trim();

  return (
    <Card
      className={`${
        !isUpcoming && appointment.status !== AppointmentStatus.CANCELLED
          ? "opacity-75"
          : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            src={appointment.client?.avatar}
            firstName={appointment.client?.firstName}
            lastName={appointment.client?.lastName}
            className="h-12 w-12"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{clientName || "Client"}</h3>
                <p className="text-sm text-primary font-medium">
                  {appointment.service?.name || "Service"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    statusConfig.variant as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                  }
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isActioning}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onContact(appointment)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </DropdownMenuItem>

                    {appointment.status === AppointmentStatus.CONFIRMED &&
                      isUpcoming && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onComplete(appointment.id)}
                          >
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

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {appointment.slot
                    ? getDateLabel(appointment.slot.date)
                    : "Unknown date"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {appointment.slot?.startTime || "--:--"} -{" "}
                  {appointment.slot?.endTime || "--:--"}
                </span>
              </div>
              <div className="font-medium text-foreground">
                {formatPrice(appointment.priceAtBooking)}
              </div>
            </div>

            {appointment.clientNote && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                📝 {appointment.clientNote}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PrestataireAppointmentsPage() {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const { data: appointmentsData, isLoading } = useMyAppointments();
  const { mutateAsync: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();
  const { mutateAsync: completeAppointment, isPending: isCompleting } =
    useCompleteAppointment();

  const appointments = appointmentsData?.data || [];
  const isActioning = isCancelling || isCompleting;

  // FILTERING
  const filteredAppointments = appointments.filter((apt) => {
    const clientName =
      `${apt.client?.firstName || ""} ${apt.client?.lastName || ""}`.toLowerCase();
    const serviceName = (apt.service?.name || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    if (query && !clientName.includes(query) && !serviceName.includes(query)) {
      return false;
    }

    if (statusFilter !== "all" && apt.status !== statusFilter) {
      return false;
    }

    if (selectedDate && apt.slot) {
      const aptDate = parseISO(apt.slot.date);
      if (
        format(aptDate, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
      ) {
        return false;
      }
    }

    if (apt.slot) {
      const slotDate = combineDateAndTime(apt.slot.date, apt.slot.startTime);
      if (activeTab === "upcoming") {
        return isFuture(slotDate) || isToday(slotDate);
      } else if (activeTab === "past") {
        return isPast(slotDate) && !isToday(slotDate);
      }
    }

    return true;
  });

  // HANDLERS
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
      setCancelReason("");
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

  const todayCount = appointments.filter(
    (a) => a.slot && isToday(parseISO(a.slot.date))
  ).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">
            {todayCount} appointment{todayCount !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
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
                <SelectItem value={AppointmentStatus.CONFIRMED}>
                  Confirmed
                </SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {selectedDate
                    ? format(selectedDate, "MMM d, yyyy", { locale: enUS })
                    : "Choose a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={enUS}
                />
                {selectedDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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
          {filteredAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments"
              description={
                activeTab === "upcoming"
                  ? "You have no upcoming appointments."
                  : "You don't have any past appointments yet."
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  onContact={handleContact}
                  isActioning={isActioning}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
            <Label htmlFor="cancelReason">
              Cancellation reason (optional)
            </Label>
            <Textarea
              id="cancelReason"
              placeholder="Explain why you're cancelling this appointment..."
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
                "Confirm Cancellation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}