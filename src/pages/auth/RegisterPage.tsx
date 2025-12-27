/**
 * Page d'inscription
 * 
 * Permet de créer un compte client ou prestataire.
 * Formulaire dynamique selon le type choisi.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowLeft } from 'lucide-react';

import { ROUTES, PROFESSIONAL_CATEGORIES, VALIDATION } from '@/lib/constants';
import { api, getErrorMessage } from '@/lib/api';
import { showSuccess, showError } from '@/components/ui/toast';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Checkbox,
} from '@/components/ui';

// ==========================================
// VALIDATION
// ==========================================

const baseSchema = {
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} caractères`)
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
};

const clientSchema = z.object({
  ...baseSchema,
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const prestataireSchema = z.object({
  ...baseSchema,
  businessName: z.string().min(2, 'Nom de l\'entreprise requis'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z.string().min(10, 'Téléphone requis'),
  categories: z.array(z.string()).min(1, 'Sélectionnez au moins une catégorie'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ClientFormData = z.infer<typeof clientSchema>;
type PrestataireFormData = z.infer<typeof prestataireSchema>;

// ==========================================
// COMPOSANT
// ==========================================

export function RegisterPage() {
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState<'client' | 'prestataire' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Formulaire Client
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  // Formulaire Prestataire
  const prestataireForm = useForm<PrestataireFormData>({
    resolver: zodResolver(prestataireSchema),
    defaultValues: { businessName: '', firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', categories: [] },
  });

  // Toggle catégorie
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      prestataireForm.setValue('categories', updated);
      return updated;
    });
  };

  // Soumission Client
  const onSubmitClient = async (data: ClientFormData) => {
    setIsLoading(true);
    console.log(`register client data : ${JSON.stringify(data)}`)
    try {
      await api.post('/auth/register/client', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });
      showSuccess('Inscription réussie ! Vérifiez votre email.');
      navigate(ROUTES.LOGIN, { state: { message: 'Un email de vérification vous a été envoyé.' } });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Soumission Prestataire
  const onSubmitPrestataire = async (data: PrestataireFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register/prestataire', {
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        categories: data.categories,
      });
      showSuccess('Inscription réussie ! Vérifiez votre email.');
      navigate(ROUTES.LOGIN, { state: { message: 'Un email de vérification vous a été envoyé. Votre compte sera validé par notre équipe.' } });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Écran de sélection du type
  if (!userType) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Choisissez votre type de compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => setUserType('client')}
            className="w-full p-6 border-2 rounded-lg hover:border-cyan-500 hover:bg-cyan-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-100 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Je suis un client</h3>
                <p className="text-sm text-muted-foreground">
                  Je souhaite réserver des rendez-vous
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setUserType('prestataire')}
            className="w-full p-6 border-2 rounded-lg hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Je suis un prestataire</h3>
                <p className="text-sm text-muted-foreground">
                  Je propose mes services et gère mes rendez-vous
                </p>
              </div>
            </div>
          </button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-muted-foreground text-center">
            Déjà un compte ?{' '}
            <Link to={ROUTES.LOGIN} className="text-cyan-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Formulaire Client
  if (userType === 'client') {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <button
            onClick={() => setUserType(null)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </button>
          <CardTitle className="text-2xl font-bold">Inscription Client</CardTitle>
          <CardDescription>Créez votre compte pour réserver des rendez-vous</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" {...clientForm.register('firstName')} error={!!clientForm.formState.errors.firstName} />
                {clientForm.formState.errors.firstName && (
                  <p className="text-xs text-destructive">{clientForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" {...clientForm.register('lastName')} error={!!clientForm.formState.errors.lastName} />
                {clientForm.formState.errors.lastName && (
                  <p className="text-xs text-destructive">{clientForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" leftIcon={<Mail className="h-4 w-4" />} {...clientForm.register('email')} error={!!clientForm.formState.errors.email} />
              {clientForm.formState.errors.email && (
                <p className="text-xs text-destructive">{clientForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" leftIcon={<Phone className="h-4 w-4" />} {...clientForm.register('phone')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock className="h-4 w-4" />}
                  {...clientForm.register('password')}
                  error={!!clientForm.formState.errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {clientForm.formState.errors.password && (
                <p className="text-xs text-destructive">{clientForm.formState.errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">8 caractères minimum, 1 majuscule, 1 chiffre</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                {...clientForm.register('confirmPassword')}
                error={!!clientForm.formState.errors.confirmPassword}
              />
              {clientForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{clientForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Créer mon compte
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Formulaire Prestataire
  return (
    <Card className="w-full shadow-lg max-w-lg">
      <CardHeader className="space-y-1">
        <button
          onClick={() => setUserType(null)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>
        <CardTitle className="text-2xl font-bold">Inscription Prestataire</CardTitle>
        <CardDescription>Créez votre compte professionnel</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={prestataireForm.handleSubmit(onSubmitPrestataire)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nom de l'entreprise *</Label>
            <Input
              id="businessName"
              leftIcon={<Building className="h-4 w-4" />}
              {...prestataireForm.register('businessName')}
              error={!!prestataireForm.formState.errors.businessName}
            />
            {prestataireForm.formState.errors.businessName && (
              <p className="text-xs text-destructive">{prestataireForm.formState.errors.businessName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" {...prestataireForm.register('firstName')} error={!!prestataireForm.formState.errors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" {...prestataireForm.register('lastName')} error={!!prestataireForm.formState.errors.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" leftIcon={<Mail className="h-4 w-4" />} {...prestataireForm.register('email')} error={!!prestataireForm.formState.errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input id="phone" type="tel" leftIcon={<Phone className="h-4 w-4" />} {...prestataireForm.register('phone')} error={!!prestataireForm.formState.errors.phone} />
          </div>

          <div className="space-y-2">
            <Label>Catégories de services *</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {PROFESSIONAL_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">{category}</label>
                </div>
              ))}
            </div>
            {prestataireForm.formState.errors.categories && (
              <p className="text-xs text-destructive">{prestataireForm.formState.errors.categories.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                leftIcon={<Lock className="h-4 w-4" />}
                {...prestataireForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">8 caractères minimum, 1 majuscule, 1 chiffre</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input id="confirmPassword" type="password" leftIcon={<Lock className="h-4 w-4" />} {...prestataireForm.register('confirmPassword')} />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Créer mon compte pro
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterPage;
