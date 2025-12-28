/**
 * Service d'upload de fichiers - ALIGNÉ AVEC BACKEND
 *
 * Gère l'upload d'images vers Cloudinary via le backend :
 * - Avatar utilisateur
 * - Images portfolio
 * - Images services
 */

import { api } from "@/lib/api";
import type { UploadResponse } from "@/types/forms";

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
  formData.append("file", file); // ✅ 'file' singulier OK

  const response = await api.post<{ data: UploadResponse }>(
    "/upload/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

/**
 * Upload UNE SEULE image de portfolio
 * ⚠️ BACKEND ACCEPTE PLUSIEURS - utiliser uploadPortfolioImages() à la place
 *
 * @deprecated Utiliser uploadPortfolioImages() pour cohérence avec backend
 */
export const uploadPortfolioImage = async (
  file: File
): Promise<UploadResponse> => {
  // Appeler la version plurielle avec un seul fichier
  const results = await uploadPortfolioImages([file]);
  return results[0];
};

/**
 * Upload plusieurs images de portfolio
 *
 * ✅ ROUTE CORRECTE ALIGNÉE AVEC BACKEND
 * Backend: FilesInterceptor('files', 10)
 * Maximum 10 images par prestataire
 */
export const uploadPortfolioImages = async (
  files: File[]
): Promise<UploadResponse[]> => {
  console.log("uploadPortfolioImages called with", files.length, "files");

  const formData = new FormData();
  files.forEach((file, index) => {
    console.log(`Appending file ${index}:`, file.name);
    formData.append("files", file);
  });

  try {
    const response = await api.post<{
      success: boolean;
      data: { images: UploadResponse[] };
    }>("/upload/portfolio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Full response:", response);
    console.log("response.data:", response.data);
    console.log("response.data.data:", response.data.data);
    console.log("response.data.data.images:", response.data.data?.images);

    // ✅ CORRECTION: Structure = { success: true, data: { images: [...] } }
    if (response.data?.data?.images) {
      return response.data.data.images;
    }

    // Si aucun format ne correspond
    console.error("Unexpected response format:", response.data);
    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Upload portfolio error:", error);
    // if (error.response) {
    //   console.error('Error response:', error.response.data);
    //   console.error('Error status:', error.response.status);
    // }
    throw error;
  }
};

/**
 * Upload une image de service
 *
 * L'image est redimensionnée à 600x400 côté serveur
 */
export const uploadServiceImage = async (
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ success: boolean; data: UploadResponse }>(
    "/upload/service",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // ✅ CORRECTION: Accéder à response.data.data
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

// ==========================================
// ❌ FONCTION RETIRÉE - Route non implémentée côté backend
// ==========================================

/**
 * ⚠️ Cette fonction n'existe PAS dans le backend actuel
 *
 * Si vous avez besoin d'uploader des documents, ajoutez d'abord
 * la route correspondante dans upload.controller.ts backend :
 *
 * @Post('document')
 * @UseInterceptors(FileInterceptor('file'))
 * async uploadDocument(@UploadedFile() file: Express.Multer.File) {
 *   return this.uploadService.uploadDocument(file);
 * }
 */
// export const uploadDocument = async (file: File): Promise<UploadResponse> => {
//   throw new Error('Route /upload/document non implémentée côté backend');
// };

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
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (file.size > maxSize) {
  return `File exceeds maximum size of ${options?.maxSizeMB || 5} MB`;
  }

  if (!allowedTypes.includes(file.type)) {
     return "Unsupported file format. Use JPEG, PNG, GIF or WebP.";
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
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string => {
  if (!url || !url.includes("cloudinary.com")) {
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
  transformations.push(`f_${options?.format || "auto"}`);

  // Insérer les transformations dans l'URL
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
  }

  return url;
};
