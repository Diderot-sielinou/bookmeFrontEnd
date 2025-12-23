/**
 * Page Mes Avis (Client)
 * 
 * Liste des avis laissés par le client et possibilité
 * d'en créer de nouveaux pour les rendez-vous terminés.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { formatTime } from '@/lib/utils';
import { reviewsService, appointmentsService } from '@/services';
import { AppointmentStatus } from '@/types';
import type { Review, Appointment } from '@/types';
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
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';
import { RatingStars } from '@/components/shared/RatingStars';

// ==========================================
// VALIDATION
// ==========================================

const reviewSchema = z.object({
  rating: z.number().min(1, 'Veuillez donner une note').max(5),
  comment: z.string().min(10, 'Minimum 10 caractères').max(1000, 'Maximum 1000 caractères'),
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
                <Button variant="ghost" size="icon" onClick={() => onEdit(review)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  // onClick={() => onDelete(review)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <RatingStars value={rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(createdAt), 'd MMMM yyyy', { locale: fr })}
              </span>
            </div>

            <p className="mt-3 text-muted-foreground">{comment}</p>

            {/* Réponse du prestataire */}
            {prestataireResponse && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Réponse du prestataire :</p>
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
              {slot && format(new Date(slot.date), 'd MMMM yyyy', { locale: fr })} à{' '}
              {slot && formatTime(slot.startTime)}
            </p>
          </div>

          <Button onClick={() => onReview(appointment)}>
            <Star className="h-4 w-4 mr-2" />
            Laisser un avis
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
        comment: existingReview.comment ?? undefined,
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
            {existingReview ? 'Modifier mon avis' : 'Laisser un avis'}
          </DialogTitle>
          <DialogDescription>
            {existingReview
              ? 'Modifiez votre avis pour ce rendez-vous'
              : `Partagez votre expérience avec ${name}`}
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
            <Label>Note *</Label>
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
            <Label htmlFor="comment">Commentaire *</Label>
            <Textarea
              id="comment"
              placeholder="Décrivez votre expérience..."
              rows={4}
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {existingReview ? 'Modifier' : 'Publier'}
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    appointment: Appointment | null;
    review: Review | null;
  }>({ open: false, appointment: null, review: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, appointmentsData] = await Promise.all([
          reviewsService.getMyReviews(),
          appointmentsService.getMyAppointments({
            status: AppointmentStatus.COMPLETED,
          }),
        ]);

        setReviews(reviewsData.data || []);

        // Filter appointments without reviews
        const reviewedIds = new Set(reviewsData.data?.map((r: Review) => r.appointmentId) || []);
        const pending = (appointmentsData.data || []).filter(
          (a: Appointment) => !reviewedIds.has(a.id)
        );
        setPendingAppointments(pending);

        // Open dialog if appointmentId in URL
        if (initialAppointmentId) {
          const targetAppointment = pending.find((a: Appointment) => a.id === initialAppointmentId);
          if (targetAppointment) {
            setActiveTab('pending');
            setDialogState({ open: true, appointment: targetAppointment, review: null });
          }
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
        showError('Impossible de charger les avis');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [initialAppointmentId]);

  // Handlers
  const handleCreateReview = (appointment: Appointment) => {
    setDialogState({ open: true, appointment, review: null });
  };

  const handleEditReview = (review: Review) => {
    setDialogState({ open: true, appointment: review.appointment!, review });
  };

  const handleDeleteReview = (review: Review) => {
    setDeleteDialog({ open: true, review });
  };

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!dialogState.appointment) return;

    setIsSubmitting(true);
    try {
      if (dialogState.review) {
        // Update existing review
        const updated = await reviewsService.updateReview(dialogState.review.id, data);
        setReviews((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        showSuccess('Avis modifié avec succès');
      } else {
        // Create new review
        const created = await reviewsService.createReview({
          appointmentId: dialogState.appointment.id,
          ...data,
        });
        setReviews((prev) => [created, ...prev]);
        setPendingAppointments((prev) =>
          prev.filter((a) => a.id !== dialogState.appointment!.id)
        );
        showSuccess('Avis publié avec succès');
      }
      setDialogState({ open: false, appointment: null, review: null });
    } catch (error) {
      showError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.review) return;

    setIsSubmitting(true);
    try {
      await reviewsService.deleteReview(deleteDialog.review.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteDialog.review!.id));
      // Add back to pending
      if (deleteDialog.review.appointment) {
        setPendingAppointments((prev) => [deleteDialog.review!.appointment!, ...prev]);
      }
      showSuccess('Avis supprimé');
      setDeleteDialog({ open: false, review: null });
    } catch (error) {
      showError('Impossible de supprimer l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mes avis</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos avis sur les prestataires
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
              <p className="text-sm text-muted-foreground">Avis publiés</p>
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
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="published">Publiés ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">
            En attente
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
              title="Aucun avis publié"
              description="Vous n'avez pas encore laissé d'avis"
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
              title="Tout est à jour !"
              description="Vous avez laissé un avis pour tous vos rendez-vous terminés"
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
        onOpenChange={(open) =>
          setDialogState({ ...dialogState, open })
        }
        appointment={dialogState.appointment}
        existingReview={dialogState.review}
        onSubmit={handleSubmitReview}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'avis</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, review: null })}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              isLoading={isSubmitting}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientReviewsPage;
