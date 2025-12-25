/**
 * ProfilePage (Prestataire)
 *
 * Page de visualisation et d'édition du profil public du prestataire.
 * Permet de voir comment les clients voient son profil.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Calendar,
  Clock,
  Edit,
  Eye,
  ExternalLink,
  Camera,
  CheckCircle,
  Award,
  MessageSquare,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

// Hooks
import {
  useMyPrestataireProfile,
  useMyServices,
} from "@/hooks/usePrestataires";
import { useReceivedReviews } from "@/hooks/useReviews";

// Types
import type { Prestataire, Service, Review, OpeningHours } from "@/types";

// ==========================================
// CONSTANTS
// ==========================================

const daysOfWeek: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

// ==========================================
// PROFILE COMPLETENESS COMPONENT
// ==========================================

interface ProfileCompletenessProps {
  profile: Prestataire;
}

function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  // Calculer la complétude du profil
  const checks = [
    { label: "Photo de profil", done: !!profile.avatar },
    { label: "Bio", done: !!profile.bio && profile.bio.length > 20 },
    { label: "Numéro de téléphone", done: !!profile.phone },
    { label: "Adresse", done: !!profile.address },
    { label: "Ville", done: !!profile.city },
    {
      label: "Catégories",
      done: profile.categories && profile.categories.length > 0,
    },
    { label: "Horaires d'ouverture", done: !!profile.openingHours },
    { label: "Site web", done: !!profile.website },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const completeness = Math.round((completedCount / checks.length) * 100);
  const missingItems = checks.filter((c) => !c.done).map((c) => c.label);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Complétion du profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {completeness}%
            </span>
            <Badge variant={completeness >= 80 ? "default" : "secondary"}>
              {completeness >= 80 ? "Bon" : "À améliorer"}
            </Badge>
          </div>
          <Progress value={completeness} className="h-2" />
          {missingItems.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Éléments manquants :</p>
              <ul className="list-disc list-inside space-y-0.5">
                {missingItems.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
                {missingItems.length > 3 && (
                  <li>+{missingItems.length - 3} autres</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// STATS CARD COMPONENT
// ==========================================

interface StatsCardsProps {
  profile: Prestataire;
  servicesCount: number;
}

function StatsCards({ profile, servicesCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Number(profile.averageRating ?? 0).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.totalReviews ?? 0}</p>
              <p className="text-sm text-muted-foreground">Avis clients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {profile.totalAppointments ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">RDV réalisés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{servicesCount}</p>
              <p className="text-sm text-muted-foreground">Services actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// WORKING HOURS COMPONENT
// ==========================================

interface WorkingHoursCardProps {
  openingHours: OpeningHours | null;
}

function WorkingHoursCard({ openingHours }: WorkingHoursCardProps) {
  const formatDayHours = (dayHours?: { start: string; end: string }[]) => {
    if (!dayHours || dayHours.length === 0) return "Fermé";
    return dayHours.map((h) => `${h.start} - ${h.end}`).join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires d'ouverture
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!openingHours ? (
          <p className="text-sm text-muted-foreground">
            Horaires non renseignés
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {Object.entries(daysOfWeek).map(([dayKey, dayName]) => {
              const hours = openingHours[dayKey as keyof OpeningHours];
              const displayHours = formatDayHours(hours);
              return (
                <div key={dayKey} className="flex justify-between">
                  <span className="text-muted-foreground">{dayName}</span>
                  <span
                    className={
                      displayHours !== "Fermé"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {displayHours}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// SERVICES LIST COMPONENT
// ==========================================

interface ServicesListProps {
  services: Service[];
  limit?: number;
}

function ServicesList({ services, limit }: ServicesListProps) {
  const displayServices = limit ? services.slice(0, limit) : services;

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="Aucun service"
        description="Vous n'avez pas encore ajouté de services"
        action={
          <Button asChild>
            <Link to={ROUTES.PRESTATAIRE_SERVICES}>Ajouter un service</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {displayServices.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
        >
          <div>
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-muted-foreground">
              {service.duration} min
            </p>
          </div>
          <span className="font-semibold text-primary">
            {formatPrice(service.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// REVIEWS LIST COMPONENT
// ==========================================

interface ReviewsListProps {
  reviews: Review[];
}

function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Aucun avis"
        description="Vous n'avez pas encore reçu d'avis"
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, 5).map((review) => (
        <div key={review.id} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              {review.client?.firstName} {review.client?.lastName?.charAt(0)}.
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-muted-foreground text-sm">{review.comment}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
          {review.prestataireResponse && (
            <div className="mt-3 p-2 bg-muted rounded text-sm">
              <p className="font-medium text-xs mb-1">Votre réponse :</p>
              <p className="text-muted-foreground">
                {review.prestataireResponse}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PrestataireProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ==========================================
  // HOOKS - Connexion au backend
  // ==========================================

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useMyPrestataireProfile();

  const { data: services = [], isLoading: isServicesLoading } = useMyServices();

  const { data: reviewsData, isLoading: isReviewsLoading } =
    useReceivedReviews();

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  if (isProfileLoading) {
    return <LoadingSpinner />;
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <EmptyState
          icon={User}
          title="Erreur de chargement"
          description="Impossible de charger votre profil. Veuillez réessayer."
          action={
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          }
        />
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const activeServices = services.filter((s) => s.isActive);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mon profil public</h1>
          <p className="text-muted-foreground">
            Gérez comment les clients voient votre profil
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/prestataire/${profile.id}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Voir en tant que client
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.PRESTATAIRE_SETTINGS}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier le profil
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards profile={profile} servicesCount={activeServices.length} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    src={profile.avatar || undefined}
                    firstName={profile.firstName}
                    lastName={profile.lastName}
                    className="h-24 w-24 mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    asChild
                  >
                    <Link to={ROUTES.PRESTATAIRE_SETTINGS}>
                      <Camera className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <h2 className="mt-4 text-xl font-semibold flex items-center justify-center gap-2">
                  {profile.businessName ||
                    `${profile.firstName} ${profile.lastName}`}
                  {profile.isVerified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </h2>

                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">
                    {Number(profile.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({profile.totalReviews ?? 0} avis)
                  </span>
                </div>

                {profile.categories && profile.categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {profile.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                {profile.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      {profile.address}
                      {profile.city && `, ${profile.city}`}
                      {profile.postalCode && ` ${profile.postalCode}`}
                    </span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{profile.user.email}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />

                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completeness */}
          <ProfileCompleteness profile={profile} />

          {/* Working Hours */}
          <WorkingHoursCard openingHours={profile.openingHours} />
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="services">
                Services ({activeServices.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">Avis ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.bio ? (
                    <p className="text-muted-foreground whitespace-pre-line">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Aucune description renseignée.{" "}
                      <Link
                        to={ROUTES.PRESTATAIRE_SETTINGS}
                        className="text-primary hover:underline"
                      >
                        Ajouter une bio
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services populaires</CardTitle>
                  <CardDescription>
                    {activeServices.length > 0
                      ? "Vos 3 services les plus demandés"
                      : "Ajoutez des services pour commencer"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isServicesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ServicesList services={activeServices} limit={3} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tous les services</CardTitle>
                    <CardDescription>
                      {activeServices.length} services actifs
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.PRESTATAIRE_SERVICES}>
                      <Edit className="h-4 w-4 mr-2" />
                      Gérer
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isServicesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ServicesList services={activeServices} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Avis récents</CardTitle>
                    <CardDescription>
                      Les derniers avis de vos clients
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.PRESTATAIRE_REVIEWS}>
                      Voir tous les avis
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isReviewsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ReviewsList reviews={reviews} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Alerte statut */}
      {profile.status === "PENDING" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 flex items-start gap-4">
            <Clock className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Compte en attente de validation
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Votre profil est en cours de vérification par notre équipe. Vous
                recevrez un email dès que votre compte sera activé.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.status === "SUSPENDED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-start gap-4">
            <Clock className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Compte suspendu</h3>
              <p className="text-sm text-red-700 mt-1">
                Votre compte a été suspendu. Veuillez contacter le support pour
                plus d'informations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
