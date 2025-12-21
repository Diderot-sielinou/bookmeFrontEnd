/**
 * Composant Spinner
 * 
 * Indicateur de chargement animé.
 */

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  /** Taille : sm, md, lg, xl */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Classes additionnelles */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/**
 * Spinner de chargement
 * 
 * @example
 * <Spinner size="lg" />
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-cyan-500',
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Overlay de chargement plein écran
 */
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * Spinner centré dans un conteneur
 */
export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
