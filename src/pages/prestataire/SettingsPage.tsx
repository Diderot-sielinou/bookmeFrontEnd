/**
 * Settings Page (Provider) - ALIGNED WITH BACKEND
 *
 * Provider account configuration:
 * - Public profile with avatar and portfolio upload
 * - Booking settings (aligned with backend DTOs)
 * - Notifications (uses NotificationPreferences)
 * - Password
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Bell,
  Calendar,
  Save,
  Camera,
  Upload,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  authService,
  uploadAvatar,
  uploadPortfolioImages,
  validateFile,
  deleteFile,
} from "@/services";
import { PROFESSIONAL_CATEGORIES, VALIDATION } from "@/lib/constants";
import type { Prestataire, NotificationPreferences } from "@/types";
import type { UpdatePrestataireDto } from "@/types/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Avatar,
  Switch,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { showSuccess, showError } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const profileSchema = z.object({
  businessName: z.string().min(2, "Minimum 2 characters"),
  firstName: z.string().min(2, "Minimum 2 characters"),
  lastName: z.string().min(2, "Minimum 2 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  bio: z.string().max(500, "Maximum 500 characters").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

const bookingSettingsSchema = z.object({
  minBookingNotice: z.number().min(0), // In HOURS
  pauseDuration: z.number().min(0), // In MINUTES
  minCancellationHours: z.number().min(0), // In HOURS
  cancellationPolicy: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
      )
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one digit"),
    confirmPassword: z.string().min(1, "Confirmation required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type BookingSettingsData = z.infer<typeof bookingSettingsSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ==========================================
// AVATAR UPLOAD COMPONENT
// ==========================================

interface AvatarUploadProps {
  currentAvatar: string | null;
  firstName: string;
  lastName: string;
  onAvatarChange: (url: string) => Promise<void>;
}

function AvatarUpload({
  currentAvatar,
  firstName,
  lastName,
  onAvatarChange,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation before upload
    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    });

    if (error) {
      showError(error);
      return;
    }

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      // Upload to Cloudinary via backend
      const result = await uploadAvatar(file);

      // Update profile with secure URL
      await onAvatarChange(result.secureUrl);

      showSuccess("Avatar updated!");

      // Clean up local URL
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(result.secureUrl);
    } catch (error) {
      showError("Unable to upload avatar");
      setPreviewUrl(currentAvatar);
      URL.revokeObjectURL(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar
        src={previewUrl}
        firstName={firstName}
        lastName={lastName}
        size="2xl"
      />
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors cursor-pointer"
      >
        {isUploading ? (
          <div className="animate-spin">⏳</div>
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleAvatarChange}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
}

// ==========================================
// PORTFOLIO UPLOAD COMPONENT
// ==========================================

interface PortfolioUploadProps {
  currentImages: string[];
  onImagesChange: (urls: string[]) => Promise<void>;
  maxImages?: number;
}

function PortfolioUpload({ 
  currentImages, 
  onImagesChange,
  maxImages = 10 
}: PortfolioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images
    if (previews.length + files.length > maxImages) {
      showError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const error = validateFile(file, {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      });
      if (error) {
        showError(`${file.name}: ${error}`);
        return;
      }
    }

    // Create local previews
    const localUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...localUrls]);

    setIsUploading(true);
    try {
      console.log(`Uploading ${files.length} files...`);
      
      // Upload ALL images in a single request
      const results = await uploadPortfolioImages(files);
      
      console.log('Upload successful:', results);
      
      // Extract secure URLs
      const uploadedUrls = results.map(r => r.secureUrl);
      
      // Update with real URLs
      const newImages = [...currentImages, ...uploadedUrls];
      await onImagesChange(newImages);
      setPreviews(newImages);
      
      showSuccess(`${files.length} image(s) added!`);
      
      // Clean up local URLs
      localUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (error) {
      console.error('Upload failed:', error);
      showError("Unable to upload images");
      setPreviews(currentImages);
      localUrls.forEach(url => URL.revokeObjectURL(url));
    } finally {
      setIsUploading(false);
      // Reset input to allow re-uploading same files
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = previews[index];
    const newImages = previews.filter((_, i) => i !== index);
    
    try {
      // Delete from Cloudinary if it's a real URL
      if (imageToRemove.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/cloud/image/upload/v123456/folder/public_id.ext
        const parts = imageToRemove.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && parts.length > uploadIndex + 1) {
          // public_id is after 'upload' and can contain multiple segments
          const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
          const publicId = publicIdWithExt.split('.')[0]; // Remove extension
          
          console.log('Deleting file:', publicId);
          await deleteFile(publicId);
        }
      }
      
      await onImagesChange(newImages);
      setPreviews(newImages);
      showSuccess('Image deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      showError("Unable to delete image");
    }
  };

  return (
    <div className="space-y-4">
      {/* Image grid */}
      <div className="grid grid-cols-3 gap-4">
        {previews.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
            <img 
              src={url} 
              alt={`Portfolio ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {/* Add button */}
        {previews.length < maxImages && (
          <label 
            htmlFor="portfolio-upload"
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            {isUploading ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add</span>
              </>
            )}
          </label>
        )}
      </div>

      <input
        id="portfolio-upload"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleImagesChange}
        disabled={isUploading || previews.length >= maxImages}
        className="hidden"
      />

      <p className="text-sm text-muted-foreground">
        {previews.length} / {maxImages} images • Max 5 MB per image
      </p>
    </div>
  );
}

// ==========================================
// PROFILE FORM
// ==========================================

interface ProfileFormProps {
  profile: Prestataire;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onAvatarChange: (url: string) => Promise<void>;
  onPortfolioChange: (urls: string[]) => Promise<void>;
  isLoading: boolean;
}

function ProfileForm({
  profile,
  onSubmit,
  onAvatarChange,
  onPortfolioChange,
  isLoading,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: profile.businessName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
      bio: profile.bio || "",
      address: profile.address || "",
      city: profile.city || "",
      postalCode: profile.postalCode || "",
    },
  });

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="space-y-4">
        <Label>Profile Photo</Label>
        <AvatarUpload
          currentAvatar={profile.avatar}
          firstName={profile.firstName}
          lastName={profile.lastName}
          onAvatarChange={onAvatarChange}
        />
      </div>

      <Separator />

      {/* Portfolio */}
      <div className="space-y-4">
        <div>
          <Label>Portfolio</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add up to 10 images of your work
          </p>
        </div>
        <PortfolioUpload
          currentImages={profile.portfolioImages || []}
          onImagesChange={onPortfolioChange}
          maxImages={10}
        />
      </div>

      <Separator />

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            leftIcon={<Building className="h-4 w-4" />}
            {...register("businessName")}
            error={!!errors.businessName}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">
              {errors.businessName.message}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              error={!!errors.firstName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              error={!!errors.lastName}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            {...register("phone")}
            error={!!errors.phone}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Introduce yourself and your services..."
            rows={4}
            {...register("bio")}
          />
          <p className="text-xs text-muted-foreground">
            Maximum 500 characters
          </p>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              leftIcon={<MapPin className="h-4 w-4" />}
              placeholder="123 Main Street"
              {...register("address")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={!isDirty} isLoading={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Information
        </Button>
      </form>
    </div>
  );
}

// ==========================================
// BOOKING SETTINGS FORM - BACKEND ALIGNED
// ==========================================

interface BookingSettingsFormProps {
  settings: BookingSettingsData;
  onSubmit: (data: BookingSettingsData) => Promise<void>;
  isLoading: boolean;
}

function BookingSettingsForm({
  settings,
  onSubmit,
  isLoading,
}: BookingSettingsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<BookingSettingsData>({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: settings,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Min booking notice - IN HOURS */}
      <div className="space-y-2">
        <Label>Minimum Booking Notice</Label>
        <Select
          value={String(watch("minBookingNotice"))}
          onValueChange={(v) =>
            setValue("minBookingNotice", Number(v), { shouldDirty: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No delay</SelectItem>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="2">2 hours</SelectItem>
            <SelectItem value="4">4 hours</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
            <SelectItem value="48">48 hours</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Minimum time before a client can book
        </p>
      </div>

      {/* Pause duration - IN MINUTES */}
      <div className="space-y-2">
        <Label>Break Between Appointments</Label>
        <Select
          value={String(watch("pauseDuration"))}
          onValueChange={(v) =>
            setValue("pauseDuration", Number(v), { shouldDirty: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No break</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Break duration between each appointment
        </p>
      </div>

      {/* Min cancellation hours - IN HOURS */}
      <div className="space-y-2">
        <Label>Minimum Cancellation Notice</Label>
        <Select
          value={String(watch("minCancellationHours"))}
          onValueChange={(v) =>
            setValue("minCancellationHours", Number(v), { shouldDirty: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No delay</SelectItem>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="2">2 hours</SelectItem>
            <SelectItem value="4">4 hours</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
            <SelectItem value="48">48 hours</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Minimum time for a client to cancel
        </p>
      </div>

      <Separator />

      {/* Cancellation policy */}
      <div className="space-y-2">
        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
        <Textarea
          id="cancellationPolicy"
          placeholder="Describe your cancellation policy..."
          rows={3}
          {...register("cancellationPolicy")}
        />
      </div>

      <Button type="submit" disabled={!isDirty} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </form>
  );
}

// ==========================================
// NOTIFICATIONS FORM - USES NotificationPreferences
// ==========================================

interface NotificationsFormProps {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  isLoading: boolean;
}

function NotificationsForm({ preferences, onSave, isLoading }: NotificationsFormProps) {
  // Use default values if preferences is undefined
  const defaultPrefs: NotificationPreferences = {
    email: true,
    push: true,
    sms: false,
  };
  
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(
    preferences || defaultPrefs // Protection against undefined
  );

  const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSave(localPrefs);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Email</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications by email
            </p>
          </div>
          <Switch
            checked={localPrefs.email}
            onCheckedChange={(checked) => handleChange('email', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Notifications on your device
            </p>
          </div>
          <Switch
            checked={localPrefs.push}
            onCheckedChange={(checked) => handleChange('push', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">SMS</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications by SMS
            </p>
          </div>
          <Switch
            checked={localPrefs.sms}
            onCheckedChange={(checked) => handleChange('sms', checked)}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  );
}

// ==========================================
// PASSWORD FORM
// ==========================================

function PasswordForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: PasswordFormData) => Promise<void>;
  isLoading: boolean;
}) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleFormSubmit = async (data: PasswordFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showPasswords.current ? "text" : "password"}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register("currentPassword")}
            error={!!errors.currentPassword}
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((p) => ({ ...p, current: !p.current }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPasswords.current ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.new ? "text" : "password"}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register("newPassword")}
            error={!!errors.newPassword}
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPasswords.new ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading}>
        <Lock className="h-4 w-4 mr-2" />
        Change Password
      </Button>
    </form>
  );
}

// ==========================================
// MAIN PAGE - BACKEND ALIGNED
// ==========================================

export function PrestataireSettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const prestataireProfile = profile as Prestataire | null;

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Initialize with backend values
  const [bookingSettings, setBookingSettings] = useState<BookingSettingsData>({
    minBookingNotice: prestataireProfile?.minBookingNotice || 0,
    pauseDuration: prestataireProfile?.pauseDuration || 0,
    minCancellationHours: prestataireProfile?.minCancellationHours || 0,
    cancellationPolicy: prestataireProfile?.cancellationPolicy || "",
  });

  // Sync when profile changes
  useEffect(() => {
    if (prestataireProfile) {
      setBookingSettings({
        minBookingNotice: prestataireProfile.minBookingNotice,
        pauseDuration: prestataireProfile.pauseDuration,
        minCancellationHours: prestataireProfile.minCancellationHours,
        cancellationPolicy: prestataireProfile.cancellationPolicy || "",
      });
    }
  }, [prestataireProfile]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await authService.updatePrestataireProfile(data);
      updateProfile(updated);
      showSuccess("Profile updated");
    } catch (error) {
      showError("Unable to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      const updated = await authService.updatePrestataireProfile({
        avatar: avatarUrl,
      });
      updateProfile(updated);
    } catch (error) {
      throw error; // Re-throw to handle in component
    }
  };

  const handlePortfolioChange = async (portfolioUrls: string[]) => {
    try {
      const updated = await authService.updatePrestataireProfile({
        portfolioImages: portfolioUrls,
      });
      updateProfile(updated);
    } catch (error) {
      throw error;
    }
  };

  const handleBookingSubmit = async (data: BookingSettingsData) => {
    setIsUpdatingBooking(true);
    try {
      // Send to backend with UpdatePrestataireDto
      const updated = await authService.updatePrestataireProfile({
        minBookingNotice: data.minBookingNotice,
        pauseDuration: data.pauseDuration,
        minCancellationHours: data.minCancellationHours,
        cancellationPolicy: data.cancellationPolicy,
      });

      updateProfile(updated);
      setBookingSettings(data);
      showSuccess("Booking settings updated");
    } catch (error) {
      showError("Unable to save");
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess("Password changed");
    } catch (error) {
      showError("Unable to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleNotificationsSave = async (
    preferences: NotificationPreferences
  ) => {
    setIsUpdatingNotifications(true);
    try {
      // Send with UpdatePrestataireDto
      const updated = await authService.updatePrestataireProfile({
        notificationPreferences: preferences,
      });

      updateProfile(updated);
      showSuccess("Preferences saved");
    } catch (error) {
      showError("Unable to save");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  if (!prestataireProfile) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Initialize notificationPreferences with default values if absent
  const notificationPrefs: NotificationPreferences = prestataireProfile.notificationPreferences || {
    email: true,
    push: true,
    sms: false,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your account and preferences
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div>
              <Avatar
                src={prestataireProfile.avatar}
                firstName={prestataireProfile.firstName}
                lastName={prestataireProfile.lastName}
                size="2xl"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {prestataireProfile.businessName}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {prestataireProfile.categories?.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Calendar className="h-4 w-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Information</CardTitle>
              <CardDescription>
                This information is visible to your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                profile={prestataireProfile}
                onSubmit={handleProfileSubmit}
                onAvatarChange={handleAvatarChange}
                onPortfolioChange={handlePortfolioChange}
                isLoading={isUpdatingProfile}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>
                Configure how clients can book with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingSettingsForm
                settings={bookingSettings}
                onSubmit={handleBookingSubmit}
                isLoading={isUpdatingBooking}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsForm
                preferences={notificationPrefs}
                onSave={handleNotificationsSave}
                isLoading={isUpdatingNotifications}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your login password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm
                onSubmit={handlePasswordSubmit}
                isLoading={isUpdatingPassword}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PrestataireSettingsPage;