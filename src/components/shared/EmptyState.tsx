import { isValidElement } from 'react'; // Importer ceci
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: IconInput = Inbox, // Renommé pour clarté
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  
  // Rendu de l'icône de manière sécurisée
  const renderIcon = () => {
    // Si c'est déjà un élément JSX (ex: <span />), on le rend tel quel
    if (isValidElement(IconInput)) {
      return IconInput;
    }
    
    // Sinon, on considère que c'est un composant (Icone Lucide)
    const IconComponent = IconInput as React.ElementType;
    return <IconComponent className="h-10 w-10 text-cyan-600" />;
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-100 rounded-full blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100">
          {renderIcon()}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}

      {action}
      {!action && actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;