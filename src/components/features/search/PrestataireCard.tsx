/**
 * Composant PrestataireCard
 * 
 * Carte affichant les informations d'un prestataire
 * dans les résultats de recherche.
 */

import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { BADGE_INFO } from '@/lib/constants';
import { Card, CardContent, Avatar, Badge, Button } from '@/components/ui';
import { RatingBadge } from '@/components/shared/RatingStars';
import type { SearchResult } from '@/types';

// ==========================================
// TYPES
// ==========================================

interface PrestataireCardProps {
  /** Données du prestataire */
  prestataire: SearchResult;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// COMPOSANT
// ==========================================

export function PrestataireCard({ prestataire, className }: PrestataireCardProps) {
  const {
    id,
    businessName,
    firstName,
    lastName,
    bio,
    avatar,
    categories,
    city,
    averageRating,
    totalReviews,
    badges,
    minPrice,
  } = prestataire;

  const displayName = businessName || `${firstName} ${lastName}`;

  return (
    <Card className={cn('overflow-hidden card-hover', className)}>
      <CardContent className="p-0">
        <Link to={`/prestataires/${id}`} className="block">
          {/* Header avec avatar */}
          <div className="p-4 pb-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar
                src={avatar}
                firstName={firstName}
                lastName={lastName}
                size="lg"
                className="shrink-0"
              />

              {/* Infos principales */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg truncate">{displayName}</h3>
                  <RatingBadge value={averageRating} totalReviews={totalReviews} />
                </div>

                {/* Badges */}
                {badges && badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {badges.slice(0, 3).map((badge) => {
                      const info = BADGE_INFO[badge.type as keyof typeof BADGE_INFO];
                      return (
                        <span
                          key={badge.type}
                          className="text-xs"
                          title={info?.description}
                        >
                          {info?.icon}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Localisation */}
                {city && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Catégories */}
          {categories && categories.length > 0 && (
            <div className="px-4 pt-3">
              <div className="flex flex-wrap gap-1">
                {categories.slice(0, 3).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{categories.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Bio (tronquée) */}
          {bio && (
            <p className="px-4 pt-3 text-sm text-muted-foreground line-clamp-2">
              {bio}
            </p>
          )}

          {/* Footer */}
          <div className="p-4 flex items-center justify-between border-t mt-4">
            {/* Prix */}
            {minPrice !== null && (
              <div className="text-sm">
                <span className="text-muted-foreground">À partir de </span>
                <span className="font-semibold text-cyan-600">
                  {formatPrice(minPrice)}
                </span>
              </div>
            )}

            {/* CTA */}
            <Button size="sm">Voir le profil</Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default PrestataireCard;
