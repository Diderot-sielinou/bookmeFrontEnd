/**
 * Provider Dashboard Page - ALIGNED WITH BACKEND
 */

import { Link } from "react-router-dom";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Euro,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/queryClient";
import {
  formatPrice,
  formatTime,
  getStatusColor,
  translateStatus,
} from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTodayAppointments } from "@/hooks/useAppointments";
import * as dashboardService from '@/services/dashboard.service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  Badge,
} from "@/components/ui";
import { SkeletonStats, SkeletonRow } from "@/components/ui/skeleton";
import { StatCard } from "@/components/features/dashboard";
import { EmptyState } from "@/components/shared";

// ==========================================
// COMPONENT
// ==========================================

export function PrestataireDashboardPage() {
  const { profile } = useAuth();
  const { data: todayAppointments, isLoading: isLoadingAppointments } = useTodayAppointments();
  
  // ✅ FETCH: Get stats from backend
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: dashboardService.getStats,
  });

  const prestataireProfile = profile as {
    businessName?: string;
    firstName?: string;
    lastName?: string;
    averageRating?: number;
    totalReviews?: number;
    status?: string;
  } | null;

  const displayName =
    prestataireProfile?.businessName ||
    `${prestataireProfile?.firstName} ${prestataireProfile?.lastName}`;

  // ✅ Use real stats from backend
  const isLoading = isLoadingAppointments || isLoadingStats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Hello {prestataireProfile?.firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {displayName} •{" "}
            {format(new Date(), "EEEE, MMMM d, yyyy", { locale: enUS })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={ROUTES.PRESTATAIRE_SLOTS}>
              <Clock className="mr-2 h-4 w-4" />
              Manage Time Slots
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.PRESTATAIRE_PROFILE}>View My Profile</Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            icon={Calendar}
            iconColor="cyan"
          />
          <StatCard
            label="Total Revenue"
            value={formatPrice(stats?.totalRevenue || 0)}
            icon={Euro}
            iconColor="green"
          />
          <StatCard
            label="Completed Appointments"
            value={stats?.completedAppointments || 0}
            icon={Users}
            iconColor="teal"
          />
          <StatCard
            label="Average Rating"
            value={Number(stats?.averageRating ?? 0).toFixed(1)}
            icon={Star}
            iconColor="amber"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Today's Appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.PRESTATAIRE_APPOINTMENTS}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments && (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}

            {!isLoadingAppointments &&
              (!todayAppointments || todayAppointments.length === 0) && (
                <EmptyState
                  icon={Calendar}
                  title="No appointments today"
                  description="Take this time to update your profile!"
                />
              )}

            {!isLoadingAppointments &&
              todayAppointments &&
              todayAppointments.length > 0 && (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      <Avatar
                        src={appointment.client?.avatar}
                        firstName={appointment.client?.firstName}
                        lastName={appointment.client?.lastName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {appointment.client?.firstName}{" "}
                          {appointment.client?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatTime(appointment.slot?.startTime || "")}
                        </p>
                        <Badge
                          variant={
                            getStatusColor(appointment.status) as "default"
                          }
                        >
                          {translateStatus(appointment.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to={ROUTES.PRESTATAIRE_SLOTS}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Add Time Slots</p>
                <p className="text-sm text-muted-foreground">
                  Manage your availability
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              to={ROUTES.PRESTATAIRE_SERVICES}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Manage Services</p>
                <p className="text-sm text-muted-foreground">
                  Add or edit your services
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              to={ROUTES.PRESTATAIRE_REVIEWS}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">View Reviews</p>
                <p className="text-sm text-muted-foreground">
                  View and respond to reviews
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              to={ROUTES.PRESTATAIRE_MESSAGES}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Messages</p>
                <p className="text-sm text-muted-foreground">
                  Communicate with your clients
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {prestataireProfile?.status === "PENDING" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Account Pending Validation
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Your profile is being verified by our team.
                You will receive an email once your account is activated.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PrestataireDashboardPage;