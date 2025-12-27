/**
 * Page Validation Prestataires (Admin)
 * 
 * Validation des nouveaux prestataires :
 * - Liste des demandes en attente
 * - Détails et documents
 * - Approuver ou rejeter
 * 
 * ALIGNÉ AVEC BACKEND: /admin/prestataires/*
 * @see backend/src/admin/admin.controller.ts
 * @see backend/src/admin/admin.service.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { adminService, type PendingPrestataire } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';
import { Avatar } from '@/components/ui/avatar';

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
  const initials = `${prestataire.firstName?.[0] || ''}${prestataire.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* <Avatar className="h-12 w-12">
            {prestataire.avatar ? (
              <img src={prestataire.avatar} alt={prestataire.businessName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground font-medium">
                {initials}
              </div>
            )}
          </Avatar> */}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{prestataire.businessName}</h3>
                <p className="text-muted-foreground">
                  {prestataire.firstName} {prestataire.lastName}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800">
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{prestataire.user?.email}</span>
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
              {prestataire.user?.createdAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Inscrit le {format(new Date(prestataire.user.createdAt), 'd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              )}
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
  isProcessing: boolean;
}

function DetailDialog({ prestataire, open, onOpenChange, onApprove, onReject, isProcessing }: DetailDialogProps) {
  if (!prestataire) return null;

  const initials = `${prestataire.firstName?.[0] || ''}${prestataire.lastName?.[0] || ''}`.toUpperCase();

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
            <TabsTrigger value="bio">Présentation</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              {/* <Avatar className="h-16 w-16">
                {prestataire.avatar ? (
                  <img src={prestataire.avatar} alt={prestataire.businessName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-medium">
                    {initials}
                  </div>
                )}
              </Avatar> */}
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
                  <span>{prestataire.user?.email}</span>
                </div>
                {prestataire.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{prestataire.phone}</span>
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

            {/* Registration date */}
            {prestataire.user?.createdAt && (
              <div className="space-y-3">
                <h4 className="font-medium">Date d'inscription</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(prestataire.user.createdAt), 'PPP à HH:mm', { locale: fr })}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bio" className="mt-4">
            {prestataire.bio ? (
              <div className="space-y-3">
                <h4 className="font-medium">Présentation</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {prestataire.bio}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={Eye}
                title="Pas de présentation"
                description="Ce prestataire n'a pas encore renseigné sa présentation"
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
            disabled={isProcessing}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <ThumbsUp className="h-4 w-4 mr-1" />
            )}
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

  // Reset reason when dialog closes
  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

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
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Traitement...
              </>
            ) : (
              'Confirmer le rejet'
            )}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrestataires, setTotalPrestataires] = useState(0);
  const prestatairesPerPage = 10;

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    prestataire: PendingPrestataire | null;
  }>({ open: false, prestataire: null });

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    prestataire: PendingPrestataire | null;
  }>({ open: false, prestataire: null });

  // Load pending prestataires from API
  const loadPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getPendingPrestataires(currentPage, prestatairesPerPage);
      setPrestataires(result?.data || []);
      setTotalPrestataires(result?.meta?.total || 0);
    } catch (error) {
      showError('Impossible de charger les demandes');
      setPrestataires([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // Handlers
  const handleView = (prestataire: PendingPrestataire) => {
    setDetailDialog({ open: true, prestataire });
  };

  const handleApprove = async (prestataire: PendingPrestataire) => {
    setIsProcessing(true);
    try {
      await adminService.approvePrestataire(prestataire.id);
      setPrestataires((prev) => prev.filter((p) => p.id !== prestataire.id));
      setTotalPrestataires((prev) => prev - 1);
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
      await adminService.rejectPrestataire(rejectDialog.prestataire.id, reason);
      setPrestataires((prev) =>
        prev.filter((p) => p.id !== rejectDialog.prestataire!.id)
      );
      setTotalPrestataires((prev) => prev - 1);
      setRejectDialog({ open: false, prestataire: null });
      showSuccess('Demande rejetée');
    } catch (error) {
      showError('Impossible de rejeter la demande');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    loadPending();
  };

  // Pagination
  const totalPages = Math.ceil(totalPrestataires / prestatairesPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Validation des prestataires</h1>
          <p className="text-muted-foreground mt-1">
            Vérifiez et validez les nouveaux prestataires
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPrestataires}</p>
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
            <>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({totalPrestataires} demandes)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
        isProcessing={isProcessing}
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
