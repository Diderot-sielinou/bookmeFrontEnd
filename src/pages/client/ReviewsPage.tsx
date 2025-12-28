/**
 * My Reviews Page (Client)
 * 
 * List of reviews left by the client and ability
 * to create new ones for completed appointments.
 * ALIGNED WITH BACKEND
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Star, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { formatTime } from '@/lib/utils';
import { useMyReviews, useCreateReview, useUpdateReview } from '@/hooks/useReviews';
import { useMyAppointments } from '@/hooks/useAppointments';
import { deleteReview, canEditReview } from '@/services/reviews.service';
import { AppointmentStatus } from '@/types';
import type { Review, Appointment } from '@/types';
import {
  Card,
  CardContent,
  Button,
  Avatar,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/api';
import { EmptyState } from '@/components/shared';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RatingStars } from '@/components/shared/RatingStars';

// ==========================================
// VALIDATION
// ==========================================

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please provide a rating').max(5),
  comment: z.string().min(10, 'Minimum 10 characters').max(1000, 'Maximum 1000 characters'),
  qualityRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  cleanlinessRating: z.number().min(1).max(5).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

// ==========================================
// REVIEW CARD
// ==========================================

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
}

function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { appointment, rating, comment, createdAt, prestataireResponse } = review;
  const prestataire = appointment?.prestataire;
  const name = prestataire?.businessName ||
    `${prestataire?.firstName} ${prestataire?.lastName}`;

  const canEdit = canEditReview(review);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={prestataire?.avatar}
            firstName={prestataire?.firstName}
            lastName={prestataire?.lastName}
            size="lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  {appointment?.service?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(review)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onDelete(review)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <RatingStars value={rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(createdAt), 'MMMM d, yyyy', { locale: enUS })}
              </span>
              {review.editCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Edited {review.editCount}x
                </Badge>
              )}
            </div>

            <p className="mt-3 text-muted-foreground">{comment}</p>

            {/* Provider response */}
            {prestataireResponse && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">Provider Response:</p>
                  {review.responseAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.responseAt), 'MMM d, yyyy', { locale: enUS })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{prestataireResponse}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// PENDING REVIEW CARD
// ==========================================

interface PendingReviewCardProps {
  appointment: Appointment;
  onReview: (appointment: Appointment) => void;
}

