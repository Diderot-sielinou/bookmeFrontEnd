/**
 * FAQPage Component
 *
 * Comprehensive FAQ page with:
 * - Search functionality
 * - Category filtering
 * - Accordion questions
 * - Contact CTA
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Users,
  Award,
  CreditCard,
  Shield,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  Mail,
  ArrowRight,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const faqCategories = {
  general: {
    label: 'General',
    icon: HelpCircle,
    faqs: [
      {
        question: 'What is BookMe?',
        answer:
          'BookMe is a free appointment booking platform that connects clients with service providers. Whether you need a haircut, coaching session, massage, or consultation, BookMe helps you find verified professionals and book instantly.',
      },
      {
        question: 'Is BookMe really free?',
        answer:
          'Yes! BookMe is 100% free for both clients and service providers. No subscription fees, no commission on bookings, no hidden charges. We believe quality appointment booking should be accessible to everyone.',
      },
      {
        question: 'How is BookMe different from Calendly or Doctolib?',
        answer:
          'Unlike Calendly (scheduling tool) or Doctolib (healthcare-focused), BookMe is a comprehensive marketplace connecting clients with providers across 50+ service categories. We offer built-in messaging, verified reviews, and a client discovery platform — all for free.',
      },
      {
        question: 'What types of services can I book on BookMe?',
        answer:
          'BookMe supports 50+ service categories including: beauty & wellness (hair salons, spas, massage), health (physiotherapy, psychology, nutrition), business (coaches, consultants), fitness (personal trainers, yoga), education (tutors, language teachers), and many more.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Absolutely. We use bank-level encryption (SSL/TLS) to protect all data transmissions. Your personal information is never shared with third parties without your consent. We\'re fully GDPR compliant and committed to your privacy.',
      },
    ],
  },
  clients: {
    label: 'For Clients',
    icon: Users,
    faqs: [
      {
        question: 'How do I find a service provider?',
        answer:
          'Use our search feature to find providers by service type, location, or name. You can filter results by rating, availability, and price range. Browse provider profiles to see their services, reviews, and portfolio before booking.',
      },
      {
        question: 'Can I message providers before booking?',
        answer:
          'Yes! Our built-in messaging system lets you chat directly with providers before booking. Ask questions about their services, discuss your specific needs, or clarify any details. This helps you make an informed decision.',
      },
      {
        question: 'How do I book an appointment?',
        answer:
          'Once you\'ve found a provider, select a service and choose an available time slot from their calendar. Confirm your booking and you\'ll receive instant confirmation via email and in-app notification.',
      },
      {
        question: 'Can I cancel or reschedule an appointment?',
        answer:
          'Yes, you can cancel or reschedule from your dashboard. We recommend doing so at least 24 hours in advance as a courtesy to the provider. Some providers may have their own cancellation policies visible on their profile.',
      },
      {
        question: 'How do appointment reminders work?',
        answer:
          'We automatically send you reminders 24 hours and 1 hour before your appointment via email and push notification (if enabled). You\'ll never miss a booking again!',
      },
      {
        question: 'How do I leave a review?',
        answer:
          'After completing an appointment, you\'ll receive a prompt to leave a review. Rate your experience on quality, punctuality, and cleanliness, then add your comments. Only verified clients who completed appointments can leave reviews.',
      },
    ],
  },
  providers: {
    label: 'For Providers',
    icon: Award,
    faqs: [
      {
        question: 'How do I become a provider on BookMe?',
        answer:
          'Sign up for free, select "I\'m a service provider," complete your profile with your business details, services, and availability. After a brief verification process, your profile goes live and clients can start booking.',
      },
      {
        question: 'Is there a commission on my bookings?',
        answer:
          'No! BookMe never takes a cut of your earnings. Clients pay you directly for your services. We don\'t process payments or charge transaction fees. You keep 100% of what you earn.',
      },
      {
        question: 'How do I manage my availability?',
        answer:
          'Use our intuitive calendar to set your working hours, recurring time slots, and exceptions (holidays, vacation). Block off personal time easily. Your real-time availability is shown to clients.',
      },
      {
        question: 'Can I offer multiple services?',
        answer:
          'Yes! Add unlimited services to your profile, each with its own name, description, duration, price, and optional image. Organize them by category to help clients find what they need.',
      },
      {
        question: 'How do the badges work?',
        answer:
          'Earn badges based on your performance: "Top Provider" (high ratings), "Quick Response" (fast message replies), "Reliable" (low cancellation rate), "Popular" (many bookings). Badges build trust with potential clients.',
      },
      {
        question: 'Can I respond to client reviews?',
        answer:
          'Yes! You can respond publicly to any review. This helps you address feedback, thank satisfied clients, and show potential clients that you care about their experience.',
      },
    ],
  },
  pricing: {
    label: 'Pricing & Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'How much does BookMe cost?',
        answer:
          'BookMe is completely free. No monthly fees, no setup costs, no commission on bookings. Free forever for both clients and service providers.',
      },
      {
        question: 'How do payments work?',
        answer:
          'BookMe doesn\'t process payments. Clients pay providers directly at the appointment (cash, card, mobile payment — however you arrange it). This keeps things simple and lets providers keep 100% of their earnings.',
      },
      {
        question: 'Will BookMe ever start charging?',
        answer:
          'Core features will always remain free. We may introduce optional premium add-ons in the future (advanced analytics, team features, integrations), but the essential booking functionality will never have a price tag.',
      },
      {
        question: 'Why don\'t you charge like other platforms?',
        answer:
          'We believe in removing barriers between clients and service providers. By keeping the platform free, we enable more connections and help small businesses grow without additional overhead.',
      },
    ],
  },
  account: {
    label: 'Account & Settings',
    icon: Settings,
    faqs: [
      {
        question: 'How do I update my profile?',
        answer:
          'Go to your dashboard and click "Profile" or "Settings." You can update your personal information, profile photo, bio, contact details, and notification preferences anytime.',
      },
      {
        question: 'How do I change my password?',
        answer:
          'Go to Settings > Security, enter your current password, then set your new password. If you forgot your password, use the "Forgot Password" link on the login page to reset it via email.',
      },
      {
        question: 'Can I delete my account?',
        answer:
          'Yes. Go to Settings > Account > Delete Account. This permanently removes your profile, booking history, and messages. If you\'re a provider, your reviews will also be removed. This action cannot be undone.',
      },
      {
        question: 'How do I manage notifications?',
        answer:
          'Go to Settings > Notifications to customize which alerts you receive. Choose between email notifications, push notifications, or both. Control reminders, messages, reviews, and marketing communications separately.',
      },
    ],
  },
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { question: string; answer: string };
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
            'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-cyan-600'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
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

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [openFAQs, setOpenFAQs] = useState<Record<string, number | null>>({
    general: 0,
    clients: null,
    providers: null,
    pricing: null,
    account: null,
  });

  // Filter FAQs by search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: Array<{
      category: string;
      categoryLabel: string;
      question: string;
      answer: string;
    }> = [];

    Object.entries(faqCategories).forEach(([categoryKey, category]) => {
      category.faqs.forEach((faq) => {
        if (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
        ) {
          results.push({
            category: categoryKey,
            categoryLabel: category.label,
            ...faq,
          });
        }
      });
    });

    return results;
  }, [searchQuery]);

  const toggleFAQ = (category: string, index: number) => {
    setOpenFAQs((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-16 lg:py-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />

        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-cyan-500 text-white mb-4">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help Center
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions about BookMe.
              Can't find what you're looking for? Contact our support team.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          {/* Search Results */}
          {filteredFAQs ? (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "
                  {searchQuery}"
                </p>
              </div>

              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try different keywords or browse categories below.
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">
                          {result.categoryLabel}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2">{result.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {result.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Browse All Categories
                </Button>
              </div>
            </div>
          ) : (
            /* Category Tabs */
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="max-w-4xl mx-auto"
            >
              <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
                {Object.entries(faqCategories).map(([key, category]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white px-4 py-2 rounded-full"
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(faqCategories).map(([key, category]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardContent className="p-6">
                      {category.faqs.map((faq, index) => (
                        <FAQItem
                          key={index}
                          faq={faq}
                          isOpen={openFAQs[key] === index}
                          onToggle={() => toggleFAQ(key, index)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              Popular Resources
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link to="/how-it-works">
              <Card className="h-full hover:shadow-md hover:border-cyan-300 transition-all">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">How It Works</p>
                    <p className="text-xs text-muted-foreground">Step-by-step guide</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/pricing">
              <Card className="h-full hover:shadow-md hover:border-cyan-300 transition-all">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pricing</p>
                    <p className="text-xs text-muted-foreground">It's free!</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/for-providers">
              <Card className="h-full hover:shadow-md hover:border-cyan-300 transition-all">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">For Providers</p>
                    <p className="text-xs text-muted-foreground">Grow your business</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contact">
              <Card className="h-full hover:shadow-md hover:border-cyan-300 transition-all">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Contact Us</p>
                    <p className="text-xs text-muted-foreground">Get in touch</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex p-4 rounded-full bg-cyan-100 text-cyan-600 mb-6">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help. Reach out and we'll get back to you
              within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@bookme.com">
                  support@bookme.com
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default FAQPage;