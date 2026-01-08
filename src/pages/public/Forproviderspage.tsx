/**
 * ForProvidersPage Component
 *
 * B2B landing page for service providers with:
 * - Value proposition for providers
 * - Feature highlights
 * - Success stories
 * - Pricing comparison
 * - Registration CTA
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  Star,
  Shield,
  Zap,
  Award,
  CheckCircle,
  ArrowRight,
  Clock,
  Bell,
  BarChart3,
  Palette,
  Globe,
  Smartphone,
  Play,
  Quote,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
} from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const benefits = [
  {
    icon: Users,
    title: 'Reach New Clients',
    description:
      'Get discovered by thousands of potential clients searching for services like yours. Our marketplace brings clients directly to you.',
    stat: '10,000+',
    statLabel: 'monthly searches',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description:
      'Manage your availability with an intuitive calendar. Set recurring slots, block time off, handle exceptions — all in one place.',
    stat: '85%',
    statLabel: 'time saved',
  },
  {
    icon: MessageSquare,
    title: 'Built-in Messaging',
    description:
      'Communicate with clients before and after bookings. Answer questions, send reminders, build lasting relationships.',
    stat: '2min',
    statLabel: 'avg response time',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description:
      'Track revenue, appointments, and client satisfaction with detailed analytics. Make data-driven decisions to scale.',
    stat: '35%',
    statLabel: 'avg revenue increase',
  },
];

const features = [
  {
    icon: Palette,
    title: 'Professional Profile',
    description: 'Create a stunning profile with your bio, services, portfolio, and credentials.',
  },
  {
    icon: Clock,
    title: 'Flexible Availability',
    description: 'Set your own hours, recurring schedules, and handle exceptions easily.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get instant alerts for new bookings, messages, and reminders.',
  },
  {
    icon: Star,
    title: 'Review Management',
    description: 'Build trust with verified reviews and respond to client feedback.',
  },
  {
    icon: Award,
    title: 'Badge System',
    description: 'Earn recognition badges to stand out: Top Provider, Quick Response, Reliable.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track bookings, revenue, ratings, and growth trends over time.',
  },
  {
    icon: Globe,
    title: 'Online Presence',
    description: 'Your profile is SEO-optimized to help clients find you on search engines.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Manage everything from your phone with our responsive interface.',
  },
];

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Esthetician',
    location: 'Paris',
    avatar: null,
    content:
      'BookMe completely transformed my business. I gained 15 new regular clients in just 2 months, and the scheduling saves me hours every week. The fact that it\'s free is incredible!',
    stats: { clients: '+15', revenue: '+40%', time: '5hrs saved/week' },
  },
  {
    name: 'Marcus Johnson',
    role: 'Personal Trainer',
    location: 'Los Angeles',
    avatar: null,
    content:
      'The built-in messaging is a game-changer. I can chat with potential clients before they book, which helps me understand their goals and increases my conversion rate.',
    stats: { clients: '+22', revenue: '+55%', time: '8hrs saved/week' },
  },
  {
    name: 'Elena Rodriguez',
    role: 'Business Coach',
    location: 'Miami',
    avatar: null,
    content:
      'As a consultant, I tried several scheduling tools. BookMe stands out because clients can actually find and discover me. The analytics help me track my business growth.',
    stats: { clients: '+18', revenue: '+65%', time: '6hrs saved/week' },
  },
];

const comparisonPoints = [
  { feature: 'Monthly cost', bookme: '$0', others: '$15-50/mo' },
  { feature: 'Commission on bookings', bookme: '0%', others: '2-5%' },
  { feature: 'Client marketplace', bookme: 'Yes', others: 'No' },
  { feature: 'Built-in messaging', bookme: 'Yes', others: 'Limited' },
  { feature: 'Review system', bookme: 'Yes', others: 'Varies' },
  { feature: 'Analytics dashboard', bookme: 'Yes', others: 'Premium only' },
];

const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up in 2 minutes. Add your business info, services, and photos.',
  },
  {
    number: '02',
    title: 'Set Your Availability',
    description: 'Configure your working hours and let clients see when you\'re free.',
  },
  {
    number: '03',
    title: 'Get Verified',
    description: 'Quick verification process to build trust with potential clients.',
  },
  {
    number: '04',
    title: 'Start Receiving Bookings',
    description: 'Clients discover you and book directly. You keep 100% of earnings.',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ForProvidersPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-charcoal via-charcoal-600 to-charcoal text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-10" />

        <div className="container px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-cyan-500 text-white mb-4">
                For Service Providers
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Grow Your Business.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                  Keep 100%.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-8">
                Join thousands of professionals who use BookMe to find clients,
                manage appointments, and grow their business — completely free,
                no commission.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>$0 forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>No commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>2-min signup</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600" asChild>
                  <Link to={ROUTES.REGISTER}>
                    <Zap className="h-5 w-5 mr-2" />
                    Create Free Profile
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/how-it-works">
                    <Play className="h-5 w-5 mr-2" />
                    See How It Works
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              {/* Dashboard Preview Mockup */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl" />
                <Card className="relative bg-white/10 border-white/20 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <p className="text-2xl font-bold text-cyan-400">127</p>
                        <p className="text-xs text-white/70">Bookings</p>
                      </div>
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">$4,580</p>
                        <p className="text-xs text-white/70">Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <p className="text-2xl font-bold text-amber-400">4.9</p>
                        <p className="text-xs text-white/70">Rating</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <span className="text-sm">New booking from Sarah</span>
                        <Badge className="bg-green-500/20 text-green-400 border-0">New</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <span className="text-sm">5-star review received</span>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Why BookMe</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              BookMe gives you powerful tools to manage your business and reach more clients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-600 shrink-0">
                        <benefit.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground mb-4">
                          {benefit.description}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-cyan-600">
                            {benefit.stat}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {benefit.statLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Powerful Tools for Professionals
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex p-3 rounded-xl bg-cyan-100 text-cyan-600 mb-4">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Getting Started</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Start in 4 Simple Steps
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-200 to-transparent -translate-x-1/2" />
                )}
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500 text-white text-xl font-bold mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link to={ROUTES.REGISTER}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-mint/50 to-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Success Stories</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Trusted by Thousands of Professionals
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-cyan-200 mb-4" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="font-bold text-cyan-600">{testimonial.stats.clients}</p>
                        <p className="text-xs text-muted-foreground">Clients</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{testimonial.stats.revenue}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-amber-600">{testimonial.stats.time}</p>
                        <p className="text-xs text-muted-foreground">Saved</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar
                        firstName={testimonial.name.split(' ')[0]}
                        lastName={testimonial.name.split(' ')[1]}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} • {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Comparison</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Why Choose BookMe?
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-4 px-6 text-left font-medium">Feature</th>
                      <th className="py-4 px-6 text-center font-bold text-cyan-600">BookMe</th>
                      <th className="py-4 px-6 text-center font-medium text-muted-foreground">Others</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonPoints.map((row, index) => (
                      <tr key={row.feature} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-4 px-6 font-medium">{row.feature}</td>
                        <td className="py-4 px-6 text-center font-bold text-green-600">
                          {row.bookme}
                        </td>
                        <td className="py-4 px-6 text-center text-muted-foreground">
                          {row.others}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-white/90 mb-4 max-w-2xl mx-auto">
              Join thousands of professionals who trust BookMe to manage their appointments
              and find new clients.
            </p>
            <p className="text-xl font-semibold mb-8">
              It's free. It's easy. Start today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-white/90 text-lg px-8"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Create My Free Profile
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
                asChild
              >
                <Link to="/pricing">
                  View Pricing (It's $0)
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ForProvidersPage;