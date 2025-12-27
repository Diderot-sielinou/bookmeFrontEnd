/**
 * Composant RatingStars
 * 
 * Affichage et sélection de notes avec étoiles.
 */

import { useState } from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

interface RatingStarsProps {
  /** Note actuelle (1-5) */
  value: number | null | undefined;
  /** Callback quand la note change (mode interactif) */
  onChange?: (value: number) => void;
  /** Taille des étoiles */
  size?: 'sm' | 'md' | 'lg';
  /** Afficher la note en texte */
  showValue?: boolean;
  /** Nombre total d'avis (affiché à côté) */
  totalReviews?: number;
  /** Classes additionnelles */
  className?: string;
  /** Désactivé */
  disabled?: boolean;
}

// ==========================================
// CONFIGURATION
// ==========================================

const sizeConfig = {
  sm: { star: 'h-4 w-4', text: 'text-sm' },
  md: { star: 'h-5 w-5', text: 'text-base' },
  lg: { star: 'h-6 w-6', text: 'text-lg' },
};

// ==========================================
// COMPOSANT
// ==========================================

export function RatingStars({
  value,
  onChange,
  size = 'md',
  showValue = false,
  totalReviews,
  className,
  disabled = false,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  // ✅ Sécurisation de la valeur - gère null, undefined, NaN, strings
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  
  const isInteractive = !!onChange && !disabled;
  const displayValue = hoverValue ?? safeValue;
  const config = sizeConfig[size];

  // Gérer le clic sur une étoile
  const handleClick = (rating: number) => {
    if (isInteractive) {
      onChange(rating);
    }
  };

  // Rendu d'une étoile
  const renderStar = (index: number) => {
    const rating = index + 1;
    const filled = rating <= displayValue;
    const halfFilled = rating - 0.5 <= displayValue && rating > displayValue;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(rating)}
        onMouseEnter={() => isInteractive && setHoverValue(rating)}
        onMouseLeave={() => isInteractive && setHoverValue(null)}
        disabled={!isInteractive}
        className={cn(
          'focus:outline-none transition-transform',
          isInteractive && 'hover:scale-110 cursor-pointer',
          !isInteractive && 'cursor-default'
        )}
      >
        <Star
          className={cn(
            config.star,
            'transition-colors',
            filled
              ? 'fill-amber-400 text-amber-400'
              : halfFilled
              ? 'fill-amber-400/50 text-amber-400'
              : 'fill-transparent text-gray-300'
          )}
        />
      </button>
    );
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Étoiles */}
      <div className="flex">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>

      {/* Valeur numérique - utilise safeValue */}
      {showValue && (
        <span className={cn('font-medium text-foreground ml-1', config.text)}>
          {safeValue.toFixed(1)}
        </span>
      )}

      {/* Nombre d'avis */}
      {totalReviews !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">
          ({totalReviews} avis)
        </span>
      )}
    </div>
  );
}

// ==========================================
// VARIANTE COMPACTE
// ==========================================

interface RatingBadgeProps {
  value: number | null | undefined;
  totalReviews?: number;
  className?: string;
}

export function RatingBadge({ value, totalReviews, className }: RatingBadgeProps) {
  // ✅ Sécurisation ici aussi
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700',
        className
      )}
    >
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-medium text-sm">{safeValue.toFixed(1)}</span>
      {totalReviews !== undefined && (
        <span className="text-xs text-amber-600">({totalReviews})</span>
      )}
    </div>
  );
}

export default RatingStars;