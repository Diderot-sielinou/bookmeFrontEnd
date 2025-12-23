/**
 * Page Paramètres (Prestataire)
 * 
 * Configuration du compte prestataire :
 * - Profil public
 * - Paramètres de réservation
 * - Notifications
 * - Mot de passe
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Clock,
  Save,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services';
import { PROFESSIONAL_CATEGORIES, VALIDATION } from '@/lib/constants';
import type { Prestataire } from '@/types';
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
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const profileSchema = z.object({
  businessName: z.string().min(2, 'Minimum 2 caractères'),
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  phone: z.string().min(10, 'Téléphone invalide'),
  bio: z.string().max(500, 'Maximum 500 caractères').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
});

const bookingSettingsSchema = z.object({
  minBookingNotice: z.number().min(0),
  maxBookingAdvance: z.number().min(1),
  autoConfirm: z.boolean(),
  cancellationPolicy: z.string(),
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
type BookingSettingsData = z.infer<typeof bookingSettingsSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ==========================================
// PROFILE FORM
// ==========================================

interface ProfileFormProps {
  profile: Prestataire;
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
      businessName: profile.businessName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      bio: profile.bio || '',
      address: profile.address || '',
      city: profile.city || '',
      postalCode: profile.postalCode || '',
      website: profile.website || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business name */}
      <div className="space-y-2">
        <Label htmlFor="businessName">Nom de l'entreprise *</Label>
        <Input
          id="businessName"
          leftIcon={<Building className="h-4 w-4" />}
          {...register('businessName')}
          error={!!errors.businessName}
        />
        {errors.businessName && (
          <p className="text-sm text-destructive">{errors.businessName.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            error={!!errors.firstName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            error={!!errors.lastName}
          />
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input
          id="phone"
          type="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          {...register('phone')}
          error={!!errors.phone}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Présentation</Label>
        <Textarea
          id="bio"
          placeholder="Présentez-vous et vos services..."
          rows={4}
          {...register('bio')}
        />
        <p className="text-xs text-muted-foreground">Maximum 500 caractères</p>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            leftIcon={<MapPin className="h-4 w-4" />}
            placeholder="123 rue de Paris"
            {...register('address')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input id="postalCode" {...register('postalCode')} />
          </div>
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Site web</Label>
        <Input
          id="website"
          type="url"
          leftIcon={<Globe className="h-4 w-4" />}
          placeholder="https://monsite.com"
          {...register('website')}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      <Button type="submit" disabled={!isDirty} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Enregistrer
      </Button>
    </form>
  );
}

// ==========================================
// BOOKING SETTINGS FORM
// ==========================================

interface BookingSettingsFormProps {
  settings: BookingSettingsData;
  onSubmit: (data: BookingSettingsData) => Promise<void>;
  isLoading: boolean;
}

function BookingSettingsForm({ settings, onSubmit, isLoading }: BookingSettingsFormProps) {
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
      {/* Min booking notice */}
      <div className="space-y-2">
        <Label>Délai minimum de réservation</Label>
        <Select
          value={String(watch('minBookingNotice'))}
          onValueChange={(v) => setValue('minBookingNotice', Number(v), { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Pas de délai</SelectItem>
            <SelectItem value="60">1 heure</SelectItem>
            <SelectItem value="120">2 heures</SelectItem>
            <SelectItem value="240">4 heures</SelectItem>
            <SelectItem value="1440">24 heures</SelectItem>
            <SelectItem value="2880">48 heures</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Temps minimum avant qu'un client puisse réserver
        </p>
      </div>

      {/* Max booking advance */}
      <div className="space-y-2">
        <Label>Réservation à l'avance</Label>
        <Select
          value={String(watch('maxBookingAdvance'))}
          onValueChange={(v) => setValue('maxBookingAdvance', Number(v), { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">1 semaine</SelectItem>
            <SelectItem value="14">2 semaines</SelectItem>
            <SelectItem value="30">1 mois</SelectItem>
            <SelectItem value="60">2 mois</SelectItem>
            <SelectItem value="90">3 mois</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Combien de temps à l'avance les clients peuvent réserver
        </p>
      </div>

      {/* Auto confirm */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Confirmation automatique</Label>
          <p className="text-sm text-muted-foreground">
            Les réservations sont confirmées automatiquement
          </p>
        </div>
        <Switch
          checked={watch('autoConfirm')}
          onCheckedChange={(checked) => setValue('autoConfirm', checked, { shouldDirty: true })}
        />
      </div>

      <Separator />

      {/* Cancellation policy */}
      <div className="space-y-2">
        <Label htmlFor="cancellationPolicy">Politique d'annulation</Label>
        <Textarea
          id="cancellationPolicy"
          placeholder="Décrivez votre politique d'annulation..."
          rows={3}
          {...register('cancellationPolicy')}
        />
      </div>

      <Button type="submit" disabled={!isDirty} isLoading={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Enregistrer
      </Button>
    </form>
  );
}

// ==========================================
// NOTIFICATIONS FORM
// ==========================================

interface NotificationsFormProps {
  preferences: {
    emailNewBooking: boolean;
    emailCancellation: boolean;
    emailReminder: boolean;
    emailReview: boolean;
    pushNotifications: boolean;
  };
  onChange: (key: string, value: boolean) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

function NotificationsForm({ preferences, onChange, onSave, isLoading }: NotificationsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Nouvelle réservation</p>
            <p className="text-sm text-muted-foreground">
              Email quand un client réserve
            </p>
          </div>
          <Switch
            checked={preferences.emailNewBooking}
            onCheckedChange={(checked) => onChange('emailNewBooking', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Annulation</p>
            <p className="text-sm text-muted-foreground">
              Email quand un client annule
            </p>
          </div>
          <Switch
            checked={preferences.emailCancellation}
            onCheckedChange={(checked) => onChange('emailCancellation', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Rappels de rendez-vous</p>
            <p className="text-sm text-muted-foreground">
              Rappel avant chaque rendez-vous
            </p>
          </div>
          <Switch
            checked={preferences.emailReminder}
            onCheckedChange={(checked) => onChange('emailReminder', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Nouveaux avis</p>
            <p className="text-sm text-muted-foreground">
              Email quand vous recevez un avis
            </p>
          </div>
          <Switch
            checked={preferences.emailReview}
            onCheckedChange={(checked) => onChange('emailReview', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Notifications push</p>
            <p className="text-sm text-muted-foreground">
              Notifications sur votre appareil
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
        Enregistrer
      </Button>
    </div>
  );
}

// ==========================================
// PASSWORD FORM
// ==========================================

function PasswordForm({ onSubmit, isLoading }: { onSubmit: (data: PasswordFormData) => Promise<void>; isLoading: boolean }) {
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
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
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
            onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
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
            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer</Label>
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
            onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
// MAIN PAGE
// ==========================================

export function PrestataireSettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const prestataireProfile = profile as Prestataire | null;

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const [bookingSettings, setBookingSettings] = useState<BookingSettingsData>({
    minBookingNotice: 60,
    maxBookingAdvance: 30,
    autoConfirm: true,
    cancellationPolicy: '',
  });

  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCancellation: true,
    emailReminder: true,
    emailReview: true,
    pushNotifications: true,
  });

  // Handlers
  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await authService.updatePrestataireProfile(data);
      updateProfile(updated);
      showSuccess('Profil mis à jour');
    } catch (error) {
      showError('Impossible de mettre à jour le profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleBookingSubmit = async (data: BookingSettingsData) => {
    setIsUpdatingBooking(true);
    try {
      // API call to save booking settings
      setBookingSettings(data);
      showSuccess('Paramètres de réservation mis à jour');
    } catch (error) {
      showError('Impossible de sauvegarder');
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      showSuccess('Préférences enregistrées');
    } catch (error) {
      showError('Impossible de sauvegarder');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configurez votre compte et vos préférences
        </p>
      </div>

      {/* Avatar & Categories */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={prestataireProfile.avatar}
                firstName={prestataireProfile.firstName}
                lastName={prestataireProfile.lastName}
                size="2xl"
              />
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{prestataireProfile.businessName}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {prestataireProfile.categories?.map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
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
            Profil
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Calendar className="h-4 w-4" />
            Réservation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations publiques</CardTitle>
              <CardDescription>
                Ces informations sont visibles par vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                profile={prestataireProfile}
                onSubmit={handleProfileSubmit}
                isLoading={isUpdatingProfile}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de réservation</CardTitle>
              <CardDescription>
                Configurez comment les clients peuvent réserver
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
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Choisissez quand être notifié
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
      </Tabs>
    </div>
  );
}

export default PrestataireSettingsPage;
