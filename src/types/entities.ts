/**
 * Types TypeScript pour BookMe
 * 
 * Ces types sont alignés avec les entités du backend NestJS.
 * Ils permettent un typage strict de toutes les données
 * échangées entre le frontend et l'API.
 */

// ==========================================
// ENUMS - Alignés avec backend constants
// ==========================================

/**
 * Rôles utilisateur
 * Détermine les permissions et l'accès aux différentes parties de l'app
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  PRESTATAIRE = 'PRESTATAIRE',
  ADMIN = 'ADMIN',
}

/**
 * Statuts du profil prestataire
 * Un prestataire doit être ACTIVE pour recevoir des réservations
 */
export enum PrestataireStatus {
  PENDING = 'PENDING',       // En attente de validation admin
  ACTIVE = 'ACTIVE',         // Actif, peut recevoir des réservations
  SUSPENDED = 'SUSPENDED',   // Suspendu par l'admin
  REJECTED = 'REJECTED',     // Rejeté lors de la validation
}

/**
 * Statuts des créneaux horaires
 */
export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',   // Disponible à la réservation
  RESERVED = 'RESERVED',     // Réservé par un client
  BLOCKED = 'BLOCKED',       // Bloqué par le prestataire (congés, etc.)
}

/**
 * Statuts des rendez-vous
 */
export enum AppointmentStatus {
  PENDING = 'PENDING',       // En attente de confirmation
  CONFIRMED = 'CONFIRMED',   // Confirmé
  CANCELLED = 'CANCELLED',   // Annulé
  COMPLETED = 'COMPLETED',   // Terminé
  NO_SHOW = 'NO_SHOW',       // Client absent
}

/**
 * Types de badges prestataire
 */
export enum BadgeType {
  TOP_RATED = 'TOP_RATED',     // Note ≥ 4.5 avec min 10 avis
  RESPONSIVE = 'RESPONSIVE',   // Répond rapidement
  RELIABLE = 'RELIABLE',       // Taux d'annulation < 5%
  POPULAR = 'POPULAR',         // 50+ RDV sur 3 mois
}

/**
 * Types de notifications
 */
export enum NotificationType {
  NEW_BOOKING = 'NEW_BOOKING',
  CANCELLATION = 'CANCELLATION',
  REMINDER = 'REMINDER',
  NEW_REVIEW = 'NEW_REVIEW',
  NEW_MESSAGE = 'NEW_MESSAGE',
  BADGE_EARNED = 'BADGE_EARNED',
  SYSTEM = 'SYSTEM',
}

// ==========================================
// ENTITÉS PRINCIPALES
// ==========================================

/**
 * Utilisateur de base
 * Contient les informations communes à tous les types d'utilisateurs
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profil client
 * Informations spécifiques aux clients qui réservent des RDV
 */
export interface Client {
  id: string;                    // Même ID que l'utilisateur associé
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
}

/**
 * Profil prestataire
 * Informations spécifiques aux professionnels qui proposent des services
 */
export interface Prestataire {
  id: string;                    // Même ID que l'utilisateur associé
  businessName: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  categories: string[];          // Liste des catégories de services
  phone: string;
  avatar: string | null;
  portfolioImages: string[];     // URLs des images du portfolio
  openingHours: OpeningHours | null;
  pauseDuration: number;         // Durée pause entre RDV (minutes)
  minBookingNotice: number;      // Préavis minimum réservation (heures)
  minCancellationHours: number;  // Délai minimum annulation (heures)
  cancellationPolicy: string | null;
  status: PrestataireStatus;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  website: string | null;        // Site web du prestataire
  isVerified: boolean;           // Prestataire vérifié par admin
  profileCompleted: boolean;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
  // Alias pour la compatibilité
  reviewCount?: number;          // Alias de totalReviews
  // Relations
  user?: User;
  services?: Service[];
  badges?: Badge[];
  reviews?: Review[];
}

/**
 * Service proposé par un prestataire
 */
export interface Service {
  id: string;
  prestataireId: string;
  name: string;
  description: string | null;
  duration: number;              // Durée en minutes
  price: number;                 // Prix en euros
  isActive: boolean;
  displayOrder: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  prestataire?: Prestataire;
}

/**
 * Créneau horaire
 */
export interface Slot {
  id: string;
  prestataireId: string;
  serviceId: string | null;
  date: string;                  // Format YYYY-MM-DD
  startTime: string;             // Format HH:mm
  endTime: string;               // Format HH:mm
  status: SlotStatus;
  notes: string | null;
  isRecurring: boolean;
  recurringPatternId: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  prestataire?: Prestataire;
  service?: Service;
  appointment?: Appointment;
}

