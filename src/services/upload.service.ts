/**
 * Service d'upload de fichiers
 * 
 * Gère l'upload d'images vers Cloudinary via le backend :
 * - Avatar utilisateur
 * - Images portfolio
 * - Images services
 */

import { api } from '@/lib/api';
import type { UploadResponse } from '@/types/forms';

// ==========================================
// UPLOAD D'IMAGES
// ==========================================

/**
 * Upload un avatar utilisateur
 * 
 * L'image est redimensionnée à 300x300 côté serveur
 * Formats acceptés : JPEG, PNG, GIF, WebP
 * Taille max : 5 Mo
 */
export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ data: UploadResponse }>(
    '/upload/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
};

/**
 * Upload une image de portfolio
 * 
 * L'image est redimensionnée à 1200x1200 max côté serveur
 * Maximum 10 images par prestataire
 */
export const uploadPortfolioImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ data: UploadResponse }>(
    '/upload/portfolio',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
};

/**
 * Upload plusieurs images de portfolio
 */
export const uploadPortfolioImages = async (
  files: File[]
): Promise<UploadResponse[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  const response = await api.post<{ data: UploadResponse[] }>(
    '/upload/portfolio',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
};

/**
 * Upload une image de service
 * 
 * L'image est redimensionnée à 600x400 côté serveur
 */
export const uploadServiceImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ data: UploadResponse }>(
    '/upload/service',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
};

/**
 * Supprime un fichier uploadé
 * 
 * @param publicId - ID public Cloudinary de l'image
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  await api.delete(`/upload/${encodeURIComponent(publicId)}`);
};

/**
 * Upload un document (pour validation prestataire)
 * 
 * Formats acceptés : PDF, JPEG, PNG
 * Taille max : 10 Mo
 */
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ data: UploadResponse }>(
    '/upload/document',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Valide un fichier avant upload
 * 
 * @returns Message d'erreur ou null si valide
 */
export const validateFile = (
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): string | null => {
  const maxSize = (options?.maxSizeMB || 5) * 1024 * 1024;
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  if (file.size > maxSize) {
    return `Le fichier dépasse la taille maximale de ${options?.maxSizeMB || 5} Mo`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.';
  }
  
  return null;
};

/**
 * Génère une URL optimisée Cloudinary
 * 
 * @param url - URL originale
 * @param options - Options de transformation
 */
export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  const transformations: string[] = [];
  
  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options?.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }
  transformations.push(`f_${options?.format || 'auto'}`);
  
  // Insérer les transformations dans l'URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }
  
  return url;
};
