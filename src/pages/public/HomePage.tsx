/**
 * HomePage Component
 * 
 * Public landing page showcasing BookMe platform.
 * Features:
 * - Hero section with CTAs
 * - How it works section
 * - Popular categories
 * - Testimonials
 * - Final CTA
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  CheckCircle,
  Star,
  ArrowRight,
  Scissors,
  Heart,
  Briefcase,
  Sparkles,
} from 'lucide-react';

import { ROUTES, PROFESSIONAL_CATEGORIES } from '@/lib/constants';
import { Button, Card, CardContent, Avatar } from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Find the perfect service provider from our curated selection of qualified professionals.',
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Choose an available time slot that fits your schedule and confirm in seconds.',
  },
  {
    icon: CheckCircle,
    title: 'Enjoy',
    description: 'Show up to your appointment and enjoy quality service from trusted providers.',
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  'Hair Salon': Scissors,
  'Beauty': Sparkles,
  'Wellness': Heart,
  'Consulting': Briefcase,
};

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Client',
    content: 'Super convenient! I found my hairdresser in 2 minutes and booked directly online.',
    rating: 5,
    avatar: null,
  },
  {
    name: 'Thomas B.',
    role: 'Service Provider',
    content: 'Thanks to BookMe, I manage my appointments easily and gained new clients.',
    rating: 5,
    avatar: null,
  },
  {
    name: 'Sophie M.',
    role: 'Client',
    content: 'The automatic reminders are great - I never miss my appointments anymore!',
    rating: 5,
    avatar: null,
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// ==========================================
// COMPONENT
// ==========================================

export function HomePage() {
  const featuredCategories = PROFESSIONAL_CATEGORIES.slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint to-white py-20 lg:py-32">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Book Your Appointments{' '}
              <span className="text-cyan-500">in Seconds</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Find the best service providers near you and book instantly.
              Simple, fast, and free.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button size="lg" asChild className="text-lg px-8">
                <Link to={ROUTES.SEARCH}>
                  <Search className="mr-2 h-5 w-5" />
                  Find a Provider
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to={ROUTES.REGISTER}>Become a Provider</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          HOW IT WORKS
          ========================================== */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Booking an appointment has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative inline-flex mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                    <step.icon className="h-8 w-8 text-cyan-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          POPULAR CATEGORIES
          ========================================== */}
      <section className="py-20 bg-mint">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">
              Popular Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our different service categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredCategories.map((category, index) => {
              const Icon = categoryIcons[category] || Briefcase;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`${ROUTES.SEARCH}?category=${encodeURIComponent(category)}`}>
                    <Card className="card-hover">
                      <CardContent className="p-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 mx-auto mb-3">
                          <Icon className="h-6 w-6 text-cyan-600" />
                        </div>
                        <h3 className="font-medium">{category}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to={ROUTES.SEARCH}>
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIALS
          ========================================== */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover reviews from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={testimonial.avatar}
                        firstName={testimonial.name.split(' ')[0]}
                        lastName={testimonial.name.split(' ')[1]}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FINAL CTA
          ========================================== */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their appointment management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-white text-cyan-600 hover:bg-white/90">
              <Link to={ROUTES.REGISTER}>Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link to={ROUTES.SEARCH}>Browse Providers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;