/**
 * PrestataireProfilePage Component - ENHANCED
 * 
 * Public profile page for service providers.
 * Features:
 * - Provider information and bio
 * - Portfolio gallery with lightbox
 * - Services list with images
 * - Reviews display
 * - Contact information
 * - Rating summary
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Calendar,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle,
  Award,
  Loader2,
  Image as ImageIcon,
  X,
  ZoomIn,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/shared';
import { RatingStars } from '@/components/shared/RatingStars';

// ==========================================
// PORTFOLIO GALLERY COMPONENT
// ==========================================

interface PortfolioGalleryProps {
  images: string[];
  businessName: string;
}

function PortfolioGallery({ images, businessName }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No Portfolio Images"
        description="This provider hasn't added portfolio images yet"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-cyan-500 transition-all"
          >
            <img
              src={image}
              alt={`${businessName} portfolio ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Image Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{businessName} - Portfolio</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black">
            {selectedImage && (
              <img
                src={selectedImage}
                alt={`${businessName} portfolio`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Image {images.indexOf(selectedImage || '') + 1} of {images.length}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ==========================================
// SERVICE CARD - WITH IMAGE
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
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Service Image */}
          {service.image ? (
            <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="hidden sm:flex w-48 h-auto shrink-0 bg-gradient-to-br from-cyan-50 to-teal-50 items-center justify-center">
              <ImageIcon className="h-12 w-12 text-cyan-200" />
            </div>
          )}

          {/* Service Info */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{service.name}</h3>
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
                  Book
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
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
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <RatingStars value={review.rating} size="sm" className="mt-1" />
            <p className="text-muted-foreground mt-2">{review.comment}</p>
            
            {review.prestataireResponse && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-1">Response:</p>
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
// MAIN COMPONENT
// ==========================================

export function PrestataireProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch data
  const { data: prestataire, isLoading, error } = usePrestataire(id!);
  const { data: servicesData } = usePrestataireServices(id!);
  const { data: reviewsResponse } = usePrestataireReviews(id!);

  const services: Service[] = servicesData || [];
  const reviews = reviewsResponse?.data || [];
  const portfolioImages = prestataire?.portfolioImages || [];

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    navigate(`/book/${id}?serviceId=${service.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !prestataire) {
    return (
      <div className="container py-12">
        <ErrorState
          message="Unable to load this profile"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const name = prestataire.businessName;
  const avgRating = Number(prestataire.averageRating) || 0;
  const reviewCount = prestataire.totalReviews || reviews.length;

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
                
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">{name}</h1>
                      <p className="text-muted-foreground">
                        {prestataire.firstName} {prestataire.lastName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" aria-label="Share profile">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" aria-label="Save to favorites">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mt-3">
                    <RatingStars value={avgRating} showValue />
                    <span className="text-sm text-muted-foreground">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                    {prestataire.isVerified && (
                      <Badge variant="default" className="bg-green-500 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
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
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {prestataire.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tabs: Services, Portfolio & Reviews */}
          <Tabs defaultValue="services">
            <TabsList>
              <TabsTrigger value="services">
                Services ({services.filter(s => s.isActive).length})
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                Portfolio ({portfolioImages.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviewCount})
              </TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-6 space-y-4">
              {services.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Services"
                  description="This provider hasn't added any services yet"
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

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Portfolio Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PortfolioGallery
                    images={portfolioImages}
                    businessName={name}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No Reviews Yet"
                  description="This provider hasn't received any reviews"
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
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.filter(s => s.isActive).length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Starting from{' '}
                    <span className="font-semibold text-foreground">
                      {formatPrice(Math.min(...services.filter(s => s.isActive).map((s) => s.price)))}
                    </span>
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/book/${id}`)}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Choose Time Slot
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No services available at the moment
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
                    className="text-sm hover:text-cyan-600 transition-colors"
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

          {/* Portfolio Preview */}
          {portfolioImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Portfolio
                  </span>
                  <Badge variant="secondary">{portfolioImages.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {portfolioImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {portfolioImages.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{portfolioImages.length - 4} more images
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rating summary */}
          {reviewCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-cyan-600">
                      {avgRating.toFixed(1)}
                    </p>
                    <RatingStars value={avgRating} size="sm" className="mt-1" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
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