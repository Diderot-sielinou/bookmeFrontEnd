/**
 * LoginPage Component
 * 
 * Handles user authentication with email and password.
 * Features:
 * - Real-time form validation
 * - Clear error messages per field
 * - Loading states
 * - Password visibility toggle
 * - Redirect after successful login
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
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
} from '@/components/ui';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// COMPONENT
// ==========================================

export function LoginPage() {
  const location = useLocation();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Success message from registration or password reset
  const successMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      await login(data.email, data.password);
      // Redirect is handled by useAuth hook
    } catch (error: any) {
      // Handle different error types
      const errorMessage = error?.response?.data?.message || error?.message;
      
      if (errorMessage?.toLowerCase().includes('credentials')) {
        setServerError('Invalid email or password. Please try again.');
      } else if (errorMessage?.toLowerCase().includes('suspended')) {
        setServerError('Your account has been suspended. Please contact support.');
      } else if (errorMessage?.toLowerCase().includes('verify')) {
        setServerError('Please verify your email before logging in.');
      } else {
        setServerError('Unable to sign in. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success message from redirect */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Server error message */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={!!errors.email}
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-cyan-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={!!errors.password}
                disabled={isLoading}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground text-center">
          Don't have an account?{' '}
          <Link 
            to={ROUTES.REGISTER} 
            className="text-cyan-600 hover:underline font-medium"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginPage;