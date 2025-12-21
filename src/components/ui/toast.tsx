/**
 * Configuration des Toasts avec Sonner
 * 
 * Sonner est une bibliothèque de toasts légère et accessible.
 * Ce fichier exporte le composant Toaster et la fonction toast.
 */

import { Toaster as SonnerToaster, toast } from 'sonner';

/**
 * Composant Toaster
 * 
 * À placer une seule fois dans l'application (dans le layout racine).
 * Gère l'affichage de tous les toasts.
 */
function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        // Style par défaut
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        // Classes par type
        classNames: {
          toast: 'group toast',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
          actionButton: 'bg-cyan-500 text-white hover:bg-cyan-600',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
          success: 'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100',
          error: 'border-red-500/50 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100',
          warning: 'border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100',
          info: 'border-cyan-500/50 bg-cyan-50 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-100',
        },
      }}
      // Durée par défaut (4 secondes)
      duration={4000}
      // Nombre max de toasts visibles
      visibleToasts={5}
      // Animation
      expand={false}
      richColors
      closeButton
    />
  );
}

// ==========================================
// HELPERS POUR LES TOASTS
// ==========================================

/**
 * Affiche un toast de succès
 */
const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

/**
 * Affiche un toast d'erreur
 */
const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

/**
 * Affiche un toast d'avertissement
 */
const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

/**
 * Affiche un toast d'information
 */
const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

/**
 * Affiche un toast de chargement
 * Retourne un ID pour mettre à jour le toast plus tard
 */
const showLoading = (message: string) => {
  return toast.loading(message);
};

/**
 * Met à jour un toast existant (utile après loading)
 */
const updateToast = (
  id: string | number,
  type: 'success' | 'error' | 'warning' | 'info',
  message: string
) => {
  toast.dismiss(id);
  
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    case 'info':
      toast.info(message);
      break;
  }
};

/**
 * Toast avec action
 */
const showWithAction = (
  message: string,
  actionLabel: string,
  onAction: () => void,
  options?: {
    description?: string;
    cancelLabel?: string;
  }
) => {
  toast(message, {
    description: options?.description,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    cancel: options?.cancelLabel
      ? { label: options.cancelLabel, onClick: () => {} }
      : undefined,
  });
};

export {
  Toaster,
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  updateToast,
  showWithAction,
};
