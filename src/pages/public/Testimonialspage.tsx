/**
 * TestimonialsPage Component
 *
 * Dedicated testimonials page with:
 * - Featured testimonials
 * - Client vs Provider filter
 * - Video testimonials section
 * - Stats showcase
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Quote,
  Users,
  Award,
  Play,
  ArrowRight,
  Calendar,
  TrendingUp,
  Heart,
  Filter,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const stats = [
  { value: '10,000+', label: 'Happy Users', icon: Users },
  { value: '4.8/5', label: 'Average Rating', icon: Star },
  { value: '50,000+', label: 'Appointments Booked', icon: Calendar },
  { value: '2,500+', label: 'Verified Providers', icon: Award },
];

const clientTestimonials = [
  {
    id: 1,
    name: 'Emily Thompson',
    age: 34,
    location: 'New York',
    category: 'Wellness',
    service: 'Osteopath',
    rating: 5,
    avatar: null,
    featured: true,
    content:
      'The instant messaging feature completely changed how I book appointments. I was nervous about trying a new osteopath, but being able to chat with them first put me at ease. I knew exactly what to expect and the session was perfect.',
    highlight: 'The messaging feature put me at ease',
  },
  {
    id: 2,
    name: 'James Wilson',
    age: 41,
    location: 'Los Angeles',
    category: 'Business',
    service: 'Business Coach',
    rating: 5,
    avatar: null,
    featured: true,
    content:
      'As a busy executive, I don\'t have time to make phone calls to schedule appointments. BookMe let me find a business coach, read reviews, and book — all in my 10-minute coffee break. The reminders are a lifesaver too.',
    highlight: 'Booked during my coffee break',
  },
  {
    id: 3,
    name: 'Sarah Chen',
    age: 28,
    location: 'San Francisco',
    category: 'Beauty',
    service: 'Hair Stylist',
    rating: 5,
    avatar: null,
    content:
      'I moved to a new city and had no idea where to get my hair done. BookMe helped me find an amazing stylist with great reviews. The portfolio photos on their profile showed exactly the styles I was looking for.',
    highlight: 'Found my perfect stylist in a new city',
  },
  {
    id: 4,
    name: 'Michael Brown',
    age: 52,
    location: 'Chicago',
    category: 'Health',
    service: 'Physiotherapist',
    rating: 5,
    avatar: null,
    content:
      'After my knee surgery, I needed regular physio sessions. BookMe made it easy to find a specialist and book recurring appointments. The automated reminders mean I never miss a session.',
    highlight: 'Easy recurring appointments',
  },
  {
    id: 5,
    name: 'Lisa Martinez',
    age: 31,
    location: 'Miami',
    category: 'Fitness',
    service: 'Personal Trainer',
    rating: 5,
    avatar: null,
    content:
      'I was intimidated to try a personal trainer, but reading the detailed reviews helped me find someone who specializes in beginners. The messaging feature let me explain my goals before our first session.',
    highlight: 'Reviews helped me find the right fit',
  },
  {
    id: 6,
    name: 'David Park',
    age: 45,
    location: 'Seattle',
    category: 'Business',
    service: 'Tax Consultant',
    rating: 5,
    avatar: null,
    content:
      'Tax season used to be stressful. Now I book my accountant through BookMe months in advance. Being able to see their availability in real-time and book instantly is so convenient.',
    highlight: 'Real-time availability is convenient',
  },
];

const providerTestimonials = [
  {
    id: 1,
    name: 'Sophie Martin',
    location: 'Paris',
    category: 'Beauty',
    service: 'Esthetician',
    rating: 5,
    avatar: null,
    featured: true,
    content:
      'BookMe transformed my business. I gained 15 new regular clients in just 2 months without spending a dime on advertising. The fact that it\'s completely free and I keep 100% of my earnings is incredible.',
    stats: { newClients: '+15', revenueGrowth: '+40%', timeSaved: '5hrs/week' },
    highlight: '15 new clients in 2 months',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    location: 'Los Angeles',
    category: 'Fitness',
    service: 'Personal Trainer',
    rating: 5,
    avatar: null,
    featured: true,
    content:
      'The built-in messaging is a game-changer. Potential clients can ask questions before booking, which helps me understand their goals and increases my conversion rate. I close more leads than ever before.',
    stats: { newClients: '+22', revenueGrowth: '+55%', timeSaved: '8hrs/week' },
    highlight: 'Messaging increased my conversions',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    location: 'Miami',
    category: 'Business',
    service: 'Business Coach',
    rating: 5,
    avatar: null,
    content:
      'As a consultant, I tried Calendly and Acuity. BookMe stands out because clients actually find and discover me. It\'s not just a scheduling tool — it\'s a marketplace that brings clients to my door.',
    stats: { newClients: '+18', revenueGrowth: '+65%', timeSaved: '6hrs/week' },
    highlight: 'Clients discover me organically',
  },
  {
    id: 4,
    name: 'Thomas Chen',
    location: 'Toronto',
    category: 'Health',
    service: 'Massage Therapist',
    rating: 5,
    avatar: null,
    content:
      'The analytics dashboard helps me understand my business better than ever. I can see which services are popular, track my ratings, and make data-driven decisions to grow my practice.',
    stats: { newClients: '+12', revenueGrowth: '+35%', timeSaved: '4hrs/week' },
    highlight: 'Analytics help me grow strategically',
  },
  {
    id: 5,
    name: 'Anna Kowalski',
    location: 'Berlin',
    category: 'Education',
    service: 'Language Tutor',
    rating: 5,
    avatar: null,
    content:
      'I teach German to expats. BookMe helps my students find me easily and book lessons that fit their schedules. The calendar management saves me so much administrative time.',
    stats: { newClients: '+20', revenueGrowth: '+45%', timeSaved: '7hrs/week' },
    highlight: 'Calendar management is effortless',
  },
  {
    id: 6,
    name: 'Raj Patel',
    location: 'London',
    category: 'Health',
    service: 'Nutritionist',
    rating: 5,
    avatar: null,
    content:
      'The badge system motivates me to provide excellent service. Earning the "Top Provider" badge brought a noticeable increase in bookings. Clients trust verified professionals.',
    stats: { newClients: '+16', revenueGrowth: '+50%', timeSaved: '5hrs/week' },
    highlight: 'Badges build client trust',
  },
];

// ==========================================
// SUB-COMPONENTS
// ==========================================

function TestimonialCard({
  testimonial,
  type,
  index,
}: {
  testimonial: any;
  type: 'client' | 'provider';
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'h-full',
          testimonial.featured && 'border-cyan-300 bg-gradient-to-br from-cyan-50/50 to-white'
        )}
      >
        <CardContent className="p-6">
          {testimonial.featured && (
            <Badge className="bg-cyan-500 text-white mb-4">Featured</Badge>
          )}

          <Quote className="h-8 w-8 text-cyan-200 mb-4" />

          {/* Highlight */}
          {testimonial.highlight && (
            <p className="text-lg font-semibold text-cyan-600 mb-3">
              "{testimonial.highlight}"
            </p>
          )}

          {/* Content */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {testimonial.content}
          </p>

          {/* Provider Stats */}
          {type === 'provider' && testimonial.stats && (
            <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="font-bold text-cyan-600">{testimonial.stats.newClients}</p>
                <p className="text-xs text-muted-foreground">New Clients</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-600">{testimonial.stats.revenueGrowth}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-amber-600">{testimonial.stats.timeSaved}</p>
                <p className="text-xs text-muted-foreground">Time Saved</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar
              firstName={testimonial.name.split(' ')[0]}
              lastName={testimonial.name.split(' ')[1]}
              size="md"
            />
            <div>
              <p className="font-medium">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {type === 'client'
                  ? `${testimonial.location} • ${testimonial.service}`
                  : `${testimonial.service} • ${testimonial.location}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'providers'>('clients');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-20 lg:py-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-20" />

        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-amber-500 text-white mb-4">
              <Heart className="h-4 w-4 mr-1" />
              Success Stories
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                Thousands
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Real stories from real users. See how BookMe is helping clients find great
              services and providers grow their businesses.
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

      {/* Testimonials Tabs */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'clients' | 'providers')}
          >
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="clients" className="text-base py-3">
                  <Users className="h-4 w-4 mr-2" />
                  Client Stories
                </TabsTrigger>
                <TabsTrigger value="providers" className="text-base py-3">
                  <Award className="h-4 w-4 mr-2" />
                  Provider Stories
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="clients">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientTestimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    type="client"
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="providers">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providerTestimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    type="provider"
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Video Testimonials Placeholder */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Play className="h-3 w-3 mr-1" />
              Video Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Hear From Our Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch real users share their BookMe experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-video bg-gradient-to-br from-charcoal to-charcoal-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all">
                        <Play className="h-6 w-6 text-white ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium">Video Testimonial {index + 1}</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users. Whether you're looking for services
              or growing your business, BookMe is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-white/90"
                asChild
              >
                <Link to={ROUTES.SEARCH}>
                  Find a Provider
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  Join as Provider
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default TestimonialsPage;