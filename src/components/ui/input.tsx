/**
 * Composant Input
 * 
 * Champ de saisie texte avec états visuels :
 * - Normal, Focus, Erreur, Désactivé
 * 
 * Compatible avec React Hook Form via forwardRef.
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Affiche le style d'erreur */
  error?: boolean;
  /** Icône à afficher à gauche */
  leftIcon?: React.ReactNode;
  /** Icône à afficher à droite */
  rightIcon?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    // Si des icônes sont présentes, wrapper avec un conteneur
    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {/* Icône gauche */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              `flex h-10 w-full rounded-md border border-input bg-background 
               px-3 py-2 text-sm ring-offset-background 
               file:border-0 file:bg-transparent file:text-sm file:font-medium 
               placeholder:text-muted-foreground 
               focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-ring focus-visible:ring-offset-2 
               disabled:cursor-not-allowed disabled:opacity-50`,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Icône droite */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }
    
    // Input simple sans icônes
    return (
      <input
        type={type}
        className={cn(
          `flex h-10 w-full rounded-md border border-input bg-background 
           px-3 py-2 text-sm ring-offset-background 
           file:border-0 file:bg-transparent file:text-sm file:font-medium 
           placeholder:text-muted-foreground 
           focus-visible:outline-none focus-visible:ring-2 
           focus-visible:ring-ring focus-visible:ring-offset-2 
           disabled:cursor-not-allowed disabled:opacity-50`,
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
