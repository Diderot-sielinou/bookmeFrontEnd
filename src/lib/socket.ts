import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const SOCKET_BASE_URL = API_URL.replace("/api", "");

let socket: Socket | null = null;

// ==========================================
// TYPES
// ==========================================

export type SocketEventType =
  | "notification"
  | "new-booking"
  | "booking-cancelled"
  | "new-message"
  | "new-review"
  | "message-notification"
  | "badge-earned";

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export type SocketEventCallback<T = unknown> = (data: T) => void;

// ==========================================
// GESTION DU SOCKET
// ==========================================

export const createSocket = (): Socket => {
  // Si un socket existe déjà et est connecté, on le garde
  if (socket?.connected) return socket;

  /**
   * IMPORTANT: On se connecte à SOCKET_BASE_URL (ex: http://localhost:3000)
   * et on spécifie le namespace '/notifications' séparément.
   */
  socket = io(`${SOCKET_BASE_URL}/notifications`, {
    auth: {
      token: getAccessToken(),
    },
    path: "/socket.io", // Doit correspondre à la config NestJS (par défaut /socket.io)
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
  });

  // LOGS DE DEBUGGING
  socket.on("connect", () => {
    console.log("✅ [Socket] Connecté au namespace /notifications");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ [Socket] Erreur de connexion:", error.message);
    // Si erreur 401/Unauthorized, on arrête de spammer le serveur
    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("jwt")
    ) {
      socket?.disconnect();
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("ℹ️ [Socket] Déconnecté:", reason);
  });

  return socket;
};

export const connectSocket = (): void => {
  const token = getAccessToken();
  if (!token) return;

  if (!socket) {
    socket = createSocket();
  }

  // Mise à jour du token avant connexion
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => socket?.connected ?? false;

// ==========================================
// ABONNEMENTS
// ==========================================

export const subscribeToEvent = <T>(
  event: SocketEventType,
  callback: SocketEventCallback<T>
): (() => void) => {
  if (!socket) {
    // Si on essaie d'écouter avant la connexion, on force la création
    socket = createSocket();
  }

  socket.on(event, callback);
  return () => {
    socket?.off(event, callback);
  };
};

// Helpers d'abonnement
export const subscribeToNotifications = (
  cb: SocketEventCallback<NotificationPayload>
) => subscribeToEvent("notification", cb);
export const subscribeToNewMessages = (
  cb: SocketEventCallback<NotificationPayload>
) => subscribeToEvent("new-message", cb);
// socket.ts - Ajouter
export const subscribeToMessageNotifications = (
  cb: SocketEventCallback<{
    appointmentId: string;
    preview: string;
  }>
) => subscribeToEvent("message-notification", cb);

export const emitEvent = (event: string, data?: unknown): void => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};
