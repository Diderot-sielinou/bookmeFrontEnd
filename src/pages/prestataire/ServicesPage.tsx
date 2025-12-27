/**
 * Page Mes Services (Prestataire) - AVEC UPLOAD IMAGE
 *
 * Gestion des services proposés par le prestataire :
 * - Liste des services avec prix et durée
 * - Création/Modification/Suppression
 * - Upload d'image de service
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Euro,
  Briefcase,
  Loader2,
  Upload as UploadIcon,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { formatPrice, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";
import {
  Card,
  CardContent,
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
} from "@/components/ui";
import { showSuccess, showError } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared";

// Services
import { uploadServiceImage, validateFile } from "@/services";

// Hooks
import {
  useMyServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/usePrestataires";

// ==========================================
// VALIDATION
// ==========================================

const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères"),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
  duration: z
    .number()
    .min(15, "Minimum 15 minutes")
    .max(480, "Maximum 8 heures"),
  price: z.number().min(0, "Le prix doit être positif"),
  image: z.string().url("URL invalide").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// ==========================================
// IMAGE UPLOAD COMPONENT
// ==========================================

interface ServiceImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string) => void;
  onImageRemove: () => void;
}

function ServiceImageUpload({
  currentImage,
  onImageChange,
  onImageRemove,
}: ServiceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);

  useEffect(() => {
    setPreviewUrl(currentImage);
  }, [currentImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    });

    if (error) {
      showError(error);
      return;
    }

    // Preview local
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const result = await uploadServiceImage(file);
      onImageChange(result.secureUrl);
      setPreviewUrl(result.secureUrl);
      showSuccess("Image ajoutée !");
      URL.revokeObjectURL(localUrl);
    } catch (error) {
      showError("Impossible d'uploader l'image");
      setPreviewUrl(currentImage);
      URL.revokeObjectURL(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageRemove();
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
          <img
            src={previewUrl}
            alt="Service"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="service-image"
          className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Ajouter une image (optionnel)
              </span>
            </>
          )}
        </label>
      )}

      <input
        id="service-image"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageChange}
        disabled={isUploading}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Format : JPEG, PNG, GIF ou WebP • Max 5 Mo
      </p>
    </div>
  );
}

// ==========================================
// SERVICE CARD
// ==========================================

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  isToggling: boolean;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
  isToggling,
}: ServiceCardProps) {
  return (
    <Card className={!service.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Image */}
          {service.image && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Service info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{service.name}</h3>
              {!service.isActive && <Badge variant="secondary">Inactif</Badge>}
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
              disabled={isToggling}
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
      name: "",
      description: "",
      duration: 60,
      price: 0,
      image: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or service changes
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        image: service.image || "",
        isActive: service.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        image: "",
        isActive: true,
      });
    }
  }, [service, reset, open]);

  const duration = watch("duration");
  const currentImage = watch("image");

  // Preset durations
  const durationPresets = [15, 30, 45, 60, 90, 120];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le service" : "Nouveau service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de ce service"
              : "Créez un nouveau service pour vos clients"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image du service</Label>
            <ServiceImageUpload
              currentImage={currentImage || null}
              onImageChange={(url) => setValue("image", url)}
              onImageRemove={() => setValue("image", "")}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du service *</Label>
            <Input
              id="name"
              placeholder="Ex: Coupe homme"
              {...register("name")}
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
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
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
                  variant={duration === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("duration", preset)}
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
                {...register("duration", { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
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
                {...register("price", { valueAsNumber: true })}
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
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Enregistrer" : "Créer le service"}
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
  // Dialog states
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  // ==========================================
  // HOOKS - Connexion au backend via React Query
  // ==========================================

  const { data: services = [], isLoading } = useMyServices();
  const { mutateAsync: createService, isPending: isCreating } =
    useCreateService();
  const { mutateAsync: updateService, isPending: isUpdating } =
    useUpdateService();
  const { mutateAsync: deleteService, isPending: isDeleting } =
    useDeleteService();

  const isSubmitting = isCreating || isUpdating;

  // ==========================================
  // HANDLERS
  // ==========================================

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
      await updateService({
        id: service.id,
        data: { isActive: !service.isActive },
      });
    } catch (error) {
      // Erreur gérée dans le hook
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      // ✅ Nettoyer les données avant envoi
      const cleanData = {
        ...data,
        image: data.image || undefined, // Convertir "" en undefined
      };

      if (dialogState.service) {
        // Update
        await updateService({
          id: dialogState.service.id,
          data: cleanData,
        });
      } else {
        // Create - retirer isActive si true (valeur par défaut backend)
        const { isActive, ...createData } = cleanData;
        await createService(isActive === false ? cleanData : createData);
      }
      setDialogState({ open: false, service: null });
    } catch (error) {
      // Erreur gérée dans le hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.service) return;

    try {
      await deleteService(deleteDialog.service.id);
      setDeleteDialog({ open: false, service: null });
    } catch (error) {
      // Erreur gérée dans le hook
    }
  };

  // ==========================================
  // STATS
  // ==========================================

  const activeCount = services.filter((s) => s.isActive).length;
  const avgPrice =
    services.length > 0
      ? services.reduce((sum, s) => sum + s.price, 0) / services.length
      : 0;

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
    return <LoadingSpinner />;
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
              <p className="text-2xl font-bold">{formatPrice(avgPrice)}</p>
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
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un service
            </Button>
          }
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
              isToggling={isUpdating}
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
              Êtes-vous sûr de vouloir supprimer "{deleteDialog.service?.name}"
              ? Cette action est irréversible.
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
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PrestataireServicesPage;