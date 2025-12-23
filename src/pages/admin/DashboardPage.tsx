/**
 * DashboardPage (Admin)
 * 
 * Page principale du tableau de bord administrateur.
 * Affiche les statistiques globales et les actions rapides.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  FileText,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/lib/constants';
import { formatPrice } from '@/utils/format';

// ==========================================
// MOCK DATA
// ==========================================

const mockStats = {
  totalUsers: 12450,
  userGrowth: 12.5,
  totalPrestataires: 3200,
  prestataireGrowth: 8.3,
  pendingValidations: 24,
  totalAppointments: 45670,
  appointmentGrowth: 15.2,
  totalRevenue: 234500,
  revenueGrowth: 18.7,
  averageRating: 4.6,
  flaggedReviews: 12,
  activeUsers: 8450,
  conversionRate: 68,
};

const mockRecentActivity = [
  { id: '1', type: 'new_user', message: 'Nouvel utilisateur inscrit: Sophie Martin', time: '5 min' },
  { id: '2', type: 'validation', message: 'Prestataire validé: Pierre Coiffure', time: '15 min' },
  { id: '3', type: 'review', message: 'Avis signalé sur "Marie Coiffure"', time: '30 min' },
  { id: '4', type: 'appointment', message: '150 nouveaux rendez-vous aujourd\'hui', time: '1h' },
  { id: '5', type: 'new_prestataire', message: 'Nouveau prestataire: Julie Beauté', time: '2h' },
];

const mockPendingValidations = [
  { id: '1', name: 'Jean-Pierre Massage', category: 'Bien-être', submittedAt: '2024-01-15' },
  { id: '2', name: 'Marie Esthétique', category: 'Beauté', submittedAt: '2024-01-14' },
  { id: '3', name: 'Studio Yoga Zen', category: 'Sport', submittedAt: '2024-01-14' },
];

const mockFlaggedReviews = [
  { id: '1', prestataire: 'Paul Coiffure', reason: 'Contenu inapproprié', reportedAt: '2024-01-15' },
  { id: '2', prestataire: 'Lisa Beauté', reason: 'Spam', reportedAt: '2024-01-14' },
];

// ==========================================
// STAT CARD COMPONENT
// ==========================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, change, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(change)}%</span>
                <span className="text-muted-foreground">vs mois dernier</span>
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// ACTIVITY ITEM COMPONENT
// ==========================================

interface ActivityItemProps {
  activity: typeof mockRecentActivity[0];
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'new_user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'new_prestataire':
        return <UserCheck className="h-4 w-4 text-teal-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="p-2 bg-muted rounded-full">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Il y a {activity.time}</p>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');

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
          value={mockStats.totalUsers.toLocaleString()}
          change={mockStats.userGrowth}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Prestataires"
          value={mockStats.totalPrestataires.toLocaleString()}
          change={mockStats.prestataireGrowth}
          icon={<UserCheck className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Rendez-vous"
          value={mockStats.totalAppointments.toLocaleString()}
          change={mockStats.appointmentGrowth}
          icon={<Calendar className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Revenus plateforme"
          value={formatPrice(mockStats.totalRevenue)}
          change={mockStats.revenueGrowth}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{mockStats.averageRating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
            <Progress value={(mockStats.averageRating / 5) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{mockStats.activeUsers.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              {((mockStats.activeUsers / mockStats.totalUsers) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold">{mockStats.conversionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={mockStats.conversionRate} className="h-2" />
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
                        <span className="font-medium">Validations en attente</span>
                      </div>
                      <Badge variant="secondary">{mockStats.pendingValidations}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      {mockPendingValidations.slice(0, 2).map((p) => (
                        <div key={p.id} className="flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-muted-foreground">{p.category}</span>
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="link" className="p-0 mt-2 text-orange-600">
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
                      <Badge variant="destructive">{mockStats.flaggedReviews}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      {mockFlaggedReviews.map((r) => (
                        <div key={r.id} className="flex justify-between">
                          <span>{r.prestataire}</span>
                          <span className="text-muted-foreground">{r.reason}</span>
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="link" className="p-0 mt-2 text-red-600">
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
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link to={ROUTES.ADMIN_USERS}>
                    <Users className="h-5 w-5" />
                    <span>Utilisateurs</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link to={ROUTES.ADMIN_PRESTATAIRES_VALIDATION}>
                    <UserCheck className="h-5 w-5" />
                    <span>Validations</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link to={ROUTES.ADMIN_REVIEWS_MODERATION}>
                    <Star className="h-5 w-5" />
                    <span>Modération</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
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
              {mockRecentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
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
