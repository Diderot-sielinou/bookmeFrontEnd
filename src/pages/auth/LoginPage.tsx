/**
 * Page de connexion
 * 
 * Formulaire de connexion avec email et mot de passe.
 * Gère la validation, les erreurs et la redirection.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

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
// VALIDATION
// ==========================================

const loginSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// COMPOSANT
// ==========================================

export function LoginPage() {
  const location = useLocation();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const successMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre compte
        </CardDescription>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-cyan-600 hover:underline"
              >
                Mot de passe oublié ?
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
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Se connecter
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground text-center">
          Pas encore de compte ?{' '}
          <Link to={ROUTES.REGISTER} className="text-cyan-600 hover:underline font-medium">
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginPage;
