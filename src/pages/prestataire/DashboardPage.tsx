/**
 * Page Dashboard Prestataire - ALIGNÉE AVEC BACKEND
 */

import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
// COMPOSANT
// ==========================================

export function PrestataireDashboardPage() {
  const { profile } = useAuth();
  const { data: todayAppointments, isLoading: isLoadingAppointments } = useTodayAppointments();
  
  // ✅ NOUVEAU : Récupère les stats du backend
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

  // ✅ Utilise les vraies stats du backend
  const isLoading = isLoadingAppointments || isLoadingStats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour {prestataireProfile?.firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {displayName} •{" "}
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={ROUTES.PRESTATAIRE_SLOTS}>
              <Clock className="mr-2 h-4 w-4" />
              Gérer mes créneaux
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.PRESTATAIRE_PROFILE}>Voir mon profil</Link>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="RDV à venir"
            value={stats?.upcomingAppointments || 0}
            icon={Calendar}
            iconColor="cyan"
          />
          <StatCard
            label="Revenus totaux"
            value={formatPrice(stats?.totalRevenue || 0)}
            icon={Euro}
            iconColor="green"
          />
          <StatCard
            label="RDV terminés"
            value={stats?.completedAppointments || 0}
            icon={Users}
            iconColor="teal"
          />
          <StatCard
            label="Note moyenne"
            value={Number(stats?.averageRating ?? 0).toFixed(1)}
            icon={Star}
            iconColor="amber"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rendez-vous du jour */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Rendez-vous du jour</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.PRESTATAIRE_APPOINTMENTS}>
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
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
                  title="Aucun rendez-vous aujourd'hui"
                  description="Profitez de ce temps libre pour mettre à jour votre profil !"
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

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Actions rapides</CardTitle>
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
                <p className="font-medium">Ajouter des créneaux</p>
                <p className="text-sm text-muted-foreground">
                  Gérez vos disponibilités
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
                <p className="font-medium">Gérer mes services</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez ou modifiez vos prestations
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
                <p className="font-medium">Voir mes avis</p>
                <p className="text-sm text-muted-foreground">
                  Consultez et répondez aux avis
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
                  Communiquez avec vos clients
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerte statut */}
      {prestataireProfile?.status === "PENDING" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Compte en attente de validation
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Votre profil est en cours de vérification par notre équipe.
                Vous recevrez un email dès que votre compte sera activé.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PrestataireDashboardPage;