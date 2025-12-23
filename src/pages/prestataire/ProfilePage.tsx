/**
 * ProfilePage (Prestataire)
 *
 * Page de visualisation et d'édition du profil public du prestataire.
 * Permet de voir comment les clients voient son profil.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

// ==========================================
// MOCK DATA (à remplacer par API)
// ==========================================

const mockProfile = {
  id: "1",
  user: {
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie.dupont@email.com",
    avatar: null,
  },
  bio: "Coiffeuse passionnée avec plus de 10 ans d'expérience. Spécialisée dans les coupes modernes, la coloration et les soins capillaires. Je m'engage à offrir une expérience personnalisée à chaque client.",
  phone: "06 12 34 56 78",
  address: "123 rue de Paris, 75001 Paris",
  website: "https://marie-coiffure.fr",
  rating: 4.8,
  reviewCount: 127,
  completedAppointments: 450,
  memberSince: "2022-03-15",
  isVerified: true,
  categories: ["Coiffure", "Soins"],
  services: [
    { id: "1", name: "Coupe femme", duration: 45, price: 35 },
    { id: "2", name: "Coupe homme", duration: 30, price: 25 },
    { id: "3", name: "Coloration", duration: 90, price: 65 },
    { id: "4", name: "Brushing", duration: 30, price: 25 },
    { id: "5", name: "Soin profond", duration: 45, price: 40 },
  ],
  workingHours: {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "20:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "10:00", close: "16:00" },
    sunday: null,
  },
  recentReviews: [
    {
      id: "1",
      clientName: "Sophie L.",
      rating: 5,
      comment: "Excellente coupe, très satisfaite !",
      date: "2024-01-15",
    },
    {
      id: "2",
      clientName: "Pierre M.",
      rating: 4,
      comment: "Bon service, je recommande.",
      date: "2024-01-10",
    },
    {
      id: "3",
      clientName: "Julie D.",
      rating: 5,
      comment: "Marie est formidable, toujours à l'écoute.",
      date: "2024-01-05",
    },
  ],
};

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

function ProfileCompleteness() {
  const completeness = 85;
  const missingItems = ["Photo de profil", "Site web"];

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
                {missingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
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

function StatsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockProfile.rating}</p>
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
              <p className="text-2xl font-bold">{mockProfile.reviewCount}</p>
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
                {mockProfile.completedAppointments}
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
              <p className="text-2xl font-bold">
                {mockProfile.services.length}
              </p>
              <p className="text-sm text-muted-foreground">Services actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Need to import MessageSquare
import { MessageSquare } from "lucide-react";

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  const profile = mockProfile;
  const initials = `${profile.user.firstName[0]}${profile.user.lastName[0]}`;

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
      <StatsCards />

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
                    src={profile.user.avatar || undefined}
                    firstName={profile.user.firstName}
                    lastName={profile.user.lastName}
                    className="h-24 w-24 mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h2 className="mt-4 text-xl font-semibold flex items-center justify-center gap-2">
                  {profile.user.firstName} {profile.user.lastName}
                  {profile.isVerified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </h2>

                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{profile.rating}</span>
                  <span className="text-muted-foreground">
                    ({profile.reviewCount} avis)
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {profile.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.user.email}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completeness */}
          <ProfileCompleteness />

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {Object.entries(profile.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {daysOfWeek[day]}
                    </span>
                    <span
                      className={
                        hours ? "font-medium" : "text-muted-foreground"
                      }
                    >
                      {hours ? `${hours.open} - ${hours.close}` : "Fermé"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="reviews">Avis récents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </CardContent>
              </Card>

              {/* Quick Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services populaires</CardTitle>
                  <CardDescription>
                    Vos 3 services les plus demandés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.services.slice(0, 3).map((service) => (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tous les services</CardTitle>
                    <CardDescription>
                      {profile.services.length} services actifs
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
                  <div className="space-y-3">
                    {profile.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration} min</span>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-primary">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {profile.recentReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {review.clientName}
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
                        <p className="text-muted-foreground text-sm">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
