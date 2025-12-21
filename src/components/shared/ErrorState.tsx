/**
 * Composant ErrorState
 * 
 * Affiche un état d'erreur avec possibilité de réessayer.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface ErrorStateProps {
  /** Message d'erreur */
  message?: string;
  /** Titre de l'erreur */
  title?: string;
  /** Callback pour réessayer */
  onRetry?: () => void;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// COMPOSANT
// ==========================================

export function ErrorState({
  message = 'Une erreur est survenue. Veuillez réessayer.',
  title = 'Erreur',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Icône */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
      </div>

      {/* Texte */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>

      {/* Bouton réessayer */}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
