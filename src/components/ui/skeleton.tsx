/**
 * Composant Skeleton
 * 
 * Placeholder animé pour les états de chargement.
 * Crée un effet de pulsation pour indiquer que le contenu charge.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// ==========================================
// SKELETONS PRÉ-COMPOSÉS
// ==========================================

/**
 * Skeleton pour une card de prestataire
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour une ligne de tableau
 */
function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

/**
 * Skeleton pour un profil
 */
function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour les statistiques dashboard
 */
function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour un graphique
 */
function SkeletonChart() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-64 flex items-end space-x-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 60 + 40}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonRow, 
  SkeletonProfile,
  SkeletonStats,
  SkeletonChart,
};
