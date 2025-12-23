/**
 * Page Mes Services (Prestataire)
 * 
 * Gestion des services proposés par le prestataire :
 * - Liste des services avec prix et durée
 * - Création/Modification/Suppression
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Euro,
  Briefcase,
  GripVertical,
} from 'lucide-react';

import { formatPrice, formatDuration } from '@/lib/utils';
import { servicesService } from '@/services';
import type { Service } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';

// ==========================================
// VALIDATION
// ==========================================

const serviceSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500, 'Maximum 500 caractères').optional(),
  duration: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 heures'),
  price: z.number().min(0, 'Le prix doit être positif'),
  isActive: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// ==========================================
// SERVICE CARD
// ==========================================

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (service: Service) => void;
}

function ServiceCard({ service, onEdit, onDelete, onToggleActive }: ServiceCardProps) {
  return (
    <Card className={!service.isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag handle (for future drag & drop) */}
          <div className="p-2 text-muted-foreground cursor-grab hidden">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Service info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{service.name}</h3>
              {!service.isActive && (
                <Badge variant="secondary">Inactif</Badge>
              )}
            </div>
            
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {service.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDuration(service.duration)}
              </span>
              <span className="flex items-center gap-1 font-semibold text-cyan-600">
                <Euro className="h-4 w-4" />
                {formatPrice(service.price)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={service.isActive}
              onCheckedChange={() => onToggleActive(service)}
            />
            <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(service)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// SERVICE FORM DIALOG
// ==========================================

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  isLoading: boolean;
}

function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
  isLoading,
}: ServiceDialogProps) {
  const isEditing = !!service;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or service changes
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        isActive: service.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        isActive: true,
      });
    }
  }, [service, reset, open]);

  const duration = watch('duration');

  // Preset durations
  const durationPresets = [15, 30, 45, 60, 90, 120];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le service' : 'Nouveau service'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de ce service'
              : 'Créez un nouveau service pour vos clients'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du service *</Label>
            <Input
              id="name"
              placeholder="Ex: Coupe homme"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez ce service..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée *</Label>
            <div className="flex flex-wrap gap-2">
              {durationPresets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={duration === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('duration', preset)}
                >
                  {formatDuration(preset)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={15}
                max={480}
                step={5}
                className="w-24"
                {...register('duration', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix *</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                className="pl-8"
                {...register('price', { valueAsNumber: true })}
                error={!!errors.price}
              />
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Service actif</Label>
              <p className="text-sm text-muted-foreground">
                Visible et réservable par les clients
              </p>
            </div>
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Enregistrer' : 'Créer le service'}
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

export function PrestataireServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await servicesService.getMyServices();
        setServices(data);
      } catch (error) {
        showError('Impossible de charger les services');
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  // Handlers
  const handleCreate = () => {
    setDialogState({ open: true, service: null });
  };

  const handleEdit = (service: Service) => {
    setDialogState({ open: true, service });
  };

  const handleDelete = (service: Service) => {
    setDeleteDialog({ open: true, service });
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const updated = await servicesService.updateService(service.id, {
        isActive: !service.isActive,
      });
      setServices((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      showSuccess(updated.isActive ? 'Service activé' : 'Service désactivé');
    } catch (error) {
      showError('Impossible de modifier le service');
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      if (dialogState.service) {
        // Update
        const updated = await servicesService.updateService(
          dialogState.service.id,
          data
        );
        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        showSuccess('Service modifié');
      } else {
        // Create
        const created = await servicesService.createService(data);
        setServices((prev) => [...prev, created]);
        showSuccess('Service créé');
      }
      setDialogState({ open: false, service: null });
    } catch (error) {
      showError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.service) return;

    setIsSubmitting(true);
    try {
      await servicesService.deleteService(deleteDialog.service.id);
      setServices((prev) =>
        prev.filter((s) => s.id !== deleteDialog.service!.id)
      );
      showSuccess('Service supprimé');
      setDeleteDialog({ open: false, service: null });
    } catch (error) {
      showError('Impossible de supprimer le service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const activeCount = services.filter((s) => s.isActive).length;
  const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes services</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les services que vous proposez
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.length}</p>
              <p className="text-sm text-muted-foreground">Services total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Services actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Euro className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatPrice(services.length > 0 ? totalRevenue / services.length : 0)}
              </p>
              <p className="text-sm text-muted-foreground">Prix moyen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services list */}
      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucun service"
          description="Créez votre premier service pour que les clients puissent réserver"
          actionLabel="Créer un service"
          onAction={handleCreate}
        />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Service Dialog */}
      <ServiceDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        service={dialogState.service}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le service</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteDialog.service?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, service: null })}
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

export default PrestataireServicesPage;
