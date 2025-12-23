/**
 * ReviewsPage (Prestataire)
 * 
 * Page de gestion des avis pour les prestataires.
 * Permet de voir les avis reçus et d'y répondre.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ==========================================
// LOCAL TYPES
// ==========================================

interface LocalReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  serviceName: string;
  response?: string;
  responseDate?: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const mockReviews: LocalReview[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellente expérience ! Marie est très professionnelle et à l\'écoute. Ma coupe est exactement ce que je voulais. Je recommande vivement !',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: '1', firstName: 'Sophie', lastName: 'Martin' },
    serviceName: 'Coupe femme',
    response: 'Merci beaucoup Sophie ! C\'était un plaisir de vous recevoir. À très bientôt !',
    responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    rating: 4,
    comment: 'Bon service, coiffure réussie. Un peu d\'attente mais rien de grave.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: '2', firstName: 'Pierre', lastName: 'Durand' },
    serviceName: 'Coupe homme',
  },
  {
    id: '3',
    rating: 5,
    comment: 'Parfait comme toujours ! Marie est ma coiffeuse attitrée depuis 2 ans.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: '3', firstName: 'Julie', lastName: 'Petit' },
    serviceName: 'Coloration',
    response: 'Merci Julie pour ta fidélité ! C\'est toujours un plaisir 💇‍♀️',
    responseDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    rating: 3,
    comment: 'Correct mais pas exceptionnel. Le résultat est bon mais l\'accueil pourrait être plus chaleureux.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: '4', firstName: 'Marc', lastName: 'Bernard' },
    serviceName: 'Brushing',
  },
  {
    id: '5',
    rating: 5,
    comment: 'Super coloration, exactement la teinte que je voulais !',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: '5', firstName: 'Emma', lastName: 'Leroy' },
    serviceName: 'Coloration',
  },
];

const mockStats = {
  averageRating: 4.4,
  totalReviews: 127,
  ratingDistribution: { 5: 85, 4: 25, 3: 10, 2: 5, 1: 2 },
  responseRate: 68,
  trend: 'up' as 'up' | 'down' | 'stable',
};

// ==========================================
// STATS COMPONENT
// ==========================================

function ReviewStats() {
  const stats = mockStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des avis</CardTitle>
        <CardDescription>Vue d'ensemble de vos évaluations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold">{stats.averageRating}</span>
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-muted-foreground mt-1">sur {stats.totalReviews} avis</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {stats.trend === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">En hausse</span>
                </>
              )}
              {stats.trend === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">En baisse</span>
                </>
              )}
              {stats.trend === 'stable' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Stable</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = (count / stats.totalReviews) * 100;
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

          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  strokeDasharray={`${stats.responseRate * 2.51} 251`}
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <span className="absolute text-xl font-bold">{stats.responseRate}%</span>
            </div>
            <p className="text-muted-foreground mt-2">Taux de réponse</p>
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
  review: LocalReview;
  onReply: (review: LocalReview) => void;
  onReport: (review: LocalReview) => void;
}

function ReviewCard({ review, onReply, onReport }: ReviewCardProps) {
  const clientName = `${review.client.firstName} ${review.client.lastName}`;
  const clientInitials = `${review.client.firstName[0]}${review.client.lastName[0]}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>{clientInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{clientName}</h3>
                  <Badge variant="secondary">{review.serviceName}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!review.response && (
                  <Button variant="outline" size="sm" onClick={() => onReply(review)}>
                    <Reply className="h-4 w-4 mr-1" />
                    Répondre
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onReport(review)}>
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-3 text-muted-foreground">{review.comment}</p>

            {review.response && (
              <div className="mt-4 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">Votre réponse</Badge>
                  {review.responseDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.responseDate), 'd MMM yyyy', { locale: fr })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.response}</p>
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
  const [reviews] = useState<LocalReview[]>(mockReviews);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<LocalReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const filteredReviews = reviews.filter((review) => {
    const clientName = `${review.client.firstName} ${review.client.lastName}`.toLowerCase();
    const comment = review.comment.toLowerCase();
    const query = searchQuery.toLowerCase();
    if (query && !clientName.includes(query) && !comment.includes(query)) {
      return false;
    }

    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
      return false;
    }

    if (responseFilter === 'responded' && !review.response) return false;
    if (responseFilter === 'pending' && review.response) return false;

    if (activeTab === 'positive' && review.rating < 4) return false;
    if (activeTab === 'negative' && review.rating >= 4) return false;

    return true;
  });

  const handleReply = (review: LocalReview) => {
    setSelectedReview(review);
    setReplyText('');
    setReplyDialogOpen(true);
  };

  const handleReport = (review: LocalReview) => {
    console.log('Report review:', review.id);
  };

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setReplyLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setReplyLoading(false);
    setReplyDialogOpen(false);
    setReplyText('');
    setSelectedReview(null);
  };

  const pendingResponseCount = reviews.filter((r) => !r.response).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avis clients</h1>
        <p className="text-muted-foreground">
          {pendingResponseCount > 0 
            ? `${pendingResponseCount} avis en attente de réponse`
            : 'Tous les avis ont une réponse'
          }
        </p>
      </div>

      <ReviewStats />

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tous ({reviews.length})
          </TabsTrigger>
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
                  {selectedReview.client.firstName} {selectedReview.client.lastName}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < selectedReview.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitReply} disabled={!replyText.trim() || replyLoading}>
              {replyLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                'Publier la réponse'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