function PendingReviewCard({ appointment, onReview }: PendingReviewCardProps) {
  const { prestataire, service, slot } = appointment;
  const name = prestataire?.businessName ||
    `${prestataire?.firstName} ${prestataire?.lastName}`;

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={prestataire?.avatar}
            firstName={prestataire?.firstName}
            lastName={prestataire?.lastName}
            size="lg"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{service?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {slot && format(new Date(slot.date), 'MMMM d, yyyy', { locale: enUS })} at{' '}
              {slot && formatTime(slot.startTime)}
            </p>
          </div>

          <Button onClick={() => onReview(appointment)}>
            <Star className="h-4 w-4 mr-2" />
            Leave Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// REVIEW DIALOG
// ==========================================

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  existingReview?: Review | null;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isLoading: boolean;
}

function ReviewDialog({
  open,
  onOpenChange,
  appointment,
  existingReview,
  onSubmit,
  isLoading,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || '',
    },
  });

  useEffect(() => {
    if (existingReview) {
      reset({
        rating: existingReview.rating,
        comment: existingReview.comment ?? '',
        qualityRating: existingReview.qualityRating ?? undefined,
        punctualityRating: existingReview.punctualityRating ?? undefined,
        cleanlinessRating: existingReview.cleanlinessRating ?? undefined,
      });
      setRating(existingReview.rating);
    } else {
      reset({ rating: 0, comment: '' });
      setRating(0);
    }
  }, [existingReview, reset]);

  const handleRatingChange = (value: number) => {
    setRating(value);
    setValue('rating', value);
  };

  const prestataire = appointment?.prestataire;
  const name = prestataire?.businessName ||
    `${prestataire?.firstName} ${prestataire?.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Edit My Review' : 'Leave a Review'}
          </DialogTitle>
          <DialogDescription>
            {existingReview
              ? `Edit your review (${2 - existingReview.editCount} edit(s) remaining)`
              : `Share your experience with ${name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Appointment info */}
          {appointment && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar
                src={prestataire?.avatar}
                firstName={prestataire?.firstName}
                lastName={prestataire?.lastName}
                size="md"
              />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.service?.name}
                </p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex justify-center py-2">
              <RatingStars
                value={rating}
                onChange={handleRatingChange}
                size="lg"
              />
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive text-center">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment *</Label>
            <Textarea
              id="comment"
              placeholder="Describe your experience..."
              rows={4}
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : existingReview ? 'Update' : 'Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function ClientReviewsPage() {
  const [searchParams] = useSearchParams();
  const initialAppointmentId = searchParams.get('appointmentId');

  const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    appointment: Appointment | null;
    review: Review | null;
  }>({ open: false, appointment: null, review: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });

  // Hooks aligned with backend
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useMyReviews();
  const { data: appointmentsData, isLoading: appointmentsLoading } = useMyAppointments({
    status: AppointmentStatus.COMPLETED,
  });

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const reviews = reviewsData?.data || [];
  const allAppointments = appointmentsData?.data || [];

  // Filter appointments without reviews
  const reviewedIds = new Set(reviews.map((r) => r.appointmentId));
  const pendingAppointments = allAppointments.filter((a) => !reviewedIds.has(a.id));

  const isLoading = reviewsLoading || appointmentsLoading;

  // Open dialog if appointmentId in URL
  useEffect(() => {
    if (initialAppointmentId && !isLoading && pendingAppointments.length > 0) {
      const targetAppointment = pendingAppointments.find((a) => a.id === initialAppointmentId);
      if (targetAppointment) {
        setActiveTab('pending');
        setDialogState({ open: true, appointment: targetAppointment, review: null });
      }
    }
  }, [initialAppointmentId, isLoading, pendingAppointments]);

  // Handlers
  const handleCreateReview = (appointment: Appointment) => {
    setDialogState({ open: true, appointment, review: null });
  };

  const handleEditReview = (review: Review) => {
    if (!canEditReview(review)) {
      showError('You can no longer edit this review');
      return;
    }
    setDialogState({ open: true, appointment: review.appointment!, review });
  };

  const handleDeleteReview = (review: Review) => {
    setDeleteDialog({ open: true, review });
  };

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!dialogState.appointment) return;

    try {
      if (dialogState.review) {
        // Update existing review
        await updateReviewMutation.mutateAsync({
          id: dialogState.review.id,
          data: {
            rating: data.rating,
            comment: data.comment,
            qualityRating: data.qualityRating,
            punctualityRating: data.punctualityRating,
            cleanlinessRating: data.cleanlinessRating,
          },
        });
      } else {
        // Create new review
        await createReviewMutation.mutateAsync({
          appointmentId: dialogState.appointment.id,
          rating: data.rating,
          comment: data.comment,
          qualityRating: data.qualityRating,
          punctualityRating: data.punctualityRating,
          cleanlinessRating: data.cleanlinessRating,
        });
      }
      setDialogState({ open: false, appointment: null, review: null });
    } catch (error) {
      // Errors handled by mutations
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.review) return;

    setIsDeleting(true);
    try {
      await deleteReview(deleteDialog.review.id);
      showSuccess('Review deleted');
      refetchReviews();
      setDeleteDialog({ open: false, review: null });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage your reviews of providers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-sm text-muted-foreground">Published Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="published">Published ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          {reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No published reviews"
              description="You haven't left any reviews yet"
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingAppointments.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="All up to date!"
              description="You've left a review for all your completed appointments"
            />
          ) : (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <PendingReviewCard
                  key={appointment.id}
                  appointment={appointment}
                  onReview={handleCreateReview}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <ReviewDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        appointment={dialogState.appointment}
        existingReview={dialogState.review}
        onSubmit={handleSubmitReview}
        isLoading={createReviewMutation.isPending || updateReviewMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, review: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientReviewsPage;