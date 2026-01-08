/**
 * AboutPage Component
 *
 * Company about page with:
 * - Mission and vision
 * - Company story
 * - Team section
 * - Values
 * - Stats
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Shield,
  Zap,
  Users,
  Target,
  Globe,
  Award,
  ArrowRight,
  Star,
  Calendar,
  CheckCircle,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { Button, Card, CardContent, Badge, Avatar } from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const stats = [
  { value: '10,000+', label: 'Happy Users', icon: Users },
  { value: '2,500+', label: 'Verified Providers', icon: Award },
  { value: '50,000+', label: 'Appointments Booked', icon: Calendar },
  { value: '50+', label: 'Service Categories', icon: Globe },
];

const values = [
  {
    icon: Heart,
    title: 'Accessibility',
    description: 'We believe quality services should be accessible to everyone. That\'s why BookMe is free.',
  },
  {
    icon: Shield,
    title: 'Trust',
    description: 'Verified providers, real reviews, and secure data handling build the foundation of trust.',
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Booking an appointment should be effortless. We obsess over making things simple.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We\'re building a community where service providers and clients thrive together.',
  },
];

const team = [
  { name: 'Sarah Chen', role: 'CEO & Co-founder', avatar: null },
  { name: 'Marcus Johnson', role: 'CTO & Co-founder', avatar: null },
  { name: 'Elena Rodriguez', role: 'Head of Product', avatar: null },
  { name: 'David Park', role: 'Head of Growth', avatar: null },
];

const milestones = [
  { year: '2022', title: 'Founded', description: 'BookMe was born from a simple idea: appointment booking should be free and easy.' },
  { year: '2023', title: 'First 1,000 Users', description: 'Reached our first milestone with users across multiple cities.' },
  { year: '2024', title: '10,000+ Users', description: 'Grew to serve thousands of clients and providers nationwide.' },
  { year: '2025', title: 'Expanding', description: 'Launching new features and expanding to more service categories.' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-charcoal to-charcoal-600 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10" />

        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-cyan-500 text-white mb-4">About Us</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Making Appointment Booking{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                Free & Simple
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80">
              We're on a mission to connect people with the services they need,
              without barriers, without fees, without hassle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-charcoal">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">Our Story</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-6">
                Why We Built BookMe
              </h2>
            </motion.div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                It started with a simple frustration: why is booking an appointment so complicated?
                Phone calls, voicemails, waiting for callbacks, missed connections. There had to be a better way.
              </p>
              <p>
                We looked at existing solutions and found they were either expensive for providers,
                limited in scope, or missing key features like direct messaging and client discovery.
                So we decided to build something different.
              </p>
              <p>
                <strong className="text-foreground">BookMe was born from the belief that connecting people with services should be free, instant, and transparent.</strong>
              </p>
              <p>
                Today, we serve thousands of clients and providers across dozens of service categories.
                And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Our Journey</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal">
              Key Milestones
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-cyan-200 -translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center gap-6 mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="hidden md:block flex-1" />
                  <div className="relative z-10 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <Card>
                      <CardContent className="p-4">
                        <Badge className="bg-cyan-100 text-cyan-700 mb-2">
                          {milestone.year}
                        </Badge>
                        <h3 className="font-semibold mb-1">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Our Values</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex p-3 rounded-2xl bg-cyan-100 text-cyan-600 mb-4">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-b from-mint/30 to-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Our Team</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Meet the People Behind BookMe
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Avatar
                  firstName={member.name.split(' ')[0]}
                  lastName={member.name.split(' ')[1]}
                  size="2xl"
                  className="mx-auto mb-4"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Join Us on Our Mission
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're looking to book services or grow your business,
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-white/90" asChild>
                <Link to={ROUTES.SEARCH}>Find a Provider</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to={ROUTES.REGISTER}>Join as Provider</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;