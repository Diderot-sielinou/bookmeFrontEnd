/**
 * ReviewsPage (Prestataire)
 *
 * Page de gestion des avis pour les prestataires.
 * Permet de voir les avis reçus et d'y répondre.
 * ALIGNÉ AVEC LE BACKEND
 */

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Star,
  Search,
  Reply,
  Flag,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showSuccess, showError } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";

// ✅ Hooks alignés avec le backend
import { useReviewsManagement, useFlagReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { getReviewStats } from "@/services/reviews.service";
import { useQuery } from "@tanstack/react-query";
import type { Review } from "@/types";

// ==========================================
// STATS COMPONENT
// ==========================================

// ==========================================
// STATS COMPONENT - CORRIGÉ
// ==========================================

function ReviewStats({ prestataireId }: { prestataireId: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reviews', 'stats', prestataireId],
    queryFn: () => getReviewStats(prestataireId),
    enabled: !!prestataireId,
  });

  if (isLoading || !stats) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // ✅ Gérer les deux formats possibles de distribution
  const getDistributionCount = (rating: number): number => {
    if (Array.isArray(stats.distribution)) {
      // Format tableau: [{ rating: 5, count: 10, percentage: 50 }, ...]
      const item = stats.distribution.find((d: { rating: number; count: number }) => d.rating === rating);
      return item?.count || 0;
    } else if (stats.distribution && typeof stats.distribution === 'object') {
      // Format objet: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
      return (stats.distribution as Record<number, number>)[rating] || 0;
    }
    return 0;
  };

  const getDistributionPercentage = (rating: number): number => {
    if (Array.isArray(stats.distribution)) {
      const item = stats.distribution.find((d: { rating: number; percentage: number }) => d.rating === rating);
      return item?.percentage || 0;
    } else if (stats.distribution && typeof stats.distribution === 'object') {
      const count = (stats.distribution as Record<number, number>)[rating] || 0;
      return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    }
    return 0;
  };

  // Calculer le trend
  const positiveCount = getDistributionCount(5) + getDistributionCount(4);
  const positiveRate = stats.totalReviews > 0 ? (positiveCount / stats.totalReviews) * 100 : 0;
  const trend = positiveRate >= 70 ? 'up' : positiveRate >= 50 ? 'stable' : 'down';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des avis</CardTitle>
        <CardDescription>Vue d'ensemble de vos évaluations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Note moyenne */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold">
                {(stats.averageRating || 0).toFixed(1)}
              </span>
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-muted-foreground mt-1">sur {stats.totalReviews || 0} avis</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {trend === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">En hausse</span>
                </>
              )}
              {trend === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">En baisse</span>
                </>
              )}
              {trend === 'stable' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Stable</span>
                </>
              )}
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = getDistributionCount(rating);
              const percentage = getDistributionPercentage(rating);
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-3 text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="w-10 text-sm text-muted-foreground text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Sous-critères */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Détails</h4>
            {stats.averageQuality !== null && stats.averageQuality !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qualité</span>
                <span className="font-medium">{stats.averageQuality.toFixed(1)}/5</span>
              </div>
            )}
            {stats.averagePunctuality !== null && stats.averagePunctuality !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ponctualité</span>
                <span className="font-medium">{stats.averagePunctuality.toFixed(1)}/5</span>
              </div>
            )}
            {stats.averageCleanliness !== null && stats.averageCleanliness !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Propreté</span>
                <span className="font-medium">{stats.averageCleanliness.toFixed(1)}/5</span>
              </div>
            )}
            {!stats.averageQuality && !stats.averagePunctuality && !stats.averageCleanliness && (
              <p className="text-sm text-muted-foreground">Pas encore de détails</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// REVIEW CARD COMPONENT
// ==========================================

interface ReviewCardProps {
  review: Review;
  onReply: (review: Review) => void;
  onReport: (review: Review) => void;
}

function ReviewCard({ review, onReply, onReport }: ReviewCardProps) {
  const client = review.client;
  const clientName = client
    ? `${client.firstName} ${client.lastName}`
    : "Client";
  const clientInitials = client
    ? `${client.firstName[0]}${client.lastName[0]}`
    : "CL";

  const serviceName = review.appointment?.service?.name || "Service";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
           src={client?.avatar || undefined}
            firstName={client?.firstName}
            lastName={client?.lastName}
            className="h-12 w-12"
          />
          {/* <Avatar>
            <AvatarImage src={client?.avatar || undefined} />
            <AvatarFallback>{clientInitials}</AvatarFallback>
          </Avatar> */}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{clientName}</h3>
                  <Badge variant="secondary">{serviceName}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
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
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!review.prestataireResponse && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReply(review)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Répondre
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReport(review)}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-3 text-muted-foreground">{review.comment}</p>

            {/* Sous-notes */}
            {(review.qualityRating ||
              review.punctualityRating ||
              review.cleanlinessRating) && (
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {review.qualityRating && (
                  <span>Qualité: {review.qualityRating}/5</span>
                )}
                {review.punctualityRating && (
                  <span>Ponctualité: {review.punctualityRating}/5</span>
                )}
                {review.cleanlinessRating && (
                  <span>Propreté: {review.cleanlinessRating}/5</span>
                )}
              </div>
            )}

            {/* Réponse du prestataire */}
            {review.prestataireResponse && (
              <div className="mt-4 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    Votre réponse
                  </Badge>
                  {review.responseAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.responseAt), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  )}
                </div>
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

export default function ReviewsPage() {
  const { profile } = useAuth();
  const prestataireId = profile?.id;

  // ✅ Hook aligné avec le backend
  const { reviews, isLoading, respond, isResponding, refetch } =
    useReviewsManagement();
  const flagMutation = useFlagReview();

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [responseFilter, setResponseFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Filtrer les avis
  const filteredReviews = reviews.filter((review) => {
    const client = review.client;
    const clientName = client
      ? `${client.firstName} ${client.lastName}`.toLowerCase()
      : "";
    const comment = (review.comment || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    if (query && !clientName.includes(query) && !comment.includes(query)) {
      return false;
    }

    if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }

    if (responseFilter === "responded" && !review.prestataireResponse)
      return false;
    if (responseFilter === "pending" && review.prestataireResponse)
      return false;

    if (activeTab === "positive" && review.rating < 4) return false;
    if (activeTab === "negative" && review.rating >= 4) return false;

    return true;
  });

  const pendingResponseCount = reviews.filter(
    (r) => !r.prestataireResponse
  ).length;

  // Handlers
  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText("");
    setReplyDialogOpen(true);
  };

  const handleReport = (review: Review) => {
    setSelectedReview(review);
    setReportReason("");
    setReportDialogOpen(true);
  };

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      await respond({ id: selectedReview.id, data: { response: replyText } });
      setReplyDialogOpen(false);
      setReplyText("");
      setSelectedReview(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const submitReport = async () => {
    if (!selectedReview || !reportReason.trim()) return;

    try {
      await flagMutation.mutateAsync({
        id: selectedReview.id,
        reason: reportReason,
      });
      setReportDialogOpen(false);
      setReportReason("");
      setSelectedReview(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avis clients</h1>
          <p className="text-muted-foreground">
            {pendingResponseCount > 0
              ? `${pendingResponseCount} avis en attente de réponse`
              : "Tous les avis ont une réponse"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      {prestataireId && <ReviewStats prestataireId={prestataireId} />}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les avis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les notes</SelectItem>
                <SelectItem value="5">5 étoiles</SelectItem>
                <SelectItem value="4">4 étoiles</SelectItem>
                <SelectItem value="3">3 étoiles</SelectItem>
                <SelectItem value="2">2 étoiles</SelectItem>
                <SelectItem value="1">1 étoile</SelectItem>
              </SelectContent>
            </Select>

            <Select value={responseFilter} onValueChange={setResponseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Réponse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente de réponse</SelectItem>
                <SelectItem value="responded">Avec réponse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({reviews.length})</TabsTrigger>
          <TabsTrigger value="positive" className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            Positifs ({reviews.filter((r) => r.rating >= 4).length})
          </TabsTrigger>
          <TabsTrigger value="negative">
            À améliorer ({reviews.filter((r) => r.rating < 4).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Aucun avis"
              description="Aucun avis ne correspond à vos critères de recherche."
            />
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReply={handleReply}
                  onReport={handleReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à l'avis</DialogTitle>
            <DialogDescription>
              Votre réponse sera visible publiquement sous l'avis du client.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">
                  {selectedReview.client?.firstName}{" "}
                  {selectedReview.client?.lastName}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < selectedReview.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">{selectedReview.comment}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reply">Votre réponse</Label>
            <Textarea
              id="reply"
              placeholder="Remerciez le client pour son avis..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              5 à 500 caractères ({replyText.length}/500)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={submitReply}
              disabled={
                replyText.trim().length < 5 ||
                replyText.length > 500 ||
                isResponding
              }
            >
              {isResponding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                "Publier la réponse"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler l'avis</DialogTitle>
            <DialogDescription>
              Expliquez pourquoi cet avis devrait être examiné par notre équipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Raison du signalement</Label>
            <Textarea
              id="reason"
              placeholder="Décrivez le problème..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={submitReport}
              disabled={!reportReason.trim() || flagMutation.isPending}
              variant="destructive"
            >
              {flagMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Signaler"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
