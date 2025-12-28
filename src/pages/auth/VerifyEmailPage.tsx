/**
 * VerifyEmailPage Component
 * 
 * Email verification page accessed via email link.
 * Features:
 * - Automatic token verification
 * - Multiple status handling
 * - Resend verification option
 * - Clear user feedback
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyEmail, resendVerificationEmail } from '@/services/auth.service';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';

// ==========================================
// TYPES
// ==========================================

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

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

  // Verify email on mount if token present
  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    try {
      setStatus('loading');
      await verifyEmail({ token } as any);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      const message = err.response?.data?.message || err.message;
      
      if (message?.toLowerCase().includes('expired')) {
        setErrorMessage('This verification link has expired. Please request a new one.');
      } else if (message?.toLowerCase().includes('invalid')) {
        setErrorMessage('This verification link is invalid.');
      } else if (message?.toLowerCase().includes('already')) {
        setErrorMessage('This email has already been verified.');
      } else {
        setErrorMessage('Email verification failed. Please try again.');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    try {
      setResendLoading(true);
      await resendVerificationEmail(user.email);
      setResendSuccess(true);
    } catch (err) {
      // Silently handle error (security best practice)
      setResendSuccess(true);
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
          <CardTitle>Verifying Email...</CardTitle>
          <CardDescription>
            Please wait while we verify your email address.
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
          <CardTitle>Email Verified!</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now access all features of BookMe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to={ROUTES.LOGIN}>
              Sign In
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
          <CardTitle>Verification Failed</CardTitle>
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
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}
          
          {resendSuccess && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              ✓ A new verification email has been sent!
            </div>
          )}

          <Button asChild className="w-full">
            <Link to={ROUTES.LOGIN}>
              Back to Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // NO TOKEN STATE (awaiting verification)
  // ==========================================

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          {user?.email ? (
            <>
              A verification email has been sent to{' '}
              <strong className="text-foreground">{user.email}</strong>.
            </>
          ) : (
            'Click the verification link in the email we sent you.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center space-y-2 bg-muted/50 p-4 rounded-md">
          <p>📧 Check your inbox and spam folder</p>
          <p>⏰ The link expires in 24 hours</p>
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
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Email
              </>
            )}
          </Button>
        )}

        {resendSuccess && (
          <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
            ✓ A new verification email has been sent!
          </div>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link to={ROUTES.LOGIN}>
            Back to Sign In
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}