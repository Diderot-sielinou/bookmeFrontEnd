/**
 * Export centralisé des services API
 * 
 * ALIGNÉ AVEC BACKEND - Mis à jour pour BookMe Admin
 */

// Grouped service exports
export { authService } from "./auth.service";
export { prestatairesService, servicesService } from "./prestataires.service";

// Individual function exports from auth
export {
  login,
  logout,
  refreshToken,
  registerClient,
  registerPrestataire,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateClientProfile,
  updatePrestataireProfile,
} from "./auth.service";

// Individual function exports from prestataires
export {
  searchPrestataires,
  getSearchSuggestions,
  getPopularCategories,
  getPrestataireById,
  getPrestataireServices,
  getPrestataireReviews,
  getMyPrestataireProfile,
  updateMyPrestataireProfile,
  getMyServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
  getPrestataireBadges,
  getMyBadges,
} from "./prestataires.service";

// Appointments service
export {
  getMyAppointments,
  getAppointmentById,
  bookAppointment,
  cancelAppointment,
  completeAppointment,
} from "./appointments.service";

// Slots service
export {
  getMySlots as getSlots,
  getAvailableSlots,
  createSlot,
  createRecurringSlots,
  updateSlot,
  deleteSlot,
  blockSlots as blockSlot,
  unblockSlot,
} from "./slots.service";

// Reviews service
export {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getPrestataireReviewsService,
  respondToReview,
} from "./reviews.service";

// Messages service
export {
  getConversations,
  getUnreadCount,
  getMessagesByAppointment,
  sendMessage,
  markAsRead,
  markMessagesAsRead,
  flagMessage,
} from "./messages.service";

// Notifications service
export {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notifications.service";

// Clients service
export {
  getMyClientProfile,
  getClientProfile,
  updateMyClientProfile,
  updateClientProfileService,
  getClientById,
} from "./clients.service";

// Upload service
export {
  uploadAvatar,
  uploadPortfolioImage,
  uploadPortfolioImages,
  uploadServiceImage,
  deleteFile,
  validateFile,
  getOptimizedImageUrl,
} from "./upload.service";

// Create grouped service objects for convenience
import * as appointmentsFns from "./appointments.service";
import * as slotsFns from "./slots.service";
import * as reviewsFns from "./reviews.service";
import * as messagesFns from "./messages.service";
import * as notificationsFns from "./notifications.service";
import * as clientsFns from "./clients.service";
import * as uploadFns from "./upload.service";
import * as adminFns from "./admin.service";

export const appointmentsService = {
  getMyAppointments: appointmentsFns.getMyAppointments,
  getAppointmentById: appointmentsFns.getAppointmentById,
  bookAppointment: appointmentsFns.bookAppointment,
  cancelAppointment: appointmentsFns.cancelAppointment,
  completeAppointment: appointmentsFns.completeAppointment,
};

export const slotsService = {
  getSlots: slotsFns.getMySlots,
  getAvailableSlots: slotsFns.getAvailableSlots,
  createSlot: slotsFns.createSlot,
  createRecurringSlots: slotsFns.createRecurringSlots,
  updateSlot: slotsFns.updateSlot,
  deleteSlot: slotsFns.deleteSlot,
  blockSlot: slotsFns.blockSlots,
  unblockSlot: slotsFns.unblockSlot,
};

export const reviewsService = {
  createReview: reviewsFns.createReview,
  updateReview: reviewsFns.updateReview,
  deleteReview: reviewsFns.deleteReview,
  getMyReviews: reviewsFns.getMyReviews,
  getPrestataireReviews: reviewsFns.getPrestataireReviewsService,
  respondToReview: reviewsFns.respondToReview,
};

export const messagesService = {
  getConversations: messagesFns.getConversations,
  getMessagesByAppointment: messagesFns.getMessagesByAppointment,
  sendMessage: messagesFns.sendMessage,
  markAsRead: messagesFns.markMessagesAsRead,
  getUnreadCount: messagesFns.getUnreadCount,
  flagMessage: messagesFns.flagMessage,
};

export const notificationsService = {
  getNotifications: notificationsFns.getNotifications,
  markAsRead: notificationsFns.markNotificationAsRead,
  markAllAsRead: notificationsFns.markAllAsRead,
  delete: notificationsFns.deleteNotification,
};

export const clientsService = {
  getMyProfile: clientsFns.getMyClientProfile,
  getProfile: clientsFns.getClientProfile,
  updateProfile: clientsFns.updateMyClientProfile,
  updateMyProfile: clientsFns.updateMyClientProfile,
  getById: clientsFns.getClientById,
};

export const uploadService = {
  uploadAvatar: uploadFns.uploadAvatar,
  uploadPortfolioImage: uploadFns.uploadPortfolioImage,
  uploadPortfolioImages: uploadFns.uploadPortfolioImages,
  uploadServiceImage: uploadFns.uploadServiceImage,
  deleteFile: uploadFns.deleteFile,
  validateFile: uploadFns.validateFile,
  getOptimizedImageUrl: uploadFns.getOptimizedImageUrl,
};

// ==========================================
// ADMIN SERVICE - ALIGNÉ AVEC BACKEND
// ==========================================

export {
  getAdminStats,
  getUsers,
  suspendUser,
  reactivateUser,
  deleteUser,
  getPendingPrestataires,
  approvePrestataire,
  rejectPrestataire,
  getFlaggedReviews,
  hideReview,
  unflagReview,
  approveReview,
  deleteReview as deleteReviewAdmin,
  warnReviewAuthor,
  getAuditLogs,
  // Catégories (TODO backend)
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./admin.service";

export type {
  AdminStats,
  UsersFilters,
  AuditLogsFilters,
  AuditLog,
  PendingPrestataire,
  FlaggedReview,
  AdminUser,
  Category,
} from "./admin.service";

export const adminService = {
  // Statistiques
  getStats: adminFns.getAdminStats,

  // Utilisateurs
  getUsers: adminFns.getUsers,
  suspendUser: adminFns.suspendUser,
  reactivateUser: adminFns.reactivateUser,
  deleteUser: adminFns.deleteUser,

  // Prestataires
  getPendingPrestataires: adminFns.getPendingPrestataires,
  approvePrestataire: adminFns.approvePrestataire,
  rejectPrestataire: adminFns.rejectPrestataire,

  // Avis
  getFlaggedReviews: adminFns.getFlaggedReviews,
  hideReview: adminFns.hideReview,
  unflagReview: adminFns.unflagReview,
  approveReview: adminFns.approveReview,
  deleteReview: adminFns.deleteReview,
  warnReviewAuthor: adminFns.warnReviewAuthor,

  // Logs
  getAuditLogs: adminFns.getAuditLogs,

  // Catégories (TODO: à implémenter côté backend)
  getCategories: adminFns.getCategories,
  createCategory: adminFns.createCategory,
  updateCategory: adminFns.updateCategory,
  deleteCategory: adminFns.deleteCategory,
};
