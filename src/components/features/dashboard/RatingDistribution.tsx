/**
 * Composant RatingDistribution
 * 
 * Affiche la distribution des notes sous forme de barres horizontales.
 */

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface RatingData {
  rating: number;
  count: number;
  percentage: number;
}

interface RatingDistributionProps {
  /** Données de distribution */
  data: RatingData[];
  /** Note moyenne */
  averageRating?: number;
  /** Nombre total d'avis */
  totalReviews?: number;
  /** Titre */
  title?: string;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// COMPOSANT
// ==========================================

export function RatingDistribution({
  data,
  averageRating,
  totalReviews,
  title = 'Distribution des notes',
  className,
}: RatingDistributionProps) {
  // Trier par note décroissante (5 étoiles en haut)
  const sortedData = [...data].sort((a, b) => b.rating - a.rating);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Résumé */}
        {(averageRating !== undefined || totalReviews !== undefined) && (
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            {averageRating !== undefined && (
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            {totalReviews !== undefined && (
              <div className="text-sm text-muted-foreground">
                {totalReviews} avis au total
              </div>
            )}
          </div>
        )}

        {/* Barres de distribution */}
        <div className="space-y-3">
          {sortedData.map((item) => (
            <div key={item.rating} className="flex items-center gap-3">
              {/* Label étoiles */}
              <div className="flex items-center gap-1 w-16 shrink-0">
                <span className="text-sm font-medium">{item.rating}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>

              {/* Barre de progression */}
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>

              {/* Pourcentage */}
              <div className="w-14 text-right text-sm text-muted-foreground">
                {item.percentage.toFixed(0)}%
              </div>

              {/* Nombre */}
              <div className="w-10 text-right text-sm text-muted-foreground">
                ({item.count})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RatingDistribution;
