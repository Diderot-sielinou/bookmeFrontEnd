/**
 * VerifyEmailPage
 * 
 * Page de vérification d'email.
 * L'utilisateur accède à cette page via le lien envoyé par email après inscription.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyEmail, resendVerificationEmail } from '@/services/auth.service';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import type { VerifyEmailDto } from '@/types';

// ==========================================
// TYPES
// ==========================================

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token' | 'resend';

// ==========================================
// COMPONENT
// ==========================================

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuthStore();

  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Vérifier l'email au chargement si token présent
  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    try {
      setStatus('loading');
      await verifyEmail(token as unknown as VerifyEmailDto);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Le lien de vérification est invalide ou a expiré.');
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    try {
      setResendLoading(true);
      await resendVerificationEmail(user.email);
      setResendSuccess(true);
    } catch (err) {
      // Ignorer les erreurs silencieusement
    } finally {
      setResendLoading(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <CardTitle>Vérification en cours...</CardTitle>
          <CardDescription>
            Veuillez patienter pendant que nous vérifions votre adresse email.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ==========================================
  // SUCCESS STATE
  // ==========================================

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Email vérifié !</CardTitle>
          <CardDescription>
            Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de BookMe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to={ROUTES.LOGIN}>
              Se connecter
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Erreur de vérification</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.email && !resendSuccess && (
            <Button 
              onClick={handleResendEmail} 
              disabled={resendLoading}
              variant="outline"
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renvoyer l'email de vérification
                </>
              )}
            </Button>
          )}
          
          {resendSuccess && (
            <div className="text-center text-sm text-green-600">
              Un nouvel email de vérification a été envoyé !
            </div>
          )}

          <Button asChild className="w-full">
            <Link to={ROUTES.LOGIN}>
              Retour à la connexion
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // NO TOKEN STATE (resend option)
  // ==========================================

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Vérifiez votre email</CardTitle>
        <CardDescription>
          {user?.email ? (
            <>Un email de vérification a été envoyé à <strong>{user.email}</strong>.</>
          ) : (
            'Cliquez sur le lien dans l\'email de vérification que nous vous avons envoyé.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>Vérifiez votre boîte de réception et vos spams.</p>
          <p>Le lien expire dans 24 heures.</p>
        </div>

        {user?.email && !resendSuccess && (
          <Button 
            onClick={handleResendEmail} 
            disabled={resendLoading}
            variant="outline"
            className="w-full"
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renvoyer l'email
              </>
            )}
          </Button>
        )}

        {resendSuccess && (
          <div className="text-center text-sm text-green-600 py-2">
            ✓ Un nouvel email de vérification a été envoyé !
          </div>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link to={ROUTES.LOGIN}>
            Retour à la connexion
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
