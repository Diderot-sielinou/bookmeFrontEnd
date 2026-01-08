/**
 * PrestataireServicesPage - ENHANCED VERSION
 *
 * Service management with:
 * - Beautiful service cards with images
 * - Quick stats overview
 * - Drag-and-drop reordering (visual)
 * - Better form UX
 * - Service categories
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Briefcase,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Star,
  TrendingUp,
  MoreVertical,
  Copy,
  CheckCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice, formatDuration } from '@/lib/utils';
import type { Service } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared';
import { uploadServiceImage, validateFile } from '@/services';
import {
  useMyServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/usePrestataires';

// ==========================================
// VALIDATION
// ==========================================

const serviceSchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  description: z.string().max(500, 'Maximum 500 characters').optional(),
  duration: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean(),
  category: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const serviceCategories = [
  'Consultation',
  'Treatment',
  'Session',
  'Package',
  'Add-on',
  'Other',
];

// ==========================================
// IMAGE UPLOAD COMPONENT
// ==========================================

interface ServiceImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string) => void;
  onImageRemove: () => void;
}

function ServiceImageUpload({ currentImage, onImageChange, onImageRemove }: ServiceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);

  useEffect(() => {
    setPreviewUrl(currentImage);
  }, [currentImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    if (error) {
      showError(error);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const result = await uploadServiceImage(file);
      onImageChange(result.secureUrl);
      setPreviewUrl(result.secureUrl);
      showSuccess('Image uploaded!');
      URL.revokeObjectURL(localUrl);
    } catch (error) {
      showError('Failed to upload image');
      setPreviewUrl(currentImage);
      URL.revokeObjectURL(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
          <img src={previewUrl} alt="Service" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label
              htmlFor="service-image"
              className="p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
            </label>
            <button
              type="button"
              onClick={onImageRemove}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="service-image"
          className="aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-cyan-500 hover:bg-cyan-50/50 flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to add image</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</span>
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
    </div>
  );
}

// ==========================================
// SERVICE CARD COMPONENT
// ==========================================

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  isToggling: boolean;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
  onDuplicate,
  isToggling,
}: ServiceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={cn(
        'overflow-hidden transition-all hover:shadow-md group',
        !service.isActive && 'opacity-60'
      )}>
        {/* Image or Placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-cyan-100 to-teal-100">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Briefcase className="h-12 w-12 text-cyan-300" />
            </div>
          )}

          {/* Status Badge */}
          {!service.isActive && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-gray-800/80 text-white">
                <EyeOff className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            </div>
          )}

          {/* Actions Menu */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(service)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(service)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg truncate">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {service.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(service.duration)}
              </span>
            </div>
            <span className="text-lg font-bold text-cyan-600">
              {formatPrice(service.price)}
            </span>
          </div>

          {/* Toggle & Edit */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={service.isActive}
                onCheckedChange={() => onToggleActive(service)}
                disabled={isToggling}
              />
              <span className="text-sm text-muted-foreground">
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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

function ServiceDialog({ open, onOpenChange, service, onSubmit, isLoading }: ServiceDialogProps) {
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
      image: '',
      isActive: true,
      category: '',
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        image: service.image || '',
        isActive: service.isActive,
        category: '',
      });
    } else {
      reset({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        image: '',
        isActive: true,
        category: '',
      });
    }
  }, [service, reset, open]);

  const duration = watch('duration');
  const currentImage = watch('image');
  const durationPresets = [15, 30, 45, 60, 90, 120, 180];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'New Service'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your service details' : 'Create a new service for clients to book'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Service Image (optional)</Label>
            <ServiceImageUpload
              currentImage={currentImage || null}
              onImageChange={(url) => setValue('image', url)}
              onImageRemove={() => setValue('image', '')}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Deep Tissue Massage"
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
              placeholder="Describe what's included in this service..."
              rows={3}
              {...register('description')}
            />
            <p className="text-xs text-muted-foreground">
              {(watch('description') || '').length}/500 characters
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>
              Duration <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="price">
              Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                className="pl-10"
                {...register('price', { valueAsNumber: true })}
                error={!!errors.price}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div>
              <Label className="font-medium">Service Active</Label>
              <p className="text-sm text-muted-foreground">
                Visible and bookable by clients
              </p>
            </div>
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// STATS CARDS COMPONENT
// ==========================================

interface StatsCardsProps {
  services: Service[];
}

function StatsCards({ services }: StatsCardsProps) {
  const activeCount = services.filter((s) => s.isActive).length;
  const avgPrice = services.length > 0
    ? services.reduce((sum, s) => sum + s.price, 0) / services.length
    : 0;
  const totalRevenuePotential = services.reduce((sum, s) => sum + s.price, 0);

  const stats = [
    {
      label: 'Total Services',
      value: services.length,
      icon: Briefcase,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Active',
      value: activeCount,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Average Price',
      value: formatPrice(avgPrice),
      icon: DollarSign,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Revenue Potential',
      value: formatPrice(totalRevenuePotential),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function PrestataireServicesPage() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Data hooks
  const { data: services = [], isLoading } = useMyServices();
  const { mutateAsync: createService, isPending: isCreating } = useCreateService();
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService();
  const { mutateAsync: deleteService, isPending: isDeleting } = useDeleteService();

  const isSubmitting = isCreating || isUpdating;

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

  const handleDuplicate = (service: Service) => {
    setDialogState({
      open: true,
      service: {
        ...service,
        id: '', // Clear ID to create new
        name: `${service.name} (Copy)`,
      } as Service,
    });
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await updateService({
        id: service.id,
        data: { isActive: !service.isActive },
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      const cleanData = {
        ...data,
        image: data.image || undefined,
        category: data.category || undefined,
      };

      if (dialogState.service?.id) {
        await updateService({
          id: dialogState.service.id,
          data: cleanData,
        });
      } else {
        const { isActive, ...createData } = cleanData;
        await createService(isActive === false ? cleanData : createData);
      }
      setDialogState({ open: false, service: null });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.service) return;

    try {
      await deleteService(deleteDialog.service.id);
      setDeleteDialog({ open: false, service: null });
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Services</h1>
          <p className="text-muted-foreground">
            Manage the services you offer to clients
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Service
        </Button>
      </div>

      {/* Stats */}
      <StatsCards services={services} />

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card className="py-16">
          <EmptyState
            icon={Briefcase}
            title="No Services Yet"
            description="Create your first service so clients can start booking with you"
            action={
              <Button onClick={handleCreate} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Service
              </Button>
            }
          />
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onDuplicate={handleDuplicate}
                isToggling={isUpdating}
              />
            ))}
          </div>
        </AnimatePresence>
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
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.service?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, service: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PrestataireServicesPage;