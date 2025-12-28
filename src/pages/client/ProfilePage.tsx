/**
 * Profile Page (Client)
 * ALIGNED WITH BACKEND - Functional avatar upload
 *
 * User profile management for clients:
 * - Personal information
 * - Profile photo change
 * - Password change
 * - Notification preferences
 */

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  updateMyClientProfile,
  uploadAvatar,
  validateFile,
  deleteFile,
} from "@/services";
import { authService } from "@/services";
import { VALIDATION } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api";
import type { Client } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Avatar,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/components/ui/toast";

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const profileSchema = z.object({
  firstName: z.string().min(2, "Minimum 2 characters"),
  lastName: z.string().min(2, "Minimum 2 characters"),
  phone: z.string().optional(),
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
type PasswordFormData = z.infer<typeof passwordSchema>;

// ==========================================
// AVATAR UPLOAD COMPONENT
// ==========================================

interface AvatarUploadProps {
  currentAvatar: string | null;
  firstName: string;
  lastName: string;
  onAvatarChange: (url: string | null) => Promise<void>;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

function AvatarUpload({
  currentAvatar,
  firstName,
  lastName,
  onAvatarChange,
  isUploading,
  setIsUploading,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    const validationError = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    });

    if (validationError) {
      showError(validationError);
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload image to Cloudinary via backend
      const uploadResult = await uploadAvatar(file);

      // 2. Update profile with new avatar URL
      await onAvatarChange(uploadResult.url);

      showSuccess("Profile photo updated");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      // Reset input to allow re-selecting same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      // Delete avatar (set to null)
      await onAvatarChange(null);
      showSuccess("Profile photo deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Avatar
          src={currentAvatar}
          firstName={firstName}
          lastName={lastName}
          size="2xl"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Change photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              {currentAvatar && (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                  title="Delete photo"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors md:hidden"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile Photo?</DialogTitle>
            <DialogDescription>
              Your profile photo will be replaced with your initials. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAvatar}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ==========================================
// PROFILE FORM
// ==========================================

interface ProfileFormProps {
  profile: Client;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
}

function ProfileForm({ profile, onSubmit, isLoading }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            leftIcon={<User className="h-4 w-4" />}
            {...register("firstName")}
            error={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            leftIcon={<User className="h-4 w-4" />}
            {...register("lastName")}
            error={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          placeholder="06 12 34 56 78"
          {...register("phone")}
        />
      </div>

      <Button type="submit" disabled={!isDirty || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}

// ==========================================
// PASSWORD FORM
// ==========================================

interface PasswordFormProps {
  onSubmit: (data: PasswordFormData) => Promise<void>;
  isLoading: boolean;
}

function PasswordForm({ onSubmit, isLoading }: PasswordFormProps) {
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
        <Label htmlFor="currentPassword">Current Password *</Label>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
        <Label htmlFor="newPassword">New Password *</Label>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
        <p className="text-xs text-muted-foreground">
          8 characters minimum, 1 uppercase, 1 digit
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Changing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </>
        )}
      </Button>
    </form>
  );
}

// ==========================================
// NOTIFICATIONS FORM
// ==========================================

interface NotificationsFormProps {
  preferences: {
    emailReminders: boolean;
    emailMarketing: boolean;
    pushNotifications: boolean;
  };
  onChange: (key: string, value: boolean) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

function NotificationsForm({
  preferences,
  onChange,
  onSave,
  isLoading,
}: NotificationsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Email Reminders</p>
            <p className="text-sm text-muted-foreground">
              Receive reminders before your appointments
            </p>
          </div>
          <Switch
            checked={preferences.emailReminders}
            onCheckedChange={(checked) => onChange("emailReminders", checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Marketing Emails</p>
            <p className="text-sm text-muted-foreground">
              Receive offers and updates
            </p>
          </div>
          <Switch
            checked={preferences.emailMarketing}
            onCheckedChange={(checked) => onChange("emailMarketing", checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications on your device
            </p>
          </div>
          <Switch
            checked={preferences.pushNotifications}
            onCheckedChange={(checked) =>
              onChange("pushNotifications", checked)
            }
          />
        </div>
      </div>

      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </>
        )}
      </Button>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function ClientProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const clientProfile = profile as Client | null;

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    emailMarketing: false,
    pushNotifications: true,
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  /**
   * Avatar update
   * 1. Upload via /upload/avatar
   * 2. Update profile via PATCH /users/clients/me
   */
  const handleAvatarChange = async (avatarUrl: string | null) => {
    try {
      // Update profile with new avatar URL
      const updatedProfile = await updateMyClientProfile({
        avatar: avatarUrl as string,
      });

      // Update local state
      updateProfile(updatedProfile);
    } catch (error) {
      throw error; // Re-throw so AvatarUpload can display error
    }
  };

  /**
   * Profile information update
   */
  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updatedProfile = await updateMyClientProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });

      updateProfile(updatedProfile);
      showSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Password change
   */
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Notification preferences change
   */
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Save notification preferences
   */
  const handleNotificationsSave = async () => {
    setIsUpdatingNotifications(true);
    try {
      // TODO: Call API to save preferences
      // await updateNotificationPreferences(notifications);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulation
      showSuccess("Notification preferences saved");
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (!clientProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Avatar & Email Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with upload */}
            <AvatarUpload
              currentAvatar={clientProfile.avatar}
              firstName={clientProfile.firstName}
              lastName={clientProfile.lastName}
              onAvatarChange={handleAvatarChange}
              isUploading={isUploadingAvatar}
              setIsUploading={setIsUploadingAvatar}
            />

            {/* User information */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">
                {clientProfile.firstName} {clientProfile.lastName}
              </h2>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              {user?.emailVerified && (
                <span className="inline-flex items-center text-xs text-green-600 mt-2">
                  ✓ Email verified
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Hover over photo to change
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Information</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Personal information */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                profile={clientProfile}
                onSubmit={handleProfileSubmit}
                isLoading={isUpdatingProfile}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Security */}
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

        {/* Tab: Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsForm
                preferences={notifications}
                onChange={handleNotificationChange}
                onSave={handleNotificationsSave}
                isLoading={isUpdatingNotifications}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ClientProfilePage;
