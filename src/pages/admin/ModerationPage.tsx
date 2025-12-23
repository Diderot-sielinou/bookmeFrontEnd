/**
 * Page Modération des Avis (Admin)
 * 
 * Modération des avis signalés :
 * - Liste des avis signalés
 * - Actions (approuver, supprimer, avertir)
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Flag,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Eye,
  MessageSquare,
  Star,
  User,
  Building,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Review } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';
import { RatingStars } from '@/components/shared/RatingStars';

// ==========================================
// TYPES
// ==========================================

interface FlaggedReview extends Omit<Review, 'client' | 'appointment'> {
  flagReason: string;
  flaggedAt: string;
  flaggedBy: {
    id: string;
    email: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    userId: string;
  };
  appointment: {
    prestataire: {
      id: string;
      businessName: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    service: {
      name: string;
    };
  };
}

// ==========================================
// REVIEW CARD
// ==========================================

interface ReviewCardProps {
  review: FlaggedReview;
  onApprove: (review: FlaggedReview) => void;
  onDelete: (review: FlaggedReview) => void;
  onWarn: (review: FlaggedReview) => void;
  onView: (review: FlaggedReview) => void;
}

function ReviewCard({ review, onApprove, onDelete, onWarn, onView }: ReviewCardProps) {
  const prestataire = review.appointment?.prestataire;
  const client = review.client;

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardContent className="p-6">
        {/* Flag info */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-100 rounded-lg text-sm">
          <Flag className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-800">Signalé :</span>
          <span className="text-amber-700">{review.flagReason}</span>
          <span className="text-amber-600 ml-auto">
            {format(new Date(review.flaggedAt), 'd MMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-start gap-4">
          {/* Client info */}
          <div className="flex items-center gap-3">
            <Avatar
              src={client?.avatar}
              firstName={client?.firstName}
              lastName={client?.lastName}
              size="md"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="font-medium">
                  {client?.firstName} {client?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avis pour{' '}
                  <span className="font-medium">
                    {prestataire?.businessName}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RatingStars value={review.rating} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.createdAt), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>

            {/* Comment */}
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {review.comment}
            </p>

            {/* Prestataire response */}
            {review.prestataireResponse && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Réponse du prestataire :
                </p>
                <p className="text-sm">{review.prestataireResponse}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onView(review)}>
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(review)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                onClick={() => onWarn(review)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Avertir
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(review)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// DETAIL DIALOG
// ==========================================

interface DetailDialogProps {
  review: FlaggedReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailDialog({ review, open, onOpenChange }: DetailDialogProps) {
  if (!review) return null;

  const prestataire = review.appointment?.prestataire;
  const client = review.client;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de l'avis signalé</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Flag reason */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Raison du signalement</span>
            </div>
            <p className="text-amber-700">{review.flagReason}</p>
            <p className="text-xs text-amber-600 mt-2">
              Signalé le {format(new Date(review.flaggedAt), 'PPP à HH:mm', { locale: fr })}
            </p>
          </div>

          {/* Review content */}
          <div className="space-y-4">
            <h4 className="font-medium">Contenu de l'avis</h4>
            
            <div className="flex items-center gap-4">
              <Avatar
                src={client?.avatar}
                firstName={client?.firstName}
                lastName={client?.lastName}
                size="lg"
              />
              <div>
                <p className="font-medium">
                  {client?.firstName} {client?.lastName}
                </p>
                <RatingStars value={review.rating} size="sm" />
              </div>
            </div>

            <p className="text-muted-foreground whitespace-pre-wrap">
              {review.comment}
            </p>
          </div>

          {/* Prestataire info */}
          <div className="space-y-3">
            <h4 className="font-medium">Prestataire concerné</h4>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar
                src={prestataire?.avatar}
                firstName={prestataire?.firstName}
                lastName={prestataire?.lastName}
                size="md"
              />
              <div>
                <p className="font-medium">{prestataire?.businessName}</p>
                <p className="text-sm text-muted-foreground">
                  {prestataire?.firstName} {prestataire?.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Response */}
          {review.prestataireResponse && (
            <div className="space-y-3">
              <h4 className="font-medium">Réponse du prestataire</h4>
              <p className="text-muted-foreground p-3 bg-muted rounded-lg">
                {review.prestataireResponse}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// WARN DIALOG
// ==========================================

interface WarnDialogProps {
  review: FlaggedReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
  isLoading: boolean;
}

function WarnDialog({ review, open, onOpenChange, onConfirm, isLoading }: WarnDialogProps) {
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(message);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un avertissement</DialogTitle>
          <DialogDescription>
            Un email d'avertissement sera envoyé à l'auteur de l'avis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message d'avertissement</Label>
            <Textarea
              id="message"
              placeholder="Expliquez pourquoi cet avis pose problème..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleConfirm}
            disabled={!message.trim()}
            isLoading={isLoading}
          >
            Envoyer l'avertissement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function AdminModerationPage() {
  const [reviews, setReviews] = useState<FlaggedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    review: FlaggedReview | null;
  }>({ open: false, review: null });

  const [warnDialog, setWarnDialog] = useState<{
    open: boolean;
    review: FlaggedReview | null;
  }>({ open: false, review: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    review: FlaggedReview | null;
  }>({ open: false, review: null });

  // Load flagged reviews
  useEffect(() => {
    const loadFlagged = async () => {
      try {
        const response = await api.get('/admin/reviews/flagged');
        setReviews(response.data.data || response.data);
      } catch (error) {
        showError('Impossible de charger les avis signalés');
      } finally {
        setIsLoading(false);
      }
    };
    loadFlagged();
  }, []);

  // Handlers
  const handleView = (review: FlaggedReview) => {
    setDetailDialog({ open: true, review });
  };

  const handleApprove = async (review: FlaggedReview) => {
    setIsProcessing(true);
    try {
      await api.post(`/admin/reviews/${review.id}/approve`);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showSuccess('Avis approuvé');
    } catch (error) {
      showError('Impossible d\'approuver l\'avis');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWarn = (review: FlaggedReview) => {
    setWarnDialog({ open: true, review });
  };

  const handleConfirmWarn = async (message: string) => {
    if (!warnDialog.review) return;

    setIsProcessing(true);
    try {
      await api.post(`/admin/reviews/${warnDialog.review.id}/warn`, { message });
      setReviews((prev) => prev.filter((r) => r.id !== warnDialog.review!.id));
      setWarnDialog({ open: false, review: null });
      showSuccess('Avertissement envoyé');
    } catch (error) {
      showError('Impossible d\'envoyer l\'avertissement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (review: FlaggedReview) => {
    setDeleteDialog({ open: true, review });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.review) return;

    setIsProcessing(true);
    try {
      await api.delete(`/admin/reviews/${deleteDialog.review.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== deleteDialog.review!.id));
      setDeleteDialog({ open: false, review: null });
      showSuccess('Avis supprimé');
    } catch (error) {
      showError('Impossible de supprimer l\'avis');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Modération des avis</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les avis signalés par les utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-sm text-muted-foreground">Signalés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Approuvés (7j)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Avertis (7j)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Supprimés (7j)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews list */}
      <Card>
        <CardHeader>
          <CardTitle>Avis signalés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Tout est en ordre !"
              description="Aucun avis signalé à modérer"
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  onWarn={handleWarn}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <DetailDialog
        review={detailDialog.review}
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}
      />

      {/* Warn dialog */}
      <WarnDialog
        review={warnDialog.review}
        open={warnDialog.open}
        onOpenChange={(open) => setWarnDialog({ ...warnDialog, open })}
        onConfirm={handleConfirmWarn}
        isLoading={isProcessing}
      />

      {/* Delete confirmation */}
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
              isLoading={isProcessing}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminModerationPage;
