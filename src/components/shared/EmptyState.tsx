/**
 * Composant EmptyState
 * 
 * Affiche un état vide élégant avec illustration et CTA.
 * Utilisé quand il n'y a pas de données à afficher.
 */

import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface EmptyStateProps {
  /** Icône à afficher */
  icon?: LucideIcon;
  /** Titre */
  title: string;
  /** Description */
  description?: string;
  /** Texte du bouton d'action */
  actionLabel?: string;
  /** Callback du bouton d'action */
  onAction?: () => void;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// COMPOSANT
// ==========================================

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Icône avec cercle décoratif */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-100 rounded-full blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100">
          <Icon className="h-10 w-10 text-cyan-600" />
        </div>
      </div>

      {/* Texte */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;
