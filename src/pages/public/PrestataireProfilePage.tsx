/**
 * Page Profil Prestataire Public
 * 
 * Affiche le profil public d'un prestataire avec :
 * - Informations et bio
 * - Services proposés
 * - Avis clients
 * - Bouton de réservation
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Euro,
  Star,
  Calendar,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle,
  Award,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice, formatDuration } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { usePrestataire, usePrestataireServices, usePrestataireReviews } from '@/hooks/usePrestataires';
import type { Service, Review } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/shared';
import { RatingStars, RatingBadge } from '@/components/shared/RatingStars';

// ==========================================
// SERVICE CARD
// ==========================================

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
      onClick={() => onSelect(service)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDuration(service.duration)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-cyan-600">
              {formatPrice(service.price)}
            </p>
            <Button size="sm" className="mt-2">
              Réserver
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// REVIEW CARD
// ==========================================

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const client = review.client;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={client?.avatar}
            firstName={client?.firstName}
            lastName={client?.lastName}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {client?.firstName} {client?.lastName?.charAt(0)}.
              </p>
              <span className="text-sm text-muted-foreground">
                {format(new Date(review.createdAt), 'd MMM yyyy', { locale: fr })}
              </span>
            </div>
            <RatingStars value={review.rating} size="sm" className="mt-1" />
            <p className="text-muted-foreground mt-2">{review.comment}</p>
            
            {review.prestataireResponse && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-1">Réponse :</p>
                <p className="text-sm text-muted-foreground">
                  {review.prestataireResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function PrestataireProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: prestataire, isLoading, error } = usePrestataire(id!);
  const { data: servicesData } = usePrestataireServices(id!);
  const { data: reviewsResponse } = usePrestataireReviews(id!);

  const services: Service[] = servicesData || [];
  const reviews = reviewsResponse?.data || [];

  // Handle service selection -> go to booking page
  const handleServiceSelect = (service: Service) => {
    navigate(`/book/${id}?serviceId=${service.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !prestataire) {
    return (
      <div className="container py-12">
        <ErrorState
          message="Impossible de charger ce profil"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const name = prestataire.businessName;
const avgRating = Number(prestataire.averageRating) || 0;
  const reviewCount = prestataire.reviewCount || reviews.length;

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar
                  src={prestataire.avatar}
                  firstName={prestataire.firstName}
                  lastName={prestataire.lastName}
                  size="2xl"
                  className="shrink-0"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">{name}</h1>
                      <p className="text-muted-foreground">
                        {prestataire.firstName} {prestataire.lastName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mt-3">
                    <RatingStars value={avgRating} showValue />
                    <span className="text-sm text-muted-foreground">
                      ({reviewCount} avis)
                    </span>
                    {prestataire.isVerified && (
                      <Badge variant="default" className="bg-green-500 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Vérifié
                      </Badge>
                    )}
                  </div>

                  {/* Categories */}
                  {prestataire.categories && prestataire.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prestataire.categories.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Badges */}
                  {prestataire.badges && prestataire.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {prestataire.badges.map((badge) => (
                        <Badge key={badge.id} variant="outline" className="gap-1">
                          <Award className="h-3 w-3" />
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {prestataire.bio && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-2">À propos</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {prestataire.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tabs: Services & Reviews */}
          <Tabs defaultValue="services">
            <TabsList>
              <TabsTrigger value="services">
                Services ({services.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Avis ({reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6 space-y-4">
              {services.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Aucun service"
                  description="Ce prestataire n'a pas encore ajouté de services"
                />
              ) : (
                services
                  .filter((s) => s.isActive)
                  .map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={handleServiceSelect}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="Aucun avis"
                  description="Ce prestataire n'a pas encore reçu d'avis"
                />
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick booking CTA */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Réserver un rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    À partir de{' '}
                    <span className="font-semibold text-foreground">
                      {formatPrice(Math.min(...services.map((s) => s.price)))}
                    </span>
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/book/${id}`)}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Choisir un créneau
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun service disponible pour le moment
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prestataire.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p>{prestataire.address}</p>
                    {prestataire.city && (
                      <p>
                        {prestataire.postalCode} {prestataire.city}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {prestataire.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`tel:${prestataire.phone}`}
                    className="text-sm hover:text-cyan-600"
                  >
                    {prestataire.phone}
                  </a>
                </div>
              )}

              {prestataire.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={prestataire.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-600 hover:underline truncate"
                  >
                    {prestataire.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating summary */}
          {reviewCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Note globale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-cyan-600">
                      {avgRating.toFixed(1)}
                    </p>
                    <RatingStars value={avgRating} size="sm" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Basé sur {reviewCount} avis
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrestataireProfilePage;
