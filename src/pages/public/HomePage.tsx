/**
 * HomePage Component - ENHANCED VERSION
 *
 * Conversion-optimized landing page with:
 * - USP-focused hero section (Free, Multi-vertical, Instant messaging)
 * - Bento grid benefits
 * - Interactive category tabs
 * - Featured providers carousel
 * - Provider CTA section
 * - Enhanced testimonials
 * - Dynamic FAQ
 * - Emotional final CTA
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  MessageSquare,
  Bell,
  Shield,
  Clock,
  Zap,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
  Play,
  Dumbbell,
  GraduationCap,
  Stethoscope,
  Camera,
  Palette,
} from "lucide-react";

import { ROUTES, PROFESSIONAL_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Button,
  Card,
  CardContent,
  Avatar,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

// ==========================================
// STATIC DATA
// ==========================================

const benefits = [
  {
    icon: MessageSquare,
    title: "Instant Messaging",
    description:
      "Chat directly with providers before booking. Ask questions, discuss your needs, get answers instantly.",
    highlight: true,
    color: "cyan",
  },
  {
    icon: Zap,
    title: "Free Forever",
    description:
      "No subscription, no commission, no hidden fees. 100% free for clients and providers.",
    highlight: true,
    color: "green",
    comparison: { bookme: "$0", others: "$29/mo" },
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Automatic notifications 24h and 1h before your appointment. Never miss a booking again.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "Verified Reviews",
    description:
      "Quality, punctuality, cleanliness — real ratings from real customers help you choose.",
    color: "purple",
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    description:
      "See live schedules, book instantly. Confirmation in seconds, not days.",
    color: "teal",
  },
];

const categoryGroups = {
  "Beauty & Wellness": [
    { name: "Hair Salon", icon: Scissors, count: 234 },
    { name: "Nail Salon", icon: Sparkles, count: 189 },
    { name: "Massage", icon: Heart, count: 156 },
    { name: "Spa & Beauty", icon: Sparkles, count: 143 },
  ],
  Health: [
    { name: "Physiotherapy", icon: Stethoscope, count: 98 },
    { name: "Osteopath", icon: Heart, count: 76 },
    { name: "Psychologist", icon: Heart, count: 112 },
    { name: "Nutritionist", icon: Heart, count: 67 },
  ],
  Business: [
    { name: "Business Coach", icon: Briefcase, count: 89 },
    { name: "Consultant", icon: TrendingUp, count: 134 },
    { name: "Accountant", icon: Briefcase, count: 56 },
    { name: "Lawyer", icon: Shield, count: 45 },
  ],
  "Sport & Fitness": [
    { name: "Personal Trainer", icon: Dumbbell, count: 167 },
    { name: "Yoga Instructor", icon: Heart, count: 98 },
    { name: "Sports Coach", icon: Dumbbell, count: 76 },
    { name: "Pilates", icon: Heart, count: 54 },
  ],
  Education: [
    { name: "Private Tutor", icon: GraduationCap, count: 213 },
    { name: "Language Teacher", icon: GraduationCap, count: 156 },
    { name: "Music Teacher", icon: Palette, count: 89 },
    { name: "Art Teacher", icon: Palette, count: 67 },
  ],
};

const featuredProviders = [
  {
    id: "1",
    name: "Marie Dupont",
    businessName: "Studio Marie Coiffure",
    category: "Hair Salon",
    location: "Paris 11th",
    rating: 4.9,
    reviewCount: 127,
    avatar: null,
    badges: ["Top Provider", "Quick Response"],
    testimonial: "Professional and attentive, I highly recommend!",
  },
  {
    id: "2",
    name: "Thomas Bernard",
    businessName: "TB Business Coaching",
    category: "Business Coach",
    location: "Lyon",
    rating: 5.0,
    reviewCount: 89,
    avatar: null,
    badges: ["Top Provider"],
    testimonial: "His advice transformed my business approach.",
  },
  {
    id: "3",
    name: "Sophie Martin",
    businessName: "Zen Massage Paris",
    category: "Massage Therapist",
    location: "Paris 6th",
    rating: 4.8,
    reviewCount: 203,
    avatar: null,
    badges: ["Popular", "Reliable"],
    testimonial: "The best massage I've ever had. Truly relaxing.",
  },
];

const testimonials = [
  {
    name: "Emily Thompson",
    age: 34,
    location: "New York",
    role: "Client",
    service: "Osteopath",
    content:
      "The instant messaging feature let me ask questions before my appointment. I knew exactly what to expect and felt so much more comfortable.",
    rating: 5,
    avatar: null,
  },
  {
    name: "James Wilson",
    age: 41,
    location: "Los Angeles",
    role: "Client",
    service: "Business Coach",
    content:
      "Found my business coach in 2 minutes, booked for the same week. The automatic reminders are a game-changer — I never miss appointments anymore.",
    rating: 5,
    avatar: null,
  },
  {
    name: "Sarah Chen",
    age: 28,
    location: "Chicago",
    role: "Provider",
    service: "Yoga Instructor",
    content:
      "I gained 15 new regular clients in just 2 months. The free platform means I keep 100% of my earnings. Best decision for my business!",
    rating: 5,
    avatar: null,
  },
];

const faqs = [
  {
    question: "Is BookMe really free?",
    answer:
      "Yes, 100% free for both clients AND providers. No subscription fees, no commission on bookings, no hidden charges. We believe quality appointment booking should be accessible to everyone.",
  },
  {
    question: "How does the messaging feature work?",
    answer:
      "The messaging feature becomes available after you book an appointment with a provider. This allows you to discuss your specific needs, ask questions, share relevant information, or clarify details before your appointment. Providers typically respond within a few hours. Your conversation history is saved for future reference.",
  },
  {
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "Yes, you can cancel or reschedule directly from your dashboard. We recommend doing so at least 24 hours in advance as a courtesy to the provider. Some providers may have their own cancellation policies.",
  },
  {
    question: "How are providers verified?",
    answer:
      "All providers go through a verification process before their profile goes live. We verify their identity and professional credentials. Additionally, our review system with ratings on quality, punctuality, and cleanliness helps maintain high standards.",
  },
  {
    question: "Is my personal data secure?",
    answer:
      "Absolutely. We use bank-level encryption to protect your data. Your personal information is never shared with third parties, and you control what's visible on your profile. We're fully GDPR compliant.",
  },
];

const providerBenefits = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Manage your availability with an intuitive calendar. Set recurring slots, block time off, handle exceptions easily.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description:
      "Communicate with clients directly. Answer questions, send reminders, build relationships.",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description:
      "Track your revenue, appointment trends, and client satisfaction. Make data-driven decisions.",
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

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

function SocialProofBar() {
  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-4 px-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        <span className="font-semibold">4.8/5</span>
        <span className="text-muted-foreground text-sm">satisfaction</span>
      </div>
      <div className="hidden sm:block h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-cyan-500" />
        <span className="font-semibold">10,000+</span>
        <span className="text-muted-foreground text-sm">bookings</span>
      </div>
      <div className="hidden sm:block h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-teal-500" />
        <span className="font-semibold">2,500+</span>
        <span className="text-muted-foreground text-sm">providers</span>
      </div>
    </motion.div>
  );
}

function BentoCard({
  benefit,
  index,
}: {
  benefit: (typeof benefits)[0];
  index: number;
}) {
  const colorClasses = {
    cyan: "bg-cyan-100 text-cyan-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("group relative", benefit.highlight && "md:col-span-1")}
    >
      <Card
        className={cn(
          "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          benefit.highlight &&
            "border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white"
        )}
      >
        <CardContent className="p-6">
          <div
            className={cn(
              "inline-flex p-3 rounded-xl mb-4",
              colorClasses[benefit.color as keyof typeof colorClasses]
            )}
          >
            <benefit.icon className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {benefit.description}
          </p>

          {benefit.comparison && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">BookMe:</span>
                  <span className="ml-2 font-bold text-green-600">
                    {benefit.comparison.bookme}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Others:</span>
                  <span className="ml-2 font-medium text-red-500 line-through">
                    {benefit.comparison.others}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: { name: string; icon: any; count: number };
  index: number;
}) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`${ROUTES.SEARCH}?category=${encodeURIComponent(category.name)}`}
      >
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:border-cyan-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 text-cyan-600 group-hover:from-cyan-200 group-hover:to-teal-200 transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} providers
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function ProviderCard({
  provider,
  index,
}: {
  provider: (typeof featuredProviders)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-shrink-0 w-[340px]"
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar
              src={provider.avatar}
              firstName={provider.name.split(" ")[0]}
              lastName={provider.name.split(" ")[1]}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {provider.businessName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {provider.category} • {provider.location}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-sm">{provider.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({provider.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {provider.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground italic mb-4">
            "{provider.testimonial}"
          </p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link
                to={`${ROUTES.SEARCH}?q=${encodeURIComponent(
                  provider.businessName
                )}`}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Contact
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link
                to={`${ROUTES.SEARCH}?q=${encodeURIComponent(
                  provider.businessName
                )}`}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book Now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            "{testimonial.content}"
          </p>

          <div className="flex items-center gap-3">
            <Avatar
              src={testimonial.avatar}
              firstName={testimonial.name.split(" ")[0]}
              lastName={testimonial.name.split(" ")[1]}
              size="md"
            />
            <div>
              <p className="font-medium">
                {testimonial.name}, {testimonial.age}
              </p>
              <p className="text-sm text-muted-foreground">
                {testimonial.location} • {testimonial.role}
              </p>
              <p className="text-xs text-cyan-600">{testimonial.service}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-left hover:text-cyan-600 transition-colors"
      >
        <span className="font-medium pr-4">{faq.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-cyan-600"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Beauty & Wellness");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${ROUTES.SEARCH}?q=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <div className="flex flex-col">
      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-16 lg:py-24">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />

        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Free Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 text-sm mb-6">
                <Sparkles className="h-4 w-4 mr-1.5" />
                100% Free — No Hidden Fees
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Find & Book Your Next Appointment{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                in Under 60 Seconds
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Hair stylists, coaches, therapists, consultants...{" "}
              <strong className="text-foreground">50+ categories</strong> of
              verified professionals available near you.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-lg border">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, service, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 text-base">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick Category Pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                "Hair Salon",
                "Massage",
                "Personal Trainer",
                "Business Coach",
                "Psychologist",
              ].map((cat) => (
                <Link
                  key={cat}
                  to={`${ROUTES.SEARCH}?category=${encodeURIComponent(cat)}`}
                  className="px-4 py-2 bg-white/80 hover:bg-white rounded-full text-sm font-medium text-muted-foreground hover:text-cyan-600 transition-colors border hover:border-cyan-300"
                >
                  {cat}
                </Link>
              ))}
            </motion.div>

            {/* Social Proof Bar */}
            <SocialProofBar />
          </div>
        </div>
      </section>

      {/* ==========================================
          BENEFITS BENTO GRID
          ========================================== */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              Why BookMe?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Everything You Need to Book with Confidence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the features that matter most to make your booking
              experience seamless.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <BentoCard key={benefit.title} benefit={benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          CATEGORIES WITH TABS
          ========================================== */}
      <section className="py-20 bg-gradient-to-b from-white to-mint/30">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              50+ Categories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Find the Perfect Professional for Your Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From beauty to business, we've got you covered with verified
              professionals in every field.
            </p>
          </motion.div>

          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
              {Object.keys(categoryGroups).map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white px-4 py-2 rounded-full"
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categoryGroups).map(([group, categories]) => (
              <TabsContent key={group} value={group}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((category, index) => (
                    <CategoryCard
                      key={category.name}
                      category={category}
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to={ROUTES.SEARCH}>
                View All Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==========================================
          FEATURED PROVIDERS
          ========================================== */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
              Top Rated
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              This Month's Top-Rated Providers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover highly-rated professionals loved by our community.
            </p>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {featuredProviders.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={index}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <Link to={ROUTES.SEARCH}>
                Discover All Providers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==========================================
          PROVIDER CTA SECTION
          ========================================== */}
      <section className="py-20 bg-gradient-to-r from-charcoal to-charcoal-600 text-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-cyan-500 text-white mb-4">
                For Professionals
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Grow Your Business with BookMe
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join thousands of professionals who've simplified their
                scheduling and gained new clients — completely free.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                {providerBenefits.map((benefit) => (
                  <div key={benefit.title} className="text-center sm:text-left">
                    <div className="inline-flex p-3 rounded-xl bg-white/10 mb-3">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-white/70">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
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

              <Button
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  <Zap className="h-5 w-5 mr-2" />
                  Create My Free Profile
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar firstName="Sophie" lastName="Martin" size="lg" />
                    <div>
                      <p className="font-semibold">Sophie Martin</p>
                      <p className="text-sm text-white/70">
                        Esthetician • Paris
                      </p>
                    </div>
                  </div>
                  <p className="text-white/90 italic mb-4">
                    "I gained 15 new regular clients in just 2 months. The
                    platform is intuitive and being free means I keep 100% of my
                    earnings. Best decision for my business!"
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIALS
          ========================================== */}
      <section className="py-20 bg-mint/30">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Loved by Thousands
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what our community says about their BookMe experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/testimonials">
                Read More Stories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==========================================
          FAQ SECTION
          ========================================== */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">
                FAQ
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about BookMe.
              </p>
            </motion.div>

            <Card>
              <CardContent className="p-6">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    faq={faq}
                    isOpen={openFAQ === index}
                    onToggle={() =>
                      setOpenFAQ(openFAQ === index ? null : index)
                    }
                  />
                ))}
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Still have questions?
              </p>
              <Button variant="outline" asChild>
                <Link to="/help">
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FINAL CTA
          ========================================== */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-cyan-600 to-teal-500 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />

        <div className="container px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Your Next Appointment is Just a Click Away
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join <strong>10,000+</strong> users who've simplified their
              appointment booking with BookMe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-white/90 text-lg px-8"
                asChild
              >
                <Link to={ROUTES.SEARCH}>
                  <Search className="h-5 w-5 mr-2" />
                  Find a Provider
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
                asChild
              >
                <Link to={ROUTES.REGISTER}>
                  <Briefcase className="h-5 w-5 mr-2" />
                  I'm a Professional
                </Link>
              </Button>
            </div>

            {/* App Coming Soon */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-white/70 text-sm">Coming soon on mobile</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span className="text-sm">App Store</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  <span className="text-sm">Google Play</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
