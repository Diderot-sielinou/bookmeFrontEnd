/**
 * Error Handling Utilities
 * 
 * Standardized error processing and user-friendly messages.
 */

import { ERROR_MESSAGES } from './constants';

// ==========================================
// ERROR TYPES
// ==========================================

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// ==========================================
// GET ERROR MESSAGE
// ==========================================

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: any): string {
  // Axios error response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Axios error with validation errors
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }

  // Standard error object
  if (error?.message) {
    return error.message;
  }

  // Network error
  if (error?.code === 'ERR_NETWORK') {
    return ERROR_MESSAGES.NETWORK;
  }

  // Timeout error
  if (error?.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // HTTP status code messages
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC;
    }
  }

  // Fallback
  return ERROR_MESSAGES.GENERIC;
}

// ==========================================
// GET VALIDATION ERRORS
// ==========================================

/**
 * Extract field-specific validation errors
 */
export function getValidationErrors(error: any): Record<string, string> | null {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const fieldErrors: Record<string, string> = {};

    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0];
      }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  }

  return null;
}

// ==========================================
// IS NETWORK ERROR
// ==========================================

/**
 * Check if error is a network connectivity issue
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message?.toLowerCase().includes('network') ||
    !navigator.onLine
  );
}

// ==========================================
// IS AUTH ERROR
// ==========================================

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: any): boolean {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

// ==========================================
// IS VALIDATION ERROR
// ==========================================

/**
 * Check if error is validation-related
 */
export function isValidationError(error: any): boolean {
  return error?.response?.status === 400 && !!error?.response?.data?.errors;
}

// ==========================================
// FORMAT ERROR FOR DISPLAY
// ==========================================

/**
 * Format error for user display with appropriate styling
 */
export function formatErrorForDisplay(error: any): {
  title: string;
  message: string;
  variant: 'error' | 'warning' | 'info';
} {
  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message: ERROR_MESSAGES.NETWORK,
      variant: 'warning',
    };
  }

  if (isAuthError(error)) {
    return {
      title: 'Authentication Required',
      message: ERROR_MESSAGES.UNAUTHORIZED,
      variant: 'info',
    };
  }

  if (isValidationError(error)) {
    return {
      title: 'Invalid Input',
      message: getErrorMessage(error),
      variant: 'error',
    };
  }

  return {
    title: 'Error',
    message: getErrorMessage(error),
    variant: 'error',
  };
}

// ==========================================
// RETRY HELPER
// ==========================================

/**
 * Retry a failed operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on auth or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}