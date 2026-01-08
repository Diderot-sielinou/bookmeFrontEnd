/**
 * PricingPage Component
 *
 * Strategic pricing page showing:
 * - BookMe's free model prominently
 * - Comparison with competitor pricing
 * - Value proposition breakdown
 * - FAQ about pricing
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Shield,
  MessageSquare,
  Calendar,
  Bell,
  Star,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Heart,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const clientFeatures = [
  { name: 'Search & discover providers', included: true },
  { name: 'View real-time availability', included: true },
  { name: 'Instant booking confirmation', included: true },
  { name: 'Direct messaging with providers', included: true },
  { name: 'Automatic reminders (24h & 1h)', included: true },
  { name: 'Leave verified reviews', included: true },
  { name: 'Manage all appointments', included: true },
  { name: 'Cancel or reschedule anytime', included: true },
  { name: 'Email & push notifications', included: true },
  { name: 'Secure payment info storage', included: true },
];

const providerFeatures = [
  { name: 'Create professional profile', included: true },
  { name: 'List unlimited services', included: true },
  { name: 'Set custom availability', included: true },
  { name: 'Receive instant bookings', included: true },
  { name: 'Built-in messaging system', included: true },
  { name: 'Calendar management', included: true },
  { name: 'Client management', included: true },
  { name: 'Review management & responses', included: true },
  { name: 'Performance analytics', included: true },
  { name: 'Badge & recognition system', included: true },
  { name: 'Portfolio showcase', included: true },
  { name: 'No commission on bookings', included: true, highlight: true },
];

const competitorComparison = [
  {
    feature: 'Monthly subscription',
    bookme: 'Free',
    calendly: '$12-20/mo',
    acuity: '$16-46/mo',
    simplybook: '$8-50/mo',
  },
  {
    feature: 'Commission on bookings',
    bookme: '0%',
    calendly: '0%',
    acuity: '0%',
    simplybook: '2.5-5%',
  },
  {
    feature: 'Built-in messaging',
    bookme: true,
    calendly: false,
    acuity: false,
    simplybook: true,
  },
  {
    feature: 'Client marketplace',
    bookme: true,
    calendly: false,
    acuity: false,
    simplybook: false,
  },
  {
    feature: 'Review system',
    bookme: true,
    calendly: false,
    acuity: false,
    simplybook: true,
  },
  {
    feature: 'Provider discovery',
    bookme: true,
    calendly: false,
    acuity: false,
    simplybook: false,
  },
  {
    feature: 'Automatic reminders',
    bookme: true,
    calendly: true,
    acuity: true,
    simplybook: true,
  },
  {
    feature: 'Calendar sync',
    bookme: true,
    calendly: true,
    acuity: true,
    simplybook: true,
  },
];

const faqs = [
  {
    question: 'Why is BookMe completely free?',
    answer:
      'We believe quality appointment booking should be accessible to everyone. Our mission is to connect clients with service providers without financial barriers. We sustain the platform through optional premium features and partnerships, not by charging for core functionality.',
  },
  {
    question: 'Will BookMe ever charge for basic features?',
    answer:
      'No. Our core features (booking, messaging, calendar, reminders, reviews) will always be free. We may introduce optional premium features in the future, but the essential booking experience will remain free forever.',
  },
  {
    question: 'Are there any hidden fees?',
    answer:
      'Absolutely not. No subscription fees, no commission on bookings, no setup fees, no transaction fees. What you see is what you get — completely free.',
  },
  {
    question: 'How do providers keep 100% of their earnings?',
    answer:
      'Unlike some platforms that take a percentage of each booking, BookMe never touches your money. Clients pay providers directly (cash, card, or however you prefer). We don\'t process payments or take commissions.',
  },
  {
    question: 'What premium features might be added in the future?',
    answer:
      'We\'re considering optional features like advanced analytics, team scheduling, CRM integrations, and custom branding. These would be premium add-ons — core booking functionality stays free.',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-20 lg:py-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full blur-3xl opacity-20" />

        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-green-500 text-white mb-4">
              <Sparkles className="h-4 w-4 mr-1" />
              100% Free Forever
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6">
              Simple Pricing:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-cyan-500">
                $0
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              No subscriptions. No commissions. No hidden fees.
              BookMe is completely free for clients and providers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/compare">
                  Compare with Others
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Client Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-cyan-300 transition-colors">
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex p-3 rounded-2xl bg-cyan-100 text-cyan-600 mx-auto mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">For Clients</CardTitle>
                  <p className="text-muted-foreground">
                    Find and book appointments
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">$0</span>
                      <span className="text-muted-foreground">/forever</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      No credit card required
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {clientFeatures.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" size="lg" asChild>
                    <Link to={ROUTES.REGISTER}>
                      Sign Up Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Provider Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-cyan-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex p-3 rounded-2xl bg-cyan-100 text-cyan-600 mx-auto mb-4">
                    <Award className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">For Providers</CardTitle>
                  <p className="text-muted-foreground">
                    Grow your service business
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">$0</span>
                      <span className="text-muted-foreground">/forever</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      Keep 100% of your earnings
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {providerFeatures.map((feature) => (
                      <li
                        key={feature.name}
                        className={cn(
                          'flex items-center gap-3',
                          feature.highlight && 'font-medium text-green-600'
                        )}
                      >
                        <Check
                          className={cn(
                            'h-5 w-5 shrink-0',
                            feature.highlight ? 'text-green-600' : 'text-green-500'
                          )}
                        />
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" size="lg" asChild>
                    <Link to={ROUTES.REGISTER}>
                      Create Provider Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20 bg-gradient-to-b from-white to-mint/30">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Heart className="h-3 w-3 mr-1" />
              Our Philosophy
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-6">
              Why We're Free
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We believe that connecting people with the services they need shouldn't come with
              a price tag. Whether you're a client looking for a great hairdresser or a
              freelance coach building your practice, booking should be simple, accessible,
              and free.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-cyan-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Gatekeeping</h3>
                  <p className="text-sm text-muted-foreground">
                    Everyone deserves access to quality services
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-cyan-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Fair for Providers</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep 100% of what you earn
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-cyan-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Sustainable Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Optional premium add-ons, not core features
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Competitor Comparison */}
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
              See How We Compare
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              BookMe offers more value at no cost compared to paid alternatives.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-4 text-left font-medium">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white font-bold flex items-center justify-center mb-1">
                        B
                      </div>
                      <span className="font-bold text-cyan-600">BookMe</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center font-medium text-muted-foreground">
                    Calendly
                  </th>
                  <th className="py-4 px-4 text-center font-medium text-muted-foreground">
                    Acuity
                  </th>
                  <th className="py-4 px-4 text-center font-medium text-muted-foreground">
                    SimplyBook
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={cn('border-b', index % 2 === 0 && 'bg-gray-50')}
                  >
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.bookme === 'boolean' ? (
                        row.bookme ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="font-bold text-green-600">{row.bookme}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {typeof row.calendly === 'boolean' ? (
                        row.calendly ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        row.calendly
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {typeof row.acuity === 'boolean' ? (
                        row.acuity ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        row.acuity
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {typeof row.simplybook === 'boolean' ? (
                        row.simplybook ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        row.simplybook
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/compare">
                View Full Comparison
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <HelpCircle className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Pricing Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Join for Free?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              No credit card. No commitment. Just sign up and start booking or
              accepting appointments today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-white/90"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/how-it-works">
                  See How It Works
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;