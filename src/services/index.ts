/**
 * Export centralisé des services API
 */

// Grouped service exports
export { authService } from './auth.service';
export { prestatairesService, servicesService } from './prestataires.service';

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
} from './auth.service';

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
} from './prestataires.service';

// Appointments service
export {
  getMyAppointments,
  getAppointmentById,
  bookAppointment,
  cancelAppointment,
  // confirmAppointment,
  completeAppointment,
  // markNoShow,
  // getPrestataireAppointments,
} from './appointments.service';

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
} from './slots.service';

// Reviews service
export {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getPrestataireReviewsService,
  respondToReview,
} from './reviews.service';

// Messages service
export {
  getConversations,
  getUnreadCount,
  getMessagesByAppointment,
  sendMessage,
  markAsRead,
  markMessagesAsRead,  // ✅ S'assurer que c'est exporté
  flagMessage,
} from './messages.service';

// Notifications service
export {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from './notifications.service';

// Clients service
export {
  getClientProfile,
  updateClientProfileService,
} from './clients.service';

// Upload service - ✅ EXPORTS CORRIGÉS
export {
  uploadAvatar,
  uploadPortfolioImage,
  uploadPortfolioImages,
  uploadServiceImage,
  deleteFile,
  validateFile,
  getOptimizedImageUrl,
} from './upload.service';


// Create grouped service objects for convenience
import * as appointmentsFns from './appointments.service';
import * as slotsFns from './slots.service';
import * as reviewsFns from './reviews.service';
import * as messagesFns from './messages.service';
import * as notificationsFns from './notifications.service';
import * as clientsFns from './clients.service';
import * as dashboardFns from './dashboard.service';
import * as uploadFns from './upload.service';

export const appointmentsService = {
  getMyAppointments: appointmentsFns.getMyAppointments,
  getAppointmentById: appointmentsFns.getAppointmentById,
  bookAppointment: appointmentsFns.bookAppointment,
  cancelAppointment: appointmentsFns.cancelAppointment,
  // confirmAppointment: appointmentsFns.confirmAppointment,
  completeAppointment: appointmentsFns.completeAppointment,
  // markNoShow: appointmentsFns.markNoShow,
  // getPrestataireAppointments: appointmentsFns.getPrestataireAppointments,
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
};

export const notificationsService = {
  getNotifications: notificationsFns.getNotifications,
  markAsRead: notificationsFns.markNotificationAsRead,
  markAllAsRead: notificationsFns.markAllAsRead,
  delete: notificationsFns.deleteNotification,
};

export const clientsService = {
  getProfile: clientsFns.getClientProfile,
  updateProfile: clientsFns.updateClientProfileService,
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
