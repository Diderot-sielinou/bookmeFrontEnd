/**
 * Composant Badge
 * 
 * Petit indicateur visuel pour statuts, catégories, etc.
 * 
 * Variantes :
 * - default : Badge principal (cyan)
 * - secondary : Badge secondaire (gris)
 * - success : Badge succès (vert)
 * - warning : Badge avertissement (jaune)
 * - destructive : Badge danger (rouge)
 * - outline : Badge avec bordure seulement
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// ==========================================
// VARIANTS
// ==========================================

const badgeVariants = cva(
  `inline-flex items-center rounded-full border px-2.5 py-0.5 
   text-xs font-semibold transition-colors 
   focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`,
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        secondary:
          'border-transparent bg-secondary/20 text-secondary-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        outline:
          'text-foreground border-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ==========================================
// TYPES
// ==========================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Icône à afficher à gauche */
  icon?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
