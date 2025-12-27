/**
 * DashboardPage (Admin)
 *
 * Page principale du tableau de bord administrateur.
 * Affiche les statistiques globales et les actions rapides.
 *
 * ALIGNÉ AVEC BACKEND: /admin/stats
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  ArrowRight,
  BarChart3,
  PieChart,
  Shield,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import {
  adminService,
  type AdminStats,
  type PendingPrestataire,
  type FlaggedReview,
} from "@/services";
import { showError } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";

// ==========================================
// STAT CARD COMPONENT
// ==========================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon,
  description,
  isLoading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-2" />
            ) : (
              <>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {change !== undefined && (
                  <div
                    className={`flex items-center gap-1 mt-1 text-sm ${
                      change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(change)}%</span>
                    <span className="text-muted-foreground">
                      vs mois dernier
                    </span>
                  </div>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// ACTIVITY ITEM COMPONENT
// ==========================================

interface ActivityItem {
  id: string;
  type:
    | "new_user"
    | "validation"
    | "review"
    | "appointment"
    | "new_prestataire";
  message: string;
  time: string;
}

interface ActivityItemProps {
  activity: ActivityItem;
}

function ActivityItemComponent({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "new_user":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "validation":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "review":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "new_prestataire":
        return <UserCheck className="h-4 w-4 text-teal-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="p-2 bg-muted rounded-full">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Il y a {activity.time}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DashboardPage() {
  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingPrestataires, setPendingPrestataires] = useState<
    PendingPrestataire[]
  >([]);
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([]);

  // Mock activity data (would need a separate endpoint)
  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "new_user",
      message: "Nouvel utilisateur inscrit",
      time: "5 min",
    },
    {
      id: "2",
      type: "validation",
      message: "Prestataire validé",
      time: "15 min",
    },
    { id: "3", type: "review", message: "Avis signalé", time: "30 min" },
    {
      id: "4",
      type: "appointment",
      message: "Nouveaux rendez-vous aujourd'hui",
      time: "1h",
    },
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, pendingData, reviewsData] = await Promise.all([
          adminService.getStats(),
          adminService.getPendingPrestataires(1, 3),
          adminService.getFlaggedReviews(1, 2),
        ]);

        setStats(statsData);
        setPendingPrestataires(pendingData?.data || []);
        setFlaggedReviews(reviewsData?.data || []);
      } catch (error) {
        showError("Impossible de charger les statistiques");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la plateforme BookMe
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs totaux"
          value={stats?.totalUsers.toLocaleString() || "—"}
          icon={<Users className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Prestataires"
          value={stats?.totalPrestataires.toLocaleString() || "—"}
          icon={<UserCheck className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Rendez-vous"
          value={stats?.totalAppointments.toLocaleString() || "—"}
          icon={<Calendar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenus plateforme"
          value={stats ? formatPrice(stats.totalRevenue) : "—"}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats?.totalClients.toLocaleString()
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              {stats && stats.totalUsers > 0
                ? `${((stats.totalClients / stats.totalUsers) * 100).toFixed(
                    1
                  )}% des utilisateurs`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">RDV ce mois</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats?.appointmentsThisMonth.toLocaleString()
                  )}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Revenus: {stats ? formatPrice(stats.revenueThisMonth) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats?.pendingPrestataires
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Prestataires à valider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Requises */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Actions requises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pending Validations */}
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">
                          Validations en attente
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {stats?.pendingPrestataires || 0}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      {(pendingPrestataires || []).slice(0, 2).map((p) => (
                        <div key={p.id} className="flex justify-between">
                          <span className="truncate">{p.businessName}</span>
                        </div>
                      ))}
                      {pendingPrestataires.length === 0 && !isLoading && (
                        <p className="text-muted-foreground">Aucune demande</p>
                      )}
                    </div>
                    <Button
                      asChild
                      variant="link"
                      className="p-0 mt-2 text-orange-600"
                    >
                      <Link to={ROUTES.ADMIN_PRESTATAIRES_VALIDATION}>
                        Voir tout <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Flagged Reviews */}
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span className="font-medium">Avis signalés</span>
                      </div>
                      <Badge variant="destructive">
                        {flaggedReviews.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      {(flaggedReviews || []).map((r) => (
                        <div key={r.id} className="flex justify-between">
                          <span className="truncate">
                            {r.prestataire?.businessName}
                          </span>
                          <span className="text-muted-foreground truncate ml-2">
                            {r.flagReason}
                          </span>
                        </div>
                      ))}
                      {flaggedReviews.length === 0 && !isLoading && (
                        <p className="text-muted-foreground">
                          Aucun avis signalé
                        </p>
                      )}
                    </div>
                    <Button
                      asChild
                      variant="link"
                      className="p-0 mt-2 text-red-600"
                    >
                      <Link to={ROUTES.ADMIN_REVIEWS_MODERATION}>
                        Voir tout <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Link to={ROUTES.ADMIN_USERS}>
                    <Users className="h-5 w-5" />
                    <span>Utilisateurs</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Link to={ROUTES.ADMIN_PRESTATAIRES_VALIDATION}>
                    <UserCheck className="h-5 w-5" />
                    <span>Validations</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Link to={ROUTES.ADMIN_REVIEWS_MODERATION}>
                    <Star className="h-5 w-5" />
                    <span>Modération</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Link to={ROUTES.ADMIN_CATEGORIES}>
                    <PieChart className="h-5 w-5" />
                    <span>Catégories</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))}
            </div>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link to={ROUTES.ADMIN_LOGS}>
                Voir tous les logs <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
