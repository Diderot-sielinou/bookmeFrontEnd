/**
 * Composant Avatar
 * 
 * Affiche une image de profil ou des initiales en fallback.
 * Basé sur Radix UI Avatar pour le chargement d'image.
 */

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

// ==========================================
// AVATAR ROOT
// ==========================================

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

// ==========================================
// AVATAR IMAGE
// ==========================================

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// ==========================================
// AVATAR FALLBACK
// ==========================================

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      `flex h-full w-full items-center justify-center rounded-full 
       bg-cyan-100 text-cyan-700 font-medium`,
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// ==========================================
// AVATAR COMPOSÉ
// ==========================================

interface AvatarProps {
  /** URL de l'image */
  src?: string | null;
  /** Texte alternatif */
  alt?: string;
  /** Prénom pour les initiales */
  firstName?: string | null;
  /** Nom pour les initiales */
  lastName?: string | null;
  /** Taille : sm (32px), md (40px), lg (48px), xl (64px), 2xl (96px) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Classes CSS additionnelles */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
};

/**
 * Avatar composé avec image et fallback automatique
 * 
 * @example
 * <Avatar src={user.avatar} firstName="Jean" lastName="Dupont" size="lg" />
 */
function Avatar({
  src,
  alt = 'Avatar',
  firstName,
  lastName,
  size = 'md',
  className,
}: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  
  return (
    <AvatarRoot className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </AvatarRoot>
  );
}

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback };
