/**
 * Composant Textarea
 * 
 * Zone de texte multi-lignes avec états visuels.
 * Compatible avec React Hook Form via forwardRef.
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Affiche le style d'erreur */
  error?: boolean;
}

// ==========================================
// COMPOSANT
// ==========================================

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          `flex min-h-[80px] w-full rounded-md border border-input bg-background 
           px-3 py-2 text-sm ring-offset-background 
           placeholder:text-muted-foreground 
           focus-visible:outline-none focus-visible:ring-2 
           focus-visible:ring-ring focus-visible:ring-offset-2 
           disabled:cursor-not-allowed disabled:opacity-50
           resize-y`,
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
