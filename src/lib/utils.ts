/**
 * Utility Functions for BookMe
 * 
 * This module contains reusable helpers throughout the application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ==========================================
// CSS CLASSES
// ==========================================

/**
 * Combines CSS classes with Tailwind merge
 * Uses clsx for conditional logic and twMerge to resolve conflicts
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Formats a date
 * 
 * @param date - Date to format (ISO string or Date)
 * @param formatString - Desired format (default: 'MMMM d, yyyy')
 * 
 * @example
 * formatDate('2024-01-15') // 'January 15, 2024'
 * formatDate('2024-01-15', 'MM/dd/yyyy') // '01/15/2024'
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = 'MMMM d, yyyy'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString, { locale: enUS });
}

/**
 * Formats time (HH:mm format)
 * 
 * @example
 * formatTime('14:30') // '2:30 PM'
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  
  // Parse HH:mm format
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const date = new Date();
  date.setHours(hours, minutes);
  
  return format(date, 'h:mm a');
}

/**
 * Formats date and time together
 * 
 * @example
 * formatDateTime('2024-01-15', '14:30') // 'Monday, January 15, 2024 at 2:30 PM'
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  time?: string | null
): string {
  if (!date) return '';
  
  const formattedDate = formatDate(date, 'EEEE, MMMM d, yyyy');
  
  if (time) {
    return `${formattedDate} at ${formatTime(time)}`;
  }
  
  return formattedDate;
}

/**
 * Formats relative date (X time ago)
 * 
 * @example
 * formatRelativeDate('2024-01-15T14:30:00Z') // '2 hours ago'
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: enUS });
}

/**
 * Formats duration in minutes to readable format
 * 
 * @example
 * formatDuration(90) // '1h 30m'
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
  
  return `${hours}h ${remainingMinutes}m`;
}

// ==========================================
// PRICE FORMATTING
// ==========================================

/**
 * Formats price in USD
 * 
 * @example
 * formatPrice(45.5) // '$45.50'
 * formatPrice(100) // '$100.00'
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Formats price range
 * 
 * @example
 * formatPriceRange(30, 100) // '$30 - $100'
 * formatPriceRange(50, 50) // 'Starting at $50'
 */
export function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return '';
  
  if (min === max || max === null) {
    return `Starting at ${formatPrice(min)}`;
  }
  
  if (min === null) {
    return `Up to ${formatPrice(max)}`;
  }
  
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

// ==========================================
// NAME FORMATTING
// ==========================================

/**
 * Formats full name
 * 
 * @example
 * formatFullName('John', 'Doe') // 'John Doe'
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Gets initials from name
 * 
 * @example
 * getInitials('John', 'Doe') // 'JD'
 * getInitials('John') // 'J'
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
// PHONE NUMBER FORMATTING
// ==========================================

/**
 * Formats US phone number
 * 
 * @example
 * formatPhoneNumber('1234567890') // '(123) 456-7890'
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Clean number (keep only digits)
  const cleaned = phone.replace(/\D/g, '');
  
  // Format in groups
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Checks if value is empty (null, undefined, empty string)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Checks if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if password is strong enough
 * (8+ characters, 1 uppercase, 1 number, 1 special char)
 */
export function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  
  return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

// ==========================================
// MISC UTILITIES
// ==========================================

/**
 * Truncates text to maximum length
 * 
 * @example
 * truncate('Lorem ipsum dolor sit amet', 15) // 'Lorem ipsum...'
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generates simple hash for string (for cache keys)
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
 * Async delay (for tests/animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function
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
 * Safely converts value to number
 * Returns fallback if conversion fails
 */
export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Formats number with fixed decimals
 */
export const formatRating = (value: unknown): string => {
  return toNumber(value, 0).toFixed(1);
};

/**
 * Generates badge color based on type
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
 * Generates status color based on status
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
 * Translates status to English
 */
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    // Appointment statuses
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
    // Provider statuses
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    REJECTED: 'Rejected',
    // Slot statuses
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    BLOCKED: 'Blocked',
  };
  
  return translations[status] || status;
}