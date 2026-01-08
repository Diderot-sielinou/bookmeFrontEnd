/**
 * PrestataireReviewsPage - ENHANCED VERSION
 *
 * Review management with:
 * - Visual rating breakdown
 * - Response composer
 * - Filter by sentiment
 * - Report functionality
 * - Response templates
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Search,
  Reply,
  Flag,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  MessageSquare,
  Filter,
  ChevronDown,
  Sparkles,
  Award,
  AlertTriangle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useReviewsManagement, useFlagReview } from '@/hooks/useReviews';
import { getReviewStats } from '@/services/reviews.service';
import type { Review } from '@/types';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Avatar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showSuccess, showError } from '@/components/ui/toast';

// ==========================================
// RATING STARS COMPONENT
// ==========================================

function RatingStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
          )}
        />
      ))}
    </div>
  );
}

// ==========================================
// STATS OVERVIEW COMPONENT
// ==========================================

interface StatsOverviewProps {
  prestataireId: string;
}

function StatsOverview({ prestataireId }: StatsOverviewProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reviews', 'stats', prestataireId],
    queryFn: () => getReviewStats(prestataireId),
    enabled: !!prestataireId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getDistributionData = () => {
    if (Array.isArray(stats.distribution)) {
      return stats.distribution;
    }
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: (stats.distribution as Record<number, number>)?.[rating] || 0,
      percentage:
        stats.totalReviews > 0
          ? (((stats.distribution as Record<number, number>)?.[rating] || 0) / stats.totalReviews) * 100
          : 0,
    }));
  };

  const distribution = getDistributionData();
  const positiveCount = distribution
    .filter((d) => d.rating >= 4)
    .reduce((sum, d) => sum + d.count, 0);
  const positiveRate = stats.totalReviews > 0 ? (positiveCount / stats.totalReviews) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-6">
          {/* Main Rating */}
          <div className="text-center">
            <p className="text-5xl font-bold">{(stats.averageRating || 0).toFixed(1)}</p>
            <RatingStars rating={Math.round(stats.averageRating || 0)} size="lg" />
            <p className="text-amber-100 mt-1">{stats.totalReviews} reviews</p>
          </div>

          {/* Sentiment */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {positiveRate >= 70 ? (
                <>
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Excellent</span>
                </>
              ) : positiveRate >= 50 ? (
                <>
                  <Minus className="h-5 w-5" />
                  <span className="font-medium">Good</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-medium">Needs Improvement</span>
                </>
              )}
            </div>
            <p className="text-amber-100 text-sm">
              {positiveRate.toFixed(0)}% of clients gave 4+ stars
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Distribution */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Rating Distribution</h4>
            {distribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <span className="w-4 text-sm font-medium">{item.rating}</span>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <div className="flex-1">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                <span className="w-8 text-sm text-muted-foreground text-right">{item.count}</span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Quality Breakdown</h4>
            {stats.averageQuality != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Quality</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.averageQuality / 5) * 100} className="w-24 h-2" />
                  <span className="font-medium">{stats.averageQuality.toFixed(1)}</span>
                </div>
              </div>
            )}
            {stats.averagePunctuality != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Punctuality</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.averagePunctuality / 5) * 100} className="w-24 h-2" />
                  <span className="font-medium">{stats.averagePunctuality.toFixed(1)}</span>
                </div>
              </div>
            )}
            {stats.averageCleanliness != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Cleanliness</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.averageCleanliness / 5) * 100} className="w-24 h-2" />
                  <span className="font-medium">{stats.averageCleanliness.toFixed(1)}</span>
                </div>
              </div>
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
  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';

  const getSentiment = () => {
    if (review.rating >= 4) return { label: 'Positive', color: 'bg-green-100 text-green-700' };
    if (review.rating >= 3) return { label: 'Neutral', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Negative', color: 'bg-red-100 text-red-700' };
  };

  const sentiment = getSentiment();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="overflow-hidden">
        {/* Sentiment indicator */}
        <div
          className={cn(
            'h-1',
            review.rating >= 4 ? 'bg-green-500' : review.rating >= 3 ? 'bg-amber-500' : 'bg-red-500'
          )}
        />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <Avatar
                src={client?.avatar}
                firstName={client?.firstName}
                lastName={client?.lastName}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{clientName}</h3>
                  <Badge variant="secondary" className={sentiment.color}>
                    {sentiment.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'MMM d, yyyy', { locale: enUS })}
                  </span>
                </div>
                {review.appointment?.service && (
                  <Badge variant="outline" className="mt-2">
                    {review.appointment.service.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!review.prestataireResponse && (
                  <DropdownMenuItem onClick={() => onReply(review)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onReport(review)} className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Comment */}
          <p className="text-muted-foreground mb-4">{review.comment}</p>

          {/* Sub-ratings */}
          {(review.qualityRating || review.punctualityRating || review.cleanlinessRating) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {review.qualityRating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium">{review.qualityRating}/5</span>
                </div>
              )}
              {review.punctualityRating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Punctuality:</span>
                  <span className="font-medium">{review.punctualityRating}/5</span>
                </div>
              )}
              {review.cleanlinessRating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Cleanliness:</span>
                  <span className="font-medium">{review.cleanlinessRating}/5</span>
                </div>
              )}
            </div>
          )}

          {/* Provider Response */}
          {review.prestataireResponse && (
            <div className="mt-4 p-4 rounded-lg bg-cyan-50 border-l-4 border-cyan-500">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-cyan-600" />
                <span className="font-medium text-cyan-800 text-sm">Your Response</span>
                {review.responseAt && (
                  <span className="text-xs text-cyan-600">
                    {format(new Date(review.responseAt), 'MMM d, yyyy', { locale: enUS })}
                  </span>
                )}
              </div>
              <p className="text-sm text-cyan-900">{review.prestataireResponse}</p>
            </div>
          )}

          {/* Reply CTA */}
          {!review.prestataireResponse && (
            <Button variant="outline" size="sm" onClick={() => onReply(review)} className="mt-4">
              <Reply className="h-4 w-4 mr-2" />
              Write a Response
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==========================================
// REPLY DIALOG
// ==========================================

interface ReplyDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (response: string) => Promise<void>;
  isLoading: boolean;
}

function ReplyDialog({ review, open, onOpenChange, onSubmit, isLoading }: ReplyDialogProps) {
  const [response, setResponse] = useState('');

  // Response templates
  const templates = [
    {
      label: 'Thank you',
      text: "Thank you so much for your kind words! I'm thrilled that you enjoyed your experience. Looking forward to seeing you again!",
    },
    {
      label: 'Apologize',
      text: "Thank you for taking the time to share your feedback. I'm sorry to hear that your experience didn't meet expectations. I'd love the opportunity to make it right. Please reach out to discuss how I can improve.",
    },
    {
      label: 'Appreciate',
      text: 'I really appreciate you taking the time to leave this review. Your feedback helps me continue to improve my services. Thank you for your support!',
    },
  ];

  const handleSubmit = async () => {
    if (response.trim().length < 5) return;
    await onSubmit(response);
    setResponse('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Reply className="h-5 w-5 text-cyan-500" />
            Reply to Review
          </DialogTitle>
          <DialogDescription>
            Your response will be publicly visible to all users
          </DialogDescription>
        </DialogHeader>

        {review && (
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={review.client?.avatar}
                firstName={review.client?.firstName}
                lastName={review.client?.lastName}
                size="sm"
              />
              <span className="font-medium text-sm">
                {review.client?.firstName} {review.client?.lastName}
              </span>
              <RatingStars rating={review.rating} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
          </div>
        )}

        {/* Templates */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Button
                key={template.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResponse(template.text)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Response Input */}
        <div className="space-y-2">
          <Label>Your Response</Label>
          <Textarea
            placeholder="Write a thoughtful response..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {response.length}/500 characters (minimum 5)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={response.trim().length < 5 || response.length > 500 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Response'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PrestataireReviewsPage() {
  const { profile } = useAuth();
  const prestataireId = profile?.id;

  const { reviews, isLoading, respond, isResponding, refetch } = useReviewsManagement();
  const flagMutation = useFlagReview();

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [replyDialog, setReplyDialog] = useState<{ open: boolean; review: Review | null }>({
    open: false,
    review: null,
  });
  const [reportDialog, setReportDialog] = useState<{ open: boolean; review: Review | null }>({
    open: false,
    review: null,
  });
  const [reportReason, setReportReason] = useState('');

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const clientName = review.client
        ? `${review.client.firstName} ${review.client.lastName}`.toLowerCase()
        : '';
      const comment = (review.comment || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      if (query && !clientName.includes(query) && !comment.includes(query)) {
        return false;
      }

      if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
        return false;
      }

      if (responseFilter === 'responded' && !review.prestataireResponse) return false;
      if (responseFilter === 'pending' && review.prestataireResponse) return false;

      if (activeTab === 'positive' && review.rating < 4) return false;
      if (activeTab === 'negative' && review.rating < 4) return false;

      return true;
    });
  }, [reviews, searchQuery, ratingFilter, responseFilter, activeTab]);

  const pendingCount = reviews.filter((r) => !r.prestataireResponse).length;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating < 4).length;

  // Handlers
  const handleReply = (review: Review) => {
    setReplyDialog({ open: true, review });
  };

  const handleReport = (review: Review) => {
    setReportDialog({ open: true, review });
    setReportReason('');
  };

  const submitReply = async (response: string) => {
    if (!replyDialog.review) return;
    try {
      await respond({ id: replyDialog.review.id, data: { response } });
      setReplyDialog({ open: false, review: null });
      showSuccess('Response published!');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const submitReport = async () => {
    if (!reportDialog.review || !reportReason.trim()) return;
    try {
      await flagMutation.mutateAsync({
        id: reportDialog.review.id,
        reason: reportReason,
      });
      setReportDialog({ open: false, review: null });
      showSuccess('Review reported');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} review${pendingCount > 1 ? 's' : ''} awaiting response`
              : 'All reviews have been responded to'}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {prestataireId && <StatsOverview prestataireId={prestataireId} />}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={responseFilter} onValueChange={setResponseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Response Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Awaiting Response</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="positive" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Positive ({positiveCount})
          </TabsTrigger>
          <TabsTrigger value="negative" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            To Address ({negativeCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={Star}
                  title="No Reviews Found"
                  description={
                    reviews.length === 0
                      ? "You haven't received any reviews yet"
                      : 'No reviews match your current filters'
                  }
                />
              </motion.div>
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
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <ReplyDialog
        review={replyDialog.review}
        open={replyDialog.open}
        onOpenChange={(open) => setReplyDialog({ ...replyDialog, open })}
        onSubmit={submitReply}
        isLoading={isResponding}
      />

      {/* Report Dialog */}
      <Dialog
        open={reportDialog.open}
        onOpenChange={(open) => setReportDialog({ ...reportDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Report Review
            </DialogTitle>
            <DialogDescription>
              Explain why this review should be examined by our moderation team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason for Reporting</Label>
            <Textarea
              placeholder="Describe the issue with this review..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog({ open: false, review: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitReport}
              disabled={!reportReason.trim() || flagMutation.isPending}
            >
              {flagMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}