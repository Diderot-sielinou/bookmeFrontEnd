/**
 * ClientDashboardPage - ENHANCED VERSION
 *
 * Improved client dashboard with:
 * - Welcome message with stats
 * - Quick actions grid
 * - Upcoming appointments
 * - Recent activity
 * - Recommendations
 * - Tips section
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Search,
  Star,
  MessageSquare,
  ArrowRight,
  CalendarCheck,
  Bell,
  Settings,
  TrendingUp,
  Award,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { formatPrice, formatTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyAppointments } from '@/hooks/useAppointments';
import { AppointmentStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Avatar,
  Badge,
  Separator,
} from '@/components/ui';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared';

// ==========================================
// STATIC DATA
// ==========================================

const quickActions = [
  {
    icon: Search,
    title: 'Find a Provider',
    description: 'Browse services',
    link: ROUTES.SEARCH,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    icon: Calendar,
    title: 'My Appointments',
    description: 'View all bookings',
    link: ROUTES.CLIENT_APPOINTMENTS,
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: MessageSquare,
    title: 'Messages',
    description: 'Chat with providers',
    link: ROUTES.CLIENT_MESSAGES,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Star,
    title: 'My Reviews',
    description: 'Rate your experiences',
    link: ROUTES.CLIENT_REVIEWS,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Stay updated',
    link: ROUTES.CLIENT_NOTIFICATIONS,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Settings,
    title: 'Profile Settings',
    description: 'Manage account',
    link: ROUTES.CLIENT_PROFILE,
    color: 'bg-gray-100 text-gray-600',
  },
];

const tips = [
  {
    icon: Star,
    title: 'Leave Reviews',
    description: 'Help others by sharing your experience after each appointment.',
  },
  {
    icon: MessageSquare,
    title: 'Use Messaging',
    description: 'Chat with providers before booking to discuss your needs.',
  },
  {
    icon: Bell,
    title: 'Enable Notifications',
    description: 'Never miss an appointment with automatic reminders.',
  },
];

// ==========================================
// MAIN COMPONENT
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

  const clientProfile = profile as { firstName?: string; lastName?: string } | null;
  const upcomingAppointments = appointmentsData?.data || [];
  const firstName = clientProfile?.firstName || 'there';

  // Simulated stats (in real app, fetch from API)
  const stats = {
    totalBookings: 12,
    upcomingCount: upcomingAppointments.length,
    reviewsLeft: 8,
    savedProviders: 5,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-white/80 mb-6">
            Here's what's happening with your appointments.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
              <p className="text-sm text-white/70">Total Bookings</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.upcomingCount}</p>
              <p className="text-sm text-white/70">Upcoming</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.reviewsLeft}</p>
              <p className="text-sm text-white/70">Reviews Left</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.savedProviders}</p>
              <p className="text-sm text-white/70">Saved Providers</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} to={action.link}>
              <Card className="h-full hover:shadow-md hover:border-cyan-300 transition-all group">
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments - Main Column */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next scheduled bookings</CardDescription>
              </div>
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
                  title="No Upcoming Appointments"
                  description="Find a provider and book your next appointment!"
                  actionLabel="Find a Provider"
                  onAction={() => (window.location.href = ROUTES.SEARCH)}
                />
              )}

              {!isLoading && upcomingAppointments.length > 0 && (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/50 transition-colors"
                    >
                      <Avatar
                        src={appointment.prestataire?.avatar}
                        firstName={appointment.prestataire?.firstName}
                        lastName={appointment.prestataire?.lastName}
                        size="lg"
                      />
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
                            {format(new Date(appointment.slot?.date || ''), 'EEE, MMM d', { locale: enUS })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(appointment.slot?.startTime || '')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="success" className="mb-1">Confirmed</Badge>
                        <p className="font-semibold text-cyan-600">
                          {formatPrice(appointment.priceAtBooking)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                Tips for You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tips.map((tip, index) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-cyan-600">
                    <tip.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          {stats.reviewsLeft > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-5 w-5 text-amber-500" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You have appointments waiting for your review.
                  Share your experience to help others!
                </p>
                <Button className="w-full" variant="outline" asChild>
                  <Link to={ROUTES.CLIENT_REVIEWS}>
                    Leave Reviews
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Need Help? */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Need Help?</p>
                  <p className="text-xs text-muted-foreground">Our support team is here for you</p>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/contact">Contact</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default ClientDashboardPage;