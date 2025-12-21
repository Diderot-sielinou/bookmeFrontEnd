/**
 * Composant Button
 * 
 * Bouton réutilisable avec plusieurs variantes visuelles.
 * Basé sur Radix UI Slot pour le polymorphisme (asChild).
 * 
 * Variantes :
 * - default : Bouton principal (cyan)
 * - secondary : Bouton secondaire (teal)
 * - outline : Bouton avec bordure
 * - ghost : Bouton transparent
 * - destructive : Bouton d'action dangereuse (rouge)
 * - link : Style lien
 * 
 * Tailles :
 * - sm : Petit
 * - default : Normal
 * - lg : Grand
 * - icon : Carré pour icône
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

// ==========================================
// VARIANTS
// ==========================================

const buttonVariants = cva(
  // Classes de base communes à tous les boutons
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md 
   text-sm font-medium transition-colors focus-visible:outline-none 
   focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        // Bouton principal - Cyan (CTA)
        default:
          'bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 shadow-sm',
        
        // Bouton secondaire - Teal
        secondary:
          'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm',
        
        // Bouton avec bordure
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        
        // Bouton transparent
        ghost:
          'hover:bg-accent hover:text-accent-foreground',
        
        // Bouton danger
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        
        // Style lien
        link:
          'text-cyan-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ==========================================
// TYPES
// ==========================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Si true, le composant enfant est utilisé comme élément racine */
  asChild?: boolean;
  /** Affiche un loader et désactive le bouton */
  isLoading?: boolean;
  /** Icône à afficher à gauche du texte */
  leftIcon?: React.ReactNode;
  /** Icône à afficher à droite du texte */
  rightIcon?: React.ReactNode;
}

// ==========================================
// COMPOSANT
// ==========================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Utilise Slot si asChild est true (permet de passer un Link par exemple)
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loader pendant le chargement */}
        {isLoading && <Loader2 className="animate-spin" />}
        
        {/* Icône gauche (masquée si loading) */}
        {!isLoading && leftIcon}
        
        {/* Contenu du bouton */}
        {children}
        
        {/* Icône droite */}
        {rightIcon}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
