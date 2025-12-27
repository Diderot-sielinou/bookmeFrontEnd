/**
 * Page Profil (Client)
 * ALIGNÉ AVEC BACKEND - Upload avatar fonctionnel
 *
 * Gestion du profil utilisateur client :
 * - Informations personnelles
 * - Changement de photo de profil
 * - Changement de mot de passe
 * - Préférences de notification
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
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} caractères`
      )
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
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

    // Validation du fichier
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
      // 1. Upload l'image vers Cloudinary via le backend
      const uploadResult = await uploadAvatar(file);

      // 2. Mettre à jour le profil avec la nouvelle URL d'avatar
      await onAvatarChange(uploadResult.url);

      showSuccess("Photo de profil mise à jour");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      // Reset l'input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      // Supprimer l'avatar (mettre à null)
      await onAvatarChange(null);
      showSuccess("Photo de profil supprimée");
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

        {/* Overlay au hover */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Changer la photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              {currentAvatar && (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                  title="Supprimer la photo"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Bouton visible sur mobile */}
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

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la photo de profil ?</DialogTitle>
            <DialogDescription>
              Votre photo de profil sera remplacée par vos initiales. Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAvatar}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
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
          <Label htmlFor="firstName">Prénom *</Label>
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
          <Label htmlFor="lastName">Nom *</Label>
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
        <Label htmlFor="phone">Téléphone</Label>
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
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
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
        <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
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
        <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
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
          8 caractères minimum, 1 majuscule, 1 chiffre
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
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
            Modification...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Changer le mot de passe
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
            <p className="font-medium">Rappels par email</p>
            <p className="text-sm text-muted-foreground">
              Recevoir des rappels avant vos rendez-vous
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
            <p className="font-medium">Emails marketing</p>
            <p className="text-sm text-muted-foreground">
              Recevoir des offres et actualités
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
            <p className="font-medium">Notifications push</p>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications sur votre appareil
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
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les préférences
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
   * Mise à jour de l'avatar
   * 1. Upload via /upload/avatar
   * 2. Mise à jour du profil via PATCH /users/clients/me
   */
  const handleAvatarChange = async (avatarUrl: string | null) => {
    try {
      // Mettre à jour le profil avec la nouvelle URL d'avatar
      const updatedProfile = await updateMyClientProfile({
        avatar: avatarUrl as string,
      });

      // Mettre à jour le state local
      updateProfile(updatedProfile);
    } catch (error) {
      throw error; // Re-throw pour que le composant AvatarUpload puisse afficher l'erreur
    }
  };

  /**
   * Mise à jour des informations du profil
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
      showSuccess("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Profile update error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Changement de mot de passe
   */
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess("Mot de passe modifié avec succès");
    } catch (error) {
      console.error("Password change error:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Changement des préférences de notification
   */
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Sauvegarde des préférences de notification
   */
  const handleNotificationsSave = async () => {
    setIsUpdatingNotifications(true);
    try {
      // TODO: Appeler l'API pour sauvegarder les préférences
      // await updateNotificationPreferences(notifications);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulation
      showSuccess("Préférences de notification enregistrées");
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
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* Avatar & Email Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar avec upload */}
            <AvatarUpload
              currentAvatar={clientProfile.avatar}
              firstName={clientProfile.firstName}
              lastName={clientProfile.lastName}
              onAvatarChange={handleAvatarChange}
              isUploading={isUploadingAvatar}
              setIsUploading={setIsUploadingAvatar}
            />

            {/* Informations utilisateur */}
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
                  ✓ Email vérifié
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Survolez la photo pour la modifier
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
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Informations personnelles */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations de contact
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

        {/* Tab: Sécurité */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>
                Modifiez votre mot de passe de connexion
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
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Configurez comment vous souhaitez être notifié
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