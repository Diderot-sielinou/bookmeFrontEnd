/**
 * Page Validation Prestataires (Admin)
 * 
 * Validation des nouveaux prestataires :
 * - Liste des demandes en attente
 * - Détails et documents
 * - Approuver ou rejeter
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Prestataire } from '@/types';
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
  Separator,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';

// ==========================================
// TYPES
// ==========================================

interface PendingPrestataire extends Omit<Prestataire, 'user'> {
  user: {
    email: string;
    createdAt: string;
  };
  documents?: {
    id: string;
    type: string;
    url: string;
    name: string;
  }[];
}

// ==========================================
// PRESTATAIRE CARD
// ==========================================

interface PrestataireCardProps {
  prestataire: PendingPrestataire;
  onView: (prestataire: PendingPrestataire) => void;
  onApprove: (prestataire: PendingPrestataire) => void;
  onReject: (prestataire: PendingPrestataire) => void;
}

function PrestataireCard({ prestataire, onView, onApprove, onReject }: PrestataireCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={prestataire.avatar}
            firstName={prestataire.firstName}
            lastName={prestataire.lastName}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{prestataire.businessName}</h3>
                <p className="text-muted-foreground">
                  {prestataire.firstName} {prestataire.lastName}
                </p>
              </div>
              <Badge variant="warning" className="shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{prestataire.user.email}</span>
              </div>
              {prestataire.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{prestataire.phone}</span>
                </div>
              )}
              {prestataire.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{prestataire.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Inscrit le {format(new Date(prestataire.user.createdAt), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>

            {prestataire.categories && prestataire.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {prestataire.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => onView(prestataire)}>
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(prestataire)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(prestataire)}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Rejeter
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
  prestataire: PendingPrestataire | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
}

function DetailDialog({ prestataire, open, onOpenChange, onApprove, onReject }: DetailDialogProps) {
  if (!prestataire) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du prestataire</DialogTitle>
          <DialogDescription>
            Vérifiez les informations avant de valider
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar
                src={prestataire.avatar}
                firstName={prestataire.firstName}
                lastName={prestataire.lastName}
                size="xl"
              />
              <div>
                <h3 className="text-xl font-semibold">{prestataire.businessName}</h3>
                <p className="text-muted-foreground">
                  {prestataire.firstName} {prestataire.lastName}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="font-medium">Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{prestataire.user.email}</span>
                </div>
                {prestataire.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{prestataire.phone}</span>
                  </div>
                )}
                {prestataire.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={prestataire.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      {prestataire.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(prestataire.address || prestataire.city) && (
              <div className="space-y-3">
                <h4 className="font-medium">Adresse</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    {prestataire.address && <p>{prestataire.address}</p>}
                    {prestataire.city && (
                      <p>
                        {prestataire.postalCode} {prestataire.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            {prestataire.categories && prestataire.categories.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Catégories</h4>
                <div className="flex flex-wrap gap-2">
                  {prestataire.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {prestataire.bio && (
              <div className="space-y-3">
                <h4 className="font-medium">Présentation</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {prestataire.bio}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            {prestataire.documents && prestataire.documents.length > 0 ? (
              <div className="space-y-3">
                {prestataire.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="Aucun document"
                description="Ce prestataire n'a pas encore fourni de documents"
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onApprove}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Approuver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// REJECTION DIALOG
// ==========================================

interface RejectionDialogProps {
  prestataire: PendingPrestataire | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

function RejectionDialog({
  prestataire,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: RejectionDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter la demande</DialogTitle>
          <DialogDescription>
            Indiquez la raison du rejet pour {prestataire?.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du rejet *</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi cette demande est rejetée..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            isLoading={isLoading}
          >
            Confirmer le rejet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function AdminValidationPage() {
  const [prestataires, setPrestataires] = useState<PendingPrestataire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    prestataire: PendingPrestataire | null;
  }>({ open: false, prestataire: null });

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    prestataire: PendingPrestataire | null;
  }>({ open: false, prestataire: null });

  // Load pending prestataires
  useEffect(() => {
    const loadPending = async () => {
      try {
        const response = await api.get('/admin/prestataires/pending');
        setPrestataires(response.data.data || response.data);
      } catch (error) {
        showError('Impossible de charger les demandes');
      } finally {
        setIsLoading(false);
      }
    };
    loadPending();
  }, []);

  // Handlers
  const handleView = (prestataire: PendingPrestataire) => {
    setDetailDialog({ open: true, prestataire });
  };

  const handleApprove = async (prestataire: PendingPrestataire) => {
    setIsProcessing(true);
    try {
      await api.post(`/admin/prestataires/${prestataire.id}/approve`);
      setPrestataires((prev) => prev.filter((p) => p.id !== prestataire.id));
      setDetailDialog({ open: false, prestataire: null });
      showSuccess(`${prestataire.businessName} a été approuvé`);
    } catch (error) {
      showError('Impossible d\'approuver le prestataire');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (prestataire: PendingPrestataire) => {
    setDetailDialog({ open: false, prestataire: null });
    setRejectDialog({ open: true, prestataire });
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectDialog.prestataire) return;

    setIsProcessing(true);
    try {
      await api.post(`/admin/prestataires/${rejectDialog.prestataire.id}/reject`, {
        reason,
      });
      setPrestataires((prev) =>
        prev.filter((p) => p.id !== rejectDialog.prestataire!.id)
      );
      setRejectDialog({ open: false, prestataire: null });
      showSuccess('Demande rejetée');
    } catch (error) {
      showError('Impossible de rejeter la demande');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Validation des prestataires</h1>
        <p className="text-muted-foreground mt-1">
          Vérifiez et validez les nouveaux prestataires
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prestataires.length}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
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
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Rejetés (7j)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending list */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : prestataires.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Tout est à jour !"
              description="Aucune demande de validation en attente"
            />
          ) : (
            <div className="space-y-4">
              {prestataires.map((prestataire) => (
                <PrestataireCard
                  key={prestataire.id}
                  prestataire={prestataire}
                  onView={handleView}
                  onApprove={() => handleApprove(prestataire)}
                  onReject={() => handleReject(prestataire)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <DetailDialog
        prestataire={detailDialog.prestataire}
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}
        onApprove={() => detailDialog.prestataire && handleApprove(detailDialog.prestataire)}
        onReject={() => detailDialog.prestataire && handleReject(detailDialog.prestataire)}
      />

      {/* Rejection dialog */}
      <RejectionDialog
        prestataire={rejectDialog.prestataire}
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
        onConfirm={handleConfirmReject}
        isLoading={isProcessing}
      />
    </div>
  );
}

export default AdminValidationPage;
