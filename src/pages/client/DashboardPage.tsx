/**
 * Client Dashboard Page
 *
 * Overview for clients with:
 * - Upcoming appointments
 * - Quick actions
 * - Personal statistics
 */

import { Link } from "react-router-dom";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Search,
  Star,
  MessageSquare,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { formatPrice, formatTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMyAppointments } from "@/hooks/useAppointments";
import { AppointmentStatus } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  Badge,
  Separator,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { useMemo } from "react";

// ==========================================
// COMPONENT
// ==========================================

export function ClientDashboardPage() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, []);
  
  const { profile } = useAuth();
  const { data: appointmentsData, isLoading } = useMyAppointments({
    status: AppointmentStatus.CONFIRMED,
    startDate: today,
    limit: 5,
  });

  const clientProfile = profile as {
    firstName?: string;
    lastName?: string;
  } | null;
  const upcomingAppointments = appointmentsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Hello {clientProfile?.firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your dashboard
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={ROUTES.SEARCH}>
          <Card className="card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Search</p>
                <p className="text-xs text-muted-foreground">
                  Find a provider
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={ROUTES.CLIENT_APPOINTMENTS}>
          <Card className="card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Appointments</p>
                <p className="text-xs text-muted-foreground">
                  View all my appointments
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={ROUTES.CLIENT_MESSAGES}>
          <Card className="card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-xs text-muted-foreground">
                  My conversations
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={ROUTES.CLIENT_REVIEWS}>
          <Card className="card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">My Reviews</p>
                <p className="text-xs text-muted-foreground">
                  View and leave reviews
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.CLIENT_APPOINTMENTS}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!isLoading && upcomingAppointments.length === 0 && (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming appointments"
              description="Find a provider and book your first appointment!"
              actionLabel="Search for a provider"
              onAction={() => (window.location.href = ROUTES.SEARCH)}
            />
          )}

          {!isLoading && upcomingAppointments.length > 0 && (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {/* Provider avatar */}
                  <Avatar
                    src={appointment.prestataire?.avatar}
                    firstName={appointment.prestataire?.firstName}
                    lastName={appointment.prestataire?.lastName}
                    size="lg"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {appointment.prestataire?.businessName ||
                        `${appointment.prestataire?.firstName} ${appointment.prestataire?.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {appointment.service?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(
                          new Date(appointment.slot?.date || ""),
                          "EEEE, MMMM d",
                          { locale: enUS }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(appointment.slot?.startTime || "")}
                      </span>
                    </div>
                  </div>

                  {/* Price and status */}
                  <div className="text-right">
                    <Badge variant="success">Confirmed</Badge>
                    <p className="mt-1 font-semibold text-cyan-600">
                      {formatPrice(appointment.priceAtBooking)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">💡 Tip of the Day</h3>
          <p className="text-muted-foreground">
            Don't forget to leave a review after each appointment to help
            the community and providers improve!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientDashboardPage;