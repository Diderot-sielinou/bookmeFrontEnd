/**
 * ComparePage Component
 *
 * SEO-friendly comparison page:
 * - BookMe vs competitors
 * - Feature-by-feature comparison
 * - Use case scenarios
 * - CTA sections
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Minus,
  Zap,
  Shield,
  MessageSquare,
  Users,
  Star,
  Calendar,
  ArrowRight,
  Award,
  TrendingUp,
  Globe,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button, Card, CardContent, Badge } from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const competitors = [
  { id: 'bookme', name: 'BookMe', highlight: true },
  { id: 'calendly', name: 'Calendly' },
  { id: 'acuity', name: 'Acuity' },
  { id: 'simplybook', name: 'SimplyBook.me' },
  { id: 'doctolib', name: 'Doctolib' },
];

const comparisonCategories = [
  {
    title: 'Pricing',
    features: [
      {
        name: 'Monthly subscription',
        bookme: { value: 'Free', type: 'highlight' },
        calendly: { value: '$12-20/mo', type: 'text' },
        acuity: { value: '$16-46/mo', type: 'text' },
        simplybook: { value: '$8-50/mo', type: 'text' },
        doctolib: { value: 'Paid', type: 'text' },
      },
      {
        name: 'Commission on bookings',
        bookme: { value: '0%', type: 'highlight' },
        calendly: { value: '0%', type: 'text' },
        acuity: { value: '0%', type: 'text' },
        simplybook: { value: '2.5-5%', type: 'warning' },
        doctolib: { value: 'Varies', type: 'text' },
      },
      {
        name: 'Free tier available',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: false, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: false, type: 'boolean' },
      },
    ],
  },
  {
    title: 'Core Features',
    features: [
      {
        name: 'Online booking',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: true, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Calendar management',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: true, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Automatic reminders',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: true, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Calendar sync (Google, Outlook)',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: true, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
    ],
  },
  {
    title: 'Marketplace Features',
    features: [
      {
        name: 'Client marketplace/discovery',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: false, type: 'boolean' },
        acuity: { value: false, type: 'boolean' },
        simplybook: { value: false, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Built-in messaging',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: false, type: 'boolean' },
        acuity: { value: false, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Review system',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: false, type: 'boolean' },
        acuity: { value: false, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
      {
        name: 'Provider profiles',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: false, type: 'boolean' },
        acuity: { value: false, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: true, type: 'boolean' },
      },
    ],
  },
  {
    title: 'Industry Focus',
    features: [
      {
        name: 'Multi-vertical (Beauty, Health, Business...)',
        bookme: { value: true, type: 'boolean' },
        calendly: { value: true, type: 'boolean' },
        acuity: { value: true, type: 'boolean' },
        simplybook: { value: true, type: 'boolean' },
        doctolib: { value: false, type: 'boolean' },
      },
      {
        name: 'Service categories',
        bookme: { value: '50+', type: 'highlight' },
        calendly: { value: 'N/A', type: 'text' },
        acuity: { value: 'N/A', type: 'text' },
        simplybook: { value: '20+', type: 'text' },
        doctolib: { value: 'Healthcare only', type: 'text' },
      },
    ],
  },
];

const useCases = [
  {
    title: 'Best for Independent Professionals',
    description: 'Hair stylists, massage therapists, consultants who want to be discovered by new clients.',
    winner: 'BookMe',
    reason: 'Free marketplace + messaging + reviews',
    icon: Users,
  },
  {
    title: 'Best for Corporate Scheduling',
    description: 'Teams scheduling meetings, sales calls, and internal appointments.',
    winner: 'Calendly',
    reason: 'Team features + integrations',
    icon: Calendar,
  },
  {
    title: 'Best for Healthcare',
    description: 'Doctors, clinics, and medical professionals.',
    winner: 'Doctolib',
    reason: 'Healthcare-specific features + insurance',
    icon: Shield,
  },
  {
    title: 'Best Value Overall',
    description: 'Maximum features at minimum cost.',
    winner: 'BookMe',
    reason: '$0 with full marketplace features',
    icon: TrendingUp,
  },
];

// ==========================================
// SUB-COMPONENTS
// ==========================================

function FeatureValue({ value }: { value: { value: any; type: string } }) {
  if (value.type === 'boolean') {
    return value.value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-400 mx-auto" />
    );
  }

  if (value.type === 'highlight') {
    return (
      <span className="font-bold text-green-600">{value.value}</span>
    );
  }

  if (value.type === 'warning') {
    return (
      <span className="text-amber-600">{value.value}</span>
    );
  }

  return <span className="text-muted-foreground">{value.value}</span>;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ComparePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-20 lg:py-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />

        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-cyan-500 text-white mb-4">Comparison</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6">
              BookMe vs. The Competition
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              See how BookMe stacks up against other booking platforms.
              Spoiler: we're the only one that's completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View Pricing Details</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Winner Cards */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Best For</Badge>
            <h2 className="text-3xl font-bold text-charcoal">
              Choose the Right Tool for Your Needs
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  'h-full',
                  useCase.winner === 'BookMe' && 'border-cyan-300 bg-cyan-50/50'
                )}>
                  <CardContent className="p-5">
                    <useCase.icon className={cn(
                      'h-8 w-8 mb-3',
                      useCase.winner === 'BookMe' ? 'text-cyan-500' : 'text-gray-400'
                    )} />
                    <h3 className="font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {useCase.description}
                    </p>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground">Winner:</p>
                      <p className={cn(
                        'font-bold',
                        useCase.winner === 'BookMe' ? 'text-cyan-600' : 'text-charcoal'
                      )}>
                        {useCase.winner}
                      </p>
                      <p className="text-xs text-muted-foreground">{useCase.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Feature Comparison</Badge>
            <h2 className="text-3xl font-bold text-charcoal">
              Detailed Feature Breakdown
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] bg-white rounded-xl shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-4 text-left font-medium w-64">Feature</th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.id}
                      className={cn(
                        'py-4 px-4 text-center',
                        comp.highlight && 'bg-cyan-50'
                      )}
                    >
                      <div className="flex flex-col items-center">
                        {comp.highlight && (
                          <Badge className="bg-cyan-500 text-white mb-1 text-xs">
                            Best Value
                          </Badge>
                        )}
                        <span className={cn(
                          'font-bold',
                          comp.highlight ? 'text-cyan-600' : 'text-charcoal'
                        )}>
                          {comp.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category) => (
                  <>
                    <tr key={category.title} className="bg-gray-100">
                      <td
                        colSpan={competitors.length + 1}
                        className="py-3 px-4 font-semibold text-charcoal"
                      >
                        {category.title}
                      </td>
                    </tr>
                    {category.features.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={cn('border-b', index % 2 === 0 && 'bg-gray-50/50')}
                      >
                        <td className="py-3 px-4 text-sm">{feature.name}</td>
                        {competitors.map((comp) => (
                          <td
                            key={comp.id}
                            className={cn(
                              'py-3 px-4 text-center text-sm',
                              comp.highlight && 'bg-cyan-50/50'
                            )}
                          >
                            <FeatureValue
                              value={feature[comp.id as keyof typeof feature] as any}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BookMe Advantages */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Why BookMe Wins</Badge>
            <h2 className="text-3xl font-bold text-charcoal">
              Unique Advantages
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Zap className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">100% Free</h3>
                <p className="text-sm text-muted-foreground">
                  No subscription, no commission. Save $150-600/year compared to paid alternatives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 bg-cyan-50">
              <CardContent className="p-6 text-center">
                <Globe className="h-10 w-10 text-cyan-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Client Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  Unlike scheduling tools, BookMe brings new clients to you through our marketplace.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Built-in Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Direct messaging with clients before booking. No need for external communication tools.
                </p>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Try the Best Free Option?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands who've switched to BookMe. All the features you need,
              none of the fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-white/90"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Start Free Today
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to={ROUTES.SEARCH}>
                  Explore Providers
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ComparePage;