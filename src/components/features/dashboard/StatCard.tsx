/**
 * Composant StatCard
 * 
 * Carte de statistique pour les dashboards.
 * Affiche une valeur, un label, une icône et une évolution.
 */

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface StatCardProps {
  /** Titre de la stat */
  label: string;
  /** Valeur à afficher */
  value: string | number;
  /** Icône */
  icon: LucideIcon;
  /** Variation en pourcentage (positif ou négatif) */
  change?: number;
  /** Période de la variation */
  changePeriod?: string;
  /** Couleur de l'icône */
  iconColor?: 'cyan' | 'teal' | 'green' | 'amber' | 'red';
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

const iconColorClasses = {
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

// ==========================================
// COMPOSANT
// ==========================================

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changePeriod = 'vs mois dernier',
  iconColor = 'cyan',
  className,
}: StatCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Contenu principal */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            
            {/* Évolution */}
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    isPositiveChange ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositiveChange ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">{changePeriod}</span>
              </div>
            )}
          </div>

          {/* Icône */}
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
              iconColorClasses[iconColor]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
