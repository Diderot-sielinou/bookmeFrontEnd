/**
 * Page Profil (Client)
 * 
 * Gestion du profil utilisateur client :
 * - Informations personnelles
 * - Changement de mot de passe
 * - Préférences de notification
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services';
import { VALIDATION } from '@/lib/constants';
import type { Client } from '@/types';
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
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} caractères`)
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

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
      phone: profile.phone || '',
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
            {...register('firstName')}
            error={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            leftIcon={<User className="h-4 w-4" />}
            {...register('lastName')}
            error={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
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
          {...register('phone')}
        />
      </div>

      <Button type="submit" disabled={!isDirty} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Enregistrer les modifications
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
            type={showPasswords.current ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('currentPassword')}
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
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('newPassword')}
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
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
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
            type={showPasswords.confirm ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('confirmPassword')}
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
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading}>
        <Lock className="h-4 w-4 mr-2" />
        Changer le mot de passe
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
            onCheckedChange={(checked) => onChange('emailReminders', checked)}
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
            onCheckedChange={(checked) => onChange('emailMarketing', checked)}
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
            onCheckedChange={(checked) => onChange('pushNotifications', checked)}
          />
        </div>
      </div>

      <Button onClick={onSave} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Enregistrer les préférences
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

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    emailMarketing: false,
    pushNotifications: true,
  });

  // Handlers
  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await authService.updateClientProfile(data);
      updateProfile(updated);
      showSuccess('Profil mis à jour');
    } catch (error) {
      showError('Impossible de mettre à jour le profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Mot de passe modifié');
    } catch (error) {
      showError('Impossible de modifier le mot de passe');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handleNotificationsSave = async () => {
    setIsUpdatingNotifications(true);
    try {
      // API call to save preferences
      await new Promise((resolve) => setTimeout(resolve, 500));
      showSuccess('Préférences enregistrées');
    } catch (error) {
      showError('Impossible de sauvegarder les préférences');
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

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

      {/* Avatar & Email */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={clientProfile.avatar}
                firstName={clientProfile.firstName}
                lastName={clientProfile.lastName}
                size="2xl"
              />
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {clientProfile.firstName} {clientProfile.lastName}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              {user?.emailVerified && (
                <span className="inline-flex items-center text-xs text-green-600 mt-1">
                  ✓ Email vérifié
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

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
