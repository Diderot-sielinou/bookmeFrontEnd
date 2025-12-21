/**
 * Fonctions utilitaires pour BookMe
 * 
 * Ce module contient des helpers réutilisables dans toute l'application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// ==========================================
// CLASSES CSS
// ==========================================

/**
 * Combine des classes CSS avec Tailwind merge
 * Utilise clsx pour la logique conditionnelle et twMerge pour résoudre les conflits
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ==========================================
// FORMATAGE DES DATES
// ==========================================

/**
 * Formate une date en français
 * 
 * @param date - Date à formater (string ISO ou Date)
 * @param formatString - Format souhaité (par défaut: 'dd MMMM yyyy')
 * 
 * @example
 * formatDate('2024-01-15') // '15 janvier 2024'
 * formatDate('2024-01-15', 'dd/MM/yyyy') // '15/01/2024'
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = 'dd MMMM yyyy'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString, { locale: fr });
}

/**
 * Formate une heure (format HH:mm)
 * 
 * @example
 * formatTime('14:30') // '14h30'
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  return time.replace(':', 'h');
}

/**
 * Formate une date et heure ensemble
 * 
 * @example
 * formatDateTime('2024-01-15', '14:30') // 'Lundi 15 janvier 2024 à 14h30'
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  time?: string | null
): string {
  if (!date) return '';
  
  const formattedDate = formatDate(date, 'EEEE d MMMM yyyy');
  
  if (time) {
    return `${formattedDate} à ${formatTime(time)}`;
  }
  
  return formattedDate;
}

/**
 * Formate une date relative (il y a X temps)
 * 
 * @example
 * formatRelativeDate('2024-01-15T14:30:00Z') // 'il y a 2 heures'
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
}

/**
 * Formate une durée en minutes vers un format lisible
 * 
 * @example
 * formatDuration(90) // '1h30'
 * formatDuration(45) // '45 min'
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

// ==========================================
// FORMATAGE DES PRIX
// ==========================================

/**
 * Formate un prix en euros
 * 
 * @example
 * formatPrice(45.5) // '45,50 €'
 * formatPrice(100) // '100,00 €'
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Formate une fourchette de prix
 * 
 * @example
 * formatPriceRange(30, 100) // '30 € - 100 €'
 * formatPriceRange(50, 50) // 'À partir de 50 €'
 */
export function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return '';
  
  if (min === max || max === null) {
    return `À partir de ${formatPrice(min)}`;
  }
  
  if (min === null) {
    return `Jusqu'à ${formatPrice(max)}`;
  }
  
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

// ==========================================
// FORMATAGE DES NOTES
// ==========================================

/**
 * Formate une note avec une décimale
 * 
 * @example
 * formatRating(4.5) // '4.5'
 * formatRating(4.0) // '4.0'
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return '-';
  return rating.toFixed(1);
}

// ==========================================
// FORMATAGE DES NOMS
// ==========================================

/**
 * Formate un nom complet
 * 
 * @example
 * formatFullName('Jean', 'Dupont') // 'Jean Dupont'
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Obtient les initiales d'un nom
 * 
 * @example
 * getInitials('Jean', 'Dupont') // 'JD'
 * getInitials('Jean') // 'J'
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || '?';
}

// ==========================================
// FORMATAGE DES NUMÉROS
// ==========================================

/**
 * Formate un numéro de téléphone français
 * 
 * @example
 * formatPhoneNumber('0612345678') // '06 12 34 56 78'
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Nettoyer le numéro (garder seulement les chiffres)
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater en groupes de 2
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  
  if (match) {
    return match.slice(1).join(' ');
  }
  
  return phone;
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Vérifie si une valeur est vide (null, undefined, string vide)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Vérifie si un email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Vérifie si un mot de passe est suffisamment fort
 * (8+ caractères, 1 majuscule, 1 chiffre)
 */
export function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasMinLength && hasUppercase && hasNumber;
}

// ==========================================
// UTILITAIRES DIVERS
// ==========================================

/**
 * Tronque un texte à une longueur maximale
 * 
 * @example
 * truncate('Lorem ipsum dolor sit amet', 15) // 'Lorem ipsum...'
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Génère un hash simple pour une chaîne (pour clés de cache)
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Délai asynchrone (pour les tests/animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Génère une couleur de badge basée sur le type
 */
export function getBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    TOP_RATED: 'bg-yellow-100 text-yellow-800',
    RESPONSIVE: 'bg-blue-100 text-blue-800',
    RELIABLE: 'bg-green-100 text-green-800',
    POPULAR: 'bg-purple-100 text-purple-800',
  };
  
  return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Génère une couleur de statut basée sur le statut
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-blue-100 text-blue-800',
    BLOCKED: 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Traduit un statut en français
 */
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    // Statuts RDV
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
    NO_SHOW: 'Absent',
    // Statuts prestataire
    ACTIVE: 'Actif',
    SUSPENDED: 'Suspendu',
    REJECTED: 'Rejeté',
    // Statuts créneaux
    AVAILABLE: 'Disponible',
    RESERVED: 'Réservé',
    BLOCKED: 'Bloqué',
  };
  
  return translations[status] || status;
}
