/**
 * PrestataireDashboardPage - ENHANCED VERSION
 *
 * Provider dashboard with:
 * - Animated stats cards with trends
 * - Today's schedule timeline
 * - Quick actions grid
 * - Performance insights
 * - Recent activity feed
 * - Account status alerts
 */

import { Link } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Zap,
  Eye,
  Settings,
  Plus,
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { queryKeys } from '@/lib/queryClient';
import { formatPrice, formatTime, getStatusColor, translateStatus } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTodayAppointments } from '@/hooks/useAppointments';
import * as dashboardService from '@/services/dashboard.service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Avatar,
  Badge,
  Progress,
} from '@/components/ui';
import { SkeletonCard } from '@/components/ui/skeleton';

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ==========================================
// STAT CARD COMPONENT
// ==========================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: 'cyan' | 'green' | 'amber' | 'purple' | 'teal';
  delay?: number;
}

function StatCard({ label, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const colorClasses = {
    cyan: 'bg-cyan-100 text-cyan-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-sm',
                  trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.value >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>{Math.abs(trend.value)}% {trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        {/* Decorative gradient */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 h-1',
          color === 'cyan' && 'bg-gradient-to-r from-cyan-400 to-cyan-600',
          color === 'green' && 'bg-gradient-to-r from-green-400 to-green-600',
          color === 'amber' && 'bg-gradient-to-r from-amber-400 to-amber-600',
          color === 'purple' && 'bg-gradient-to-r from-purple-400 to-purple-600',
          color === 'teal' && 'bg-gradient-to-r from-teal-400 to-teal-600',
        )} />
      </Card>
    </motion.div>
  );
}

// ==========================================
// TODAY'S SCHEDULE COMPONENT
// ==========================================

interface TodayScheduleProps {
  appointments: any[];
  isLoading: boolean;
}

function TodaySchedule({ appointments, isLoading }: TodayScheduleProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cyan-500" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cyan-500" />
            Today's Schedule
          </CardTitle>
          <CardDescription>
            {format(new Date(), 'EEEE, MMMM d', { locale: enUS })}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.PRESTATAIRE_APPOINTMENTS}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-4">No appointments today</p>
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.PRESTATAIRE_SLOTS}>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl border hover:bg-gray-50 transition-colors"
              >
                {/* Time */}
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-bold text-cyan-600">
                    {formatTime(appointment.slot?.startTime || '')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(appointment.slot?.endTime || '')}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-12 bg-gray-200" />

                {/* Client Info */}
                <Avatar
                  src={appointment.client?.avatar}
                  firstName={appointment.client?.firstName}
                  lastName={appointment.client?.lastName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {appointment.client?.firstName} {appointment.client?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {appointment.service?.name}
                  </p>
                </div>

                {/* Status */}
                <Badge variant={getStatusColor(appointment.status) as any}>
                  {translateStatus(appointment.status)}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// QUICK ACTIONS COMPONENT
// ==========================================

function QuickActions() {
  const actions = [
    {
      label: 'Add Time Slots',
      description: 'Manage your availability',
      icon: Clock,
      href: ROUTES.PRESTATAIRE_SLOTS,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Manage Services',
      description: 'Add or edit services',
      icon: Briefcase,
      href: ROUTES.PRESTATAIRE_SERVICES,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      label: 'View Reviews',
      description: 'See client feedback',
      icon: Star,
      href: ROUTES.PRESTATAIRE_REVIEWS,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Messages',
      description: 'Chat with clients',
      icon: MessageSquare,
      href: ROUTES.PRESTATAIRE_MESSAGES,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.href}
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 hover:border-cyan-300 transition-all group"
            >
              <div className={cn('p-2 rounded-lg', action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-cyan-600 transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// ==========================================
// PERFORMANCE CARD COMPONENT
// ==========================================

interface PerformanceCardProps {
  stats: any;
}

function PerformanceCard({ stats }: PerformanceCardProps) {
  const metrics = [
    {
      label: 'Response Rate',
      value: 95,
      target: 90,
      color: 'bg-green-500',
    },
    {
      label: 'Completion Rate',
      value: 88,
      target: 85,
      color: 'bg-cyan-500',
    },
    {
      label: 'Client Satisfaction',
      value: Math.round((stats?.averageRating || 4.5) * 20),
      target: 80,
      color: 'bg-amber-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Performance
        </CardTitle>
        <CardDescription>Your key metrics this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-sm font-medium">{metric.value}%</span>
            </div>
            <div className="relative">
              <Progress value={metric.value} className="h-2" />
              {/* Target indicator */}
              <div
                className="absolute top-0 w-0.5 h-2 bg-gray-800"
                style={{ left: `${metric.target}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {metric.target}%
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ==========================================
// TIPS CARD COMPONENT
// ==========================================

function TipsCard() {
  const tips = [
    {
      icon: '📸',
      title: 'Add Photos',
      description: 'Profiles with photos get 3x more bookings',
    },
    {
      icon: '⚡',
      title: 'Quick Responses',
      description: 'Reply within 1 hour to boost your ranking',
    },
    {
      icon: '⭐',
      title: 'Ask for Reviews',
      description: 'Happy clients love to leave feedback',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
      <CardHeader>
        <CardTitle className="text-lg">Tips to Grow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip) => (
          <div key={tip.title} className="flex items-start gap-3">
            <span className="text-xl">{tip.icon}</span>
            <div>
              <p className="font-medium text-sm">{tip.title}</p>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PrestataireDashboardPage() {
  const { profile } = useAuth();
  const { data: todayAppointments, isLoading: isLoadingAppointments } = useTodayAppointments();

  // Fetch stats from backend
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

  const isLoading = isLoadingAppointments || isLoadingStats;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-white"
      >
        <div className="relative z-10">
          <p className="text-cyan-100 mb-1">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {prestataireProfile?.firstName} 👋
          </h1>
          <p className="text-cyan-100">
            {displayName} • {format(new Date(), 'EEEE, MMMM d, yyyy', { locale: enUS })}
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            asChild
          >
            <Link to={ROUTES.PRESTATAIRE_SLOTS}>
              <Clock className="h-4 w-4 mr-2" />
              Manage Slots
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            asChild
          >
            <Link to={ROUTES.PRESTATAIRE_PROFILE}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
      </motion.div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            icon={Calendar}
            color="cyan"
            trend={{ value: 12, label: 'vs last week' }}
            delay={0}
          />
          <StatCard
            label="Total Revenue"
            value={formatPrice(stats?.totalRevenue || 0)}
            icon={DollarSign}
            color="green"
            trend={{ value: 8, label: 'vs last month' }}
            delay={0.1}
          />
          <StatCard
            label="Completed"
            value={stats?.completedAppointments || 0}
            icon={CheckCircle}
            color="teal"
            delay={0.2}
          />
          <StatCard
            label="Average Rating"
            value={Number(stats?.averageRating ?? 0).toFixed(1)}
            icon={Star}
            color="amber"
            delay={0.3}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TodaySchedule
            appointments={todayAppointments || []}
            isLoading={isLoadingAppointments}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <TipsCard />
        </div>
      </div>

      {/* Performance Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceCard stats={stats} />

        {/* Notifications/Alerts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Complete Your Profile</p>
                  <p className="text-xs text-amber-700">
                    Add a bio to increase your visibility by 40%
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50 border border-cyan-200">
                <MessageSquare className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cyan-800 text-sm">New Message</p>
                  <p className="text-xs text-cyan-700">
                    You have 2 unread messages from clients
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Star className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 text-sm">New Review</p>
                  <p className="text-xs text-green-700">
                    Sarah left you a 5-star review!
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to={ROUTES.PRESTATAIRE_NOTIFICATION}>
                View All Notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {prestataireProfile?.status === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-2 rounded-full bg-amber-100">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Account Pending Validation</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your profile is being reviewed by our team. You will receive an email
                  once your account is activated. This usually takes 24-48 hours.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default PrestataireDashboardPage;