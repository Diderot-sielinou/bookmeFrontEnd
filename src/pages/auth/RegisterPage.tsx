/**
 * RegisterPage Component
 * 
 * Multi-step registration for clients and service providers.
 * Features:
 * - User type selection (Client/Provider)
 * - Dynamic form validation based on type
 * - Real-time validation feedback
 * - Password strength indicator
 * - Category selection for providers
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Building, 
  ArrowLeft, Loader2, CheckCircle2 
} from 'lucide-react';

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
  Badge,
} from '@/components/ui';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const passwordValidation = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character');

const baseSchema = {
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: passwordValidation,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
};

const clientSchema = z.object({
  ...baseSchema,
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name is too long'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const providerSchema = z.object({
  ...baseSchema,
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name is too long'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name is too long'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number'),
  categories: z
    .array(z.string())
    .min(1, 'Please select at least one category'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ClientFormData = z.infer<typeof clientSchema>;
type ProviderFormData = z.infer<typeof providerSchema>;

// ==========================================
// PASSWORD STRENGTH INDICATOR
// ==========================================

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score === 4) return { score, label: 'Good', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const { score, label, color } = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i < score ? color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs text-muted-foreground">
          Password strength: <span className="font-medium">{label}</span>
        </p>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT
// ==========================================

export function RegisterPage() {
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState<'client' | 'provider' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [passwordValue, setPasswordValue] = useState('');

  // Client form
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: 'onBlur',
  });

  // Provider form
  const providerForm = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    mode: 'onBlur',
  });

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      providerForm.setValue('categories', updated, { shouldValidate: true });
      return updated;
    });
  };

  // Submit client registration
  const onSubmitClient = async (data: ClientFormData) => {
    setIsLoading(true);
    
    try {
      await api.post('/auth/register/client', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });
      
      showSuccess('Registration successful! Please check your email.');
      navigate(ROUTES.LOGIN, { 
        state: { message: 'A verification email has been sent to your inbox.' } 
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
        clientForm.setError('email', { 
          message: 'This email is already registered. Please sign in instead.' 
        });
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit provider registration
  const onSubmitProvider = async (data: ProviderFormData) => {
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
      
      showSuccess('Registration successful! Please check your email.');
      navigate(ROUTES.LOGIN, { 
        state: { 
          message: 'A verification email has been sent. Your account will be reviewed by our team.' 
        } 
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
        providerForm.setError('email', { 
          message: 'This email is already registered. Please sign in instead.' 
        });
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // USER TYPE SELECTION SCREEN
  // ==========================================

  if (!userType) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Choose your account type to get started</CardDescription>
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
                <h3 className="font-semibold text-lg">I'm a Client</h3>
                <p className="text-sm text-muted-foreground">
                  I want to book appointments with service providers
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setUserType('provider')}
            className="w-full p-6 border-2 rounded-lg hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">I'm a Service Provider</h3>
                <p className="text-sm text-muted-foreground">
                  I offer services and want to manage my appointments
                </p>
              </div>
            </div>
          </button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-cyan-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // ==========================================
  // CLIENT REGISTRATION FORM
  // ==========================================

  if (userType === 'client') {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <button
            onClick={() => setUserType(null)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>
          <CardTitle className="text-2xl font-bold">Client Registration</CardTitle>
          <CardDescription>Create your account to book appointments</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  disabled={isLoading}
                  error={!!clientForm.formState.errors.firstName}
                  {...clientForm.register('firstName')} 
                />
                {clientForm.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {clientForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  disabled={isLoading}
                  error={!!clientForm.formState.errors.lastName}
                  {...clientForm.register('lastName')} 
                />
                {clientForm.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {clientForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="email" 
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={isLoading}
                error={!!clientForm.formState.errors.email}
                {...clientForm.register('email')} 
              />
              {clientForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {clientForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="+1234567890"
                leftIcon={<Phone className="h-4 w-4" />}
                disabled={isLoading}
                {...clientForm.register('phone')} 
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  disabled={isLoading}
                  error={!!clientForm.formState.errors.password}
                  {...clientForm.register('password', {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {clientForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {clientForm.formState.errors.password.message}
                </p>
              )}
              <PasswordStrength password={passwordValue} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                disabled={isLoading}
                error={!!clientForm.formState.errors.confirmPassword}
                {...clientForm.register('confirmPassword')}
              />
              {clientForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {clientForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-cyan-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // ==========================================
  // PROVIDER REGISTRATION FORM
  // ==========================================

  return (
    <Card className="w-full shadow-lg max-w-2xl">
      <CardHeader className="space-y-1">
        <button
          onClick={() => setUserType(null)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <CardTitle className="text-2xl font-bold">Provider Registration</CardTitle>
        <CardDescription>Create your professional account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={providerForm.handleSubmit(onSubmitProvider)} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="Your Business Name"
              leftIcon={<Building className="h-4 w-4" />}
              disabled={isLoading}
              error={!!providerForm.formState.errors.businessName}
              {...providerForm.register('businessName')}
            />
            {providerForm.formState.errors.businessName && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.businessName.message}
              </p>
            )}
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="firstName" 
                placeholder="John"
                disabled={isLoading}
                error={!!providerForm.formState.errors.firstName}
                {...providerForm.register('firstName')} 
              />
              {providerForm.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {providerForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="lastName" 
                placeholder="Doe"
                disabled={isLoading}
                error={!!providerForm.formState.errors.lastName}
                {...providerForm.register('lastName')} 
              />
              {providerForm.formState.errors.lastName && (
                <p className="text-xs text-destructive">
                  {providerForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="email" 
              type="email"
              placeholder="business@email.com"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
              error={!!providerForm.formState.errors.email}
              {...providerForm.register('email')} 
            />
            {providerForm.formState.errors.email && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="phone" 
              type="tel"
              placeholder="+1234567890"
              leftIcon={<Phone className="h-4 w-4" />}
              disabled={isLoading}
              error={!!providerForm.formState.errors.phone}
              {...providerForm.register('phone')} 
            />
            {providerForm.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>
              Service Categories <span className="text-destructive">*</span>
            </Label>
            <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {PROFESSIONAL_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor={`cat-${category}`} 
                      className="text-sm cursor-pointer select-none"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
            {providerForm.formState.errors.categories && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.categories.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                disabled={isLoading}
                error={!!providerForm.formState.errors.password}
                {...providerForm.register('password', {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {providerForm.formState.errors.password && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.password.message}
              </p>
            )}
            <PasswordStrength password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={isLoading}
              error={!!providerForm.formState.errors.confirmPassword}
              {...providerForm.register('confirmPassword')}
            />
            {providerForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {providerForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Professional Account'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-cyan-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default RegisterPage;