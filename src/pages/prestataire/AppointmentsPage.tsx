/**
 * AppointmentsPage (Prestataire)
 *
 * Page de gestion des rendez-vous pour les prestataires.
 * Liste, filtre et permet d'agir sur les rendez-vous.
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
import { fr } from "date-fns/locale";
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
        label: "Confirmé",
        variant: "default" as const,
        icon: CheckCircle,
      };
    case AppointmentStatus.COMPLETED:
      return {
        label: "Terminé",
        variant: "secondary" as const,
        icon: CheckCircle,
      };
    case AppointmentStatus.CANCELLED:
      return {
        label: "Annulé",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      return {
        label: "Inconnu",
        variant: "secondary" as const,
        icon: AlertCircle,
      };
  }
};

const getDateLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return "Demain";
  return format(date, "EEEE d MMMM", { locale: fr });
};

/**
 * Combine date et time (HH:mm) en Date object
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

  // Construire la date/heure du slot
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
                      Contacter
                    </DropdownMenuItem>

                    {appointment.status === AppointmentStatus.CONFIRMED &&
                      isUpcoming && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onComplete(appointment.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marquer terminé
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onCancel(appointment.id)}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler
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
                    : "Date inconnue"}
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

  // ==========================================
  // HOOKS - Connexion au backend
  // ==========================================

  const { data: appointmentsData, isLoading } = useMyAppointments();
  const { mutateAsync: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();
  const { mutateAsync: completeAppointment, isPending: isCompleting } =
    useCompleteAppointment();

  const appointments = appointmentsData?.data || [];
  const isActioning = isCancelling || isCompleting;

  // ==========================================
  // FILTERING
  // ==========================================

  const filteredAppointments = appointments.filter((apt) => {
    // Recherche texte
    const clientName =
      `${apt.client?.firstName || ""} ${apt.client?.lastName || ""}`.toLowerCase();
    const serviceName = (apt.service?.name || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    if (query && !clientName.includes(query) && !serviceName.includes(query)) {
      return false;
    }

    // Filtre par statut
    if (statusFilter !== "all" && apt.status !== statusFilter) {
      return false;
    }

    // Filtre par date sélectionnée
    if (selectedDate && apt.slot) {
      const aptDate = parseISO(apt.slot.date);
      if (
        format(aptDate, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
      ) {
        return false;
      }
    }

    // Filtre par onglet (à venir / passés)
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

  // ==========================================
  // HANDLERS
  // ==========================================

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
      // L'erreur est gérée dans le hook
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeAppointment(id);
    } catch (error) {
      // L'erreur est gérée dans le hook
    }
  };

  const handleContact = (appointment: Appointment) => {
    // Naviguer vers la page de messages avec l'appointmentId
    navigate(`${ROUTES.PRESTATAIRE_MESSAGES}?appointmentId=${appointment.id}`);
  };

  // Stats
  const todayCount = appointments.filter(
    (a) => a.slot && isToday(parseISO(a.slot.date))
  ).length;

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes rendez-vous</h1>
          <p className="text-muted-foreground">
            {todayCount} rendez-vous aujourd'hui
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client ou service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={AppointmentStatus.CONFIRMED}>
                  Confirmé
                </SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>
                  Terminé
                </SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>
                  Annulé
                </SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {selectedDate
                    ? format(selectedDate, "d MMM yyyy", { locale: fr })
                    : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                />
                {selectedDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Effacer la date
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
            <Calendar className="h-4 w-4" />À venir
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Passés
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Aucun rendez-vous"
              description={
                activeTab === "upcoming"
                  ? "Vous n'avez pas de rendez-vous à venir."
                  : "Vous n'avez pas encore de rendez-vous passés."
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
            <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le client sera notifié de l'annulation par email.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancelReason">
              Raison de l'annulation (optionnel)
            </Label>
            <Textarea
              id="cancelReason"
              placeholder="Expliquez pourquoi vous annulez ce rendez-vous..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}