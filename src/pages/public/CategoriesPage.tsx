/**
 * CategoriesPage Component
 *
 * SEO-friendly categories directory:
 * - All service categories
 * - Provider counts
 * - Search functionality
 * - Category groups
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Scissors,
  Heart,
  Briefcase,
  Dumbbell,
  GraduationCap,
  Stethoscope,
  Camera,
  Palette,
  Music,
  Home,
  Car,
  Sparkles,
  Users,
  ChevronRight,
  Star,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button, Card, CardContent, Badge, Input } from '@/components/ui';

// ==========================================
// STATIC DATA
// ==========================================

const categoryGroups = [
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    icon: Sparkles,
    color: 'pink',
    categories: [
      { name: 'Hair Salon', count: 234, popular: true },
      { name: 'Nail Salon', count: 189 },
      { name: 'Massage Therapy', count: 156, popular: true },
      { name: 'Spa & Beauty', count: 143 },
      { name: 'Makeup Artist', count: 98 },
      { name: 'Esthetician', count: 112 },
      { name: 'Barber', count: 87 },
      { name: 'Waxing', count: 65 },
      { name: 'Lash Extensions', count: 54 },
      { name: 'Tanning', count: 32 },
    ],
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: Stethoscope,
    color: 'red',
    categories: [
      { name: 'Physiotherapy', count: 98, popular: true },
      { name: 'Osteopath', count: 76 },
      { name: 'Psychologist', count: 112, popular: true },
      { name: 'Nutritionist', count: 67 },
      { name: 'Chiropractor', count: 54 },
      { name: 'Acupuncture', count: 43 },
      { name: 'Naturopath', count: 38 },
      { name: 'Speech Therapist', count: 29 },
    ],
  },
  {
    id: 'business',
    name: 'Business & Professional',
    icon: Briefcase,
    color: 'blue',
    categories: [
      { name: 'Business Coach', count: 89, popular: true },
      { name: 'Life Coach', count: 134, popular: true },
      { name: 'Career Consultant', count: 67 },
      { name: 'Financial Advisor', count: 56 },
      { name: 'Accountant', count: 78 },
      { name: 'Lawyer', count: 45 },
      { name: 'Marketing Consultant', count: 89 },
      { name: 'HR Consultant', count: 34 },
    ],
  },
  {
    id: 'fitness',
    name: 'Sports & Fitness',
    icon: Dumbbell,
    color: 'green',
    categories: [
      { name: 'Personal Trainer', count: 167, popular: true },
      { name: 'Yoga Instructor', count: 98, popular: true },
      { name: 'Pilates Instructor', count: 76 },
      { name: 'Sports Coach', count: 54 },
      { name: 'Swimming Coach', count: 43 },
      { name: 'Tennis Coach', count: 38 },
      { name: 'Martial Arts', count: 45 },
      { name: 'Dance Instructor', count: 67 },
    ],
  },
  {
    id: 'education',
    name: 'Education & Tutoring',
    icon: GraduationCap,
    color: 'purple',
    categories: [
      { name: 'Private Tutor', count: 213, popular: true },
      { name: 'Language Teacher', count: 156, popular: true },
      { name: 'Music Teacher', count: 89 },
      { name: 'Art Teacher', count: 67 },
      { name: 'Math Tutor', count: 134 },
      { name: 'Science Tutor', count: 98 },
      { name: 'Test Prep', count: 54 },
      { name: 'College Counselor', count: 32 },
    ],
  },
  {
    id: 'creative',
    name: 'Creative & Media',
    icon: Palette,
    color: 'orange',
    categories: [
      { name: 'Photographer', count: 123, popular: true },
      { name: 'Videographer', count: 87 },
      { name: 'Graphic Designer', count: 98 },
      { name: 'Web Designer', count: 76 },
      { name: 'Interior Designer', count: 54 },
      { name: 'Music Producer', count: 43 },
      { name: 'Voice Coach', count: 38 },
      { name: 'Acting Coach', count: 29 },
    ],
  },
  {
    id: 'home',
    name: 'Home Services',
    icon: Home,
    color: 'amber',
    categories: [
      { name: 'House Cleaner', count: 189 },
      { name: 'Handyman', count: 134 },
      { name: 'Plumber', count: 98 },
      { name: 'Electrician', count: 87 },
      { name: 'Landscaper', count: 76 },
      { name: 'Painter', count: 65 },
      { name: 'Mover', count: 54 },
      { name: 'Pest Control', count: 32 },
    ],
  },
  {
    id: 'pets',
    name: 'Pet Services',
    icon: Heart,
    color: 'teal',
    categories: [
      { name: 'Pet Groomer', count: 98 },
      { name: 'Dog Trainer', count: 76 },
      { name: 'Pet Sitter', count: 134 },
      { name: 'Dog Walker', count: 112 },
      { name: 'Veterinarian', count: 54 },
      { name: 'Pet Photography', count: 32 },
    ],
  },
];

const colorClasses = {
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Filter categories based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return selectedGroup
        ? categoryGroups.filter((g) => g.id === selectedGroup)
        : categoryGroups;
    }

    const query = searchQuery.toLowerCase();
    return categoryGroups
      .map((group) => ({
        ...group,
        categories: group.categories.filter((cat) =>
          cat.name.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.categories.length > 0);
  }, [searchQuery, selectedGroup]);

  // Get total counts
  const totalProviders = categoryGroups.reduce(
    (sum, group) => sum + group.categories.reduce((s, c) => s + c.count, 0),
    0
  );
  const totalCategories = categoryGroups.reduce(
    (sum, group) => sum + group.categories.length,
    0
  );

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
          >
            <Badge className="bg-cyan-500 text-white mb-4">
              <Users className="h-4 w-4 mr-1" />
              {totalProviders.toLocaleString()}+ Providers
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6">
              Browse All Categories
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore {totalCategories}+ service categories and find the perfect
              professional for your needs.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Filter */}
      <section className="py-6 bg-white border-b sticky top-16 z-20">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedGroup === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroup(null)}
            >
              All Categories
            </Button>
            {categoryGroups.map((group) => {
              const colors = colorClasses[group.color as keyof typeof colorClasses];
              return (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroup(group.id)}
                  className={cn(
                    selectedGroup !== group.id && `hover:${colors.bg}`
                  )}
                >
                  <group.icon className="h-4 w-4 mr-1" />
                  {group.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                Try a different search term or browse all categories.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredGroups.map((group, groupIndex) => {
                const colors = colorClasses[group.color as keyof typeof colorClasses];
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn('p-3 rounded-xl', colors.bg, colors.text)}>
                        <group.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-charcoal">
                          {group.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {group.categories.length} categories •{' '}
                          {group.categories.reduce((s, c) => s + c.count, 0)} providers
                        </p>
                      </div>
                    </div>

                    {/* Category Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {group.categories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Link
                            to={`${ROUTES.SEARCH}?category=${encodeURIComponent(category.name)}`}
                          >
                            <Card className={cn(
                              'h-full hover:shadow-md transition-all group',
                              `hover:${colors.border}`
                            )}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium truncate group-hover:text-cyan-600 transition-colors">
                                        {category.name}
                                      </h3>
                                      {category.popular && (
                                        <Badge variant="secondary" className="text-xs shrink-0">
                                          <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {category.count} providers
                                    </p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-cyan-500 transition-colors shrink-0" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our search to find providers by name, service, or location.
              Our marketplace is growing every day!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to={ROUTES.SEARCH}>
                  <Search className="h-5 w-5 mr-2" />
                  Search Providers
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">
                  Suggest a Category
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default CategoriesPage;