/**
 * Rendez-vous
 */
export interface Appointment {
  id: string;
  clientId: string;
  prestataireId: string;
  slotId: string;
  serviceId: string;
  status: AppointmentStatus;
  clientNote: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  priceAtBooking: number;        // Prix au moment de la réservation
  reminder24hSent: boolean;
  reminder1hSent: boolean;
  reviewRequestSent: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  client?: Client;
  prestataire?: Prestataire;
  slot?: Slot;
  service?: Service;
  review?: Review;
  messages?: Message[];
}

/**
 * Avis client
 */
export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  prestataireId: string;
  rating: number;                // 1-5
  qualityRating: number | null;
  punctualityRating: number | null;
  cleanlinessRating: number | null;
  comment: string | null;
  prestataireResponse: string | null;
  responseAt: string | null;
  flagged: boolean;
  flagReason: string | null;
  editCount: number;
  editedAt: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  client?: Client;
  prestataire?: Prestataire;
  appointment?: Appointment;
}

/**
 * Message dans une conversation
 */
export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  read: boolean;
  readAt: string | null;
  flagged: boolean;
  flagReason: string | null;
  createdAt: string;
  // Relations
  appointment?: Appointment;
  sender?: User;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string | null;      // ID de l'entité liée (RDV, avis, etc.)
  data: Record<string, unknown> | null;
  read: boolean;
  readAt: string | null;
  emailSent: boolean;
  createdAt: string;
}

/**
 * Badge prestataire
 */
export interface Badge {
  id: string;
  prestataireId: string;
  type: BadgeType;
  name: string;                  // Nom affiché du badge
  description?: string;          // Description du badge
  awardedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

// ==========================================
// TYPES AUXILIAIRES
// ==========================================

/**
 * Horaires d'ouverture par jour
 */
export interface OpeningHours {
  monday?: DayHours[];
  tuesday?: DayHours[];
  wednesday?: DayHours[];
  thursday?: DayHours[];
  friday?: DayHours[];
  saturday?: DayHours[];
  sunday?: DayHours[];
}

export interface DayHours {
  start: string;  // Format HH:mm
  end: string;    // Format HH:mm
}

/**
 * Préférences de notification
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// ==========================================
// TYPES DE RÉPONSE API
// ==========================================

/**
 * Réponse API générique avec pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Réponse API simple
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Erreur API
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ==========================================
// TYPES DE RECHERCHE ET FILTRES
// ==========================================

/**
 * Résultat de recherche prestataire
 */
export interface SearchResult {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatar: string | null;
  categories: string[];
  city: string | null;
  postalCode: string | null;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  badges: Array<{
    type: BadgeType;
    awardedAt: string;
  }>;
  minPrice: number | null;
  maxPrice: number | null;
}

/**
 * Filtres de recherche prestataire
 */
export interface SearchFilters {
  query?: string;
  categories?: string[];
  city?: string;
  postalCode?: string;
  minRating?: number;
  maxPrice?: number;
  badges?: BadgeType[];
  hasAvailability?: boolean;
  sortBy?: 'rating' | 'reviews' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Filtres de liste des RDV
 */
export interface AppointmentFilters {
  status?: AppointmentStatus | AppointmentStatus[];
  prestataireId?: string;
  clientId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// TYPES STATISTIQUES DASHBOARD
// ==========================================

/**
 * Statistiques dashboard prestataire
 */
export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  cancellationRate: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

/**
 * Données pour graphique RDV par jour
 */
export interface AppointmentsByDay {
  date: string;
  count: number;
  revenue: number;
}

/**
 * Données pour graphique revenus par mois
 */
export interface RevenueByMonth {
  month: string;
  revenue: number;
  count: number;
}

/**
 * Distribution des notes
 */
export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

// ==========================================
// TYPES ADMIN
// ==========================================

/**
 * Statistiques admin plateforme
 */
export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalPrestataires: number;
  pendingPrestataires: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

/**
 * Log d'audit
 */
export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: User;
}

// ==========================================
// TYPES CONVERSATION/MESSAGERIE
// ==========================================

/**
 * Conversation (regroupement de messages par RDV)
 */
export interface Conversation {
  appointmentId: string;
  appointment: Appointment;
  lastMessage: Message | null;
  unreadCount: number;
  otherParticipant: Client | Prestataire;
}
