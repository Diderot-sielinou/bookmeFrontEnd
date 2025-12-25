import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/lib/queryClient";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { showInfo, Toaster } from "@/components/ui/toast";
import { useMessageStore } from "@/stores/messageStore";

// Layouts
import { PublicLayout, AuthLayout, DashboardLayout } from "@/components/layout";
import { GuestRoute, ProtectedRoute } from "@/components/shared";

// Pages publiques
import HomePage from "@/pages/public/HomePage";
import SearchPage from "@/pages/public/SearchPage";
import PublicPrestataireProfilePage from "@/pages/public/PrestataireProfilePage";
import BookingPage from "@/pages/public/BookingPage";

// Pages auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Pages client
import ClientDashboardPage from "@/pages/client/DashboardPage";
import ClientAppointmentsPage from "@/pages/client/AppointmentsPage";
import ClientMessagesPage from "@/pages/client/MessagesPage";
import ClientReviewsPage from "@/pages/client/ReviewsPage";
import ClientProfilePage from "@/pages/client/ProfilePage";
import ClientNotificationsPage from "@/pages/client/NotificationsPage";

// Pages prestataire
import PrestataireDashboardPage from "@/pages/prestataire/DashboardPage";
import PrestataireMyProfilePage from "@/pages/prestataire/ProfilePage";
import PrestataireServicesPage from "@/pages/prestataire/ServicesPage";
import PrestataireSlotsPage from "@/pages/prestataire/SlotsPage";
import PrestataireAppointmentsPage from "@/pages/prestataire/AppointmentsPage";
import PrestataireReviewsPage from "@/pages/prestataire/ReviewsPage";
import PrestataireMessagesPage from "@/pages/prestataire/MessagesPage";
import PrestataireSettingsPage from "@/pages/prestataire/SettingsPage";

// Pages admin
// import AdminDashboardPage from '@/pages/admin/DashboardPage';
// import AdminUsersPage from '@/pages/admin/UsersPage';
// import AdminValidationPage from '@/pages/admin/ValidationPage';
// import AdminModerationPage from '@/pages/admin/ModerationPage';
// import AdminCategoriesPage from '@/pages/admin/CategoriesPage';
// import AdminLogsPage from '@/pages/admin/LogsPage';

// Error pages
import NotFoundPage from "@/pages/NotFoundPage";
import { subscribeToMessageNotifications } from "./lib/socket";
import NotificationsPage from "./pages/prestataire/NotificationsPage";

// ==========================================
// APP INITIALIZER
// ==========================================

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const incrementUnread = useMessageStore((state) => state.incrementUnread);
  const fetchUnreadCount = useMessageStore((state) => state.fetchUnreadCount);

  // Initialiser l'authentification au montage
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Connecter les WebSockets
  useSocket();

  // Charger le compteur de messages non lus
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Écouter les notifications de messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribeToMessageNotifications((data) => {
      showInfo("Nouveau message", data.preview);
      incrementUnread();
    });

    return unsubscribe;
  }, [isAuthenticated, incrementUnread]);

  return <>{children}</>;
}

// ==========================================
// APP COMPONENT
// ==========================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            {/* ==========================================
                ROUTES PUBLIQUES
                ========================================== */}
            <Route element={<PublicLayout showSearch />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.SEARCH} element={<SearchPage />} />
              <Route
                path={ROUTES.PRESTATAIRE_PUBLIC_PROFILE}
                element={<PublicPrestataireProfilePage />}
              />
            </Route>

            {/* Booking page (public layout without search) */}
            <Route element={<PublicLayout />}>
              <Route path="/book/:id" element={<BookingPage />} />
            </Route>

            {/* ==========================================
                ROUTES AUTH (non connecté seulement)
                ========================================== */}
            <Route element={<AuthLayout />}>
              <Route
                path={ROUTES.LOGIN}
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path={ROUTES.REGISTER}
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route
                path={ROUTES.FORGOT_PASSWORD}
                element={<ForgotPasswordPage />}
              />
              <Route
                path={ROUTES.RESET_PASSWORD}
                element={<ResetPasswordPage />}
              />
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            </Route>

            {/* ==========================================
                ROUTES CLIENT
                ========================================== */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["CLIENT"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path={ROUTES.CLIENT_DASHBOARD}
                element={<ClientDashboardPage />}
              />
              <Route
                path={ROUTES.CLIENT_APPOINTMENTS}
                element={<ClientAppointmentsPage />}
              />
              <Route
                path={ROUTES.CLIENT_MESSAGES}
                element={<ClientMessagesPage />}
              />
              <Route
                path={ROUTES.CLIENT_REVIEWS}
                element={<ClientReviewsPage />}
              />
              <Route
                path={ROUTES.CLIENT_PROFILE}
                element={<ClientProfilePage />}
              />
              <Route
                path={ROUTES.CLIENT_NOTIFICATIONS}
                element={<ClientNotificationsPage />}
              />
            </Route>

            {/* ==========================================
                ROUTES PRESTATAIRE
                ========================================== */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["PRESTATAIRE"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path={ROUTES.PRESTATAIRE_DASHBOARD}
                element={<PrestataireDashboardPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_PROFILE}
                element={<PrestataireMyProfilePage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_SERVICES}
                element={<PrestataireServicesPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_SLOTS}
                element={<PrestataireSlotsPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_APPOINTMENTS}
                element={<PrestataireAppointmentsPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_REVIEWS}
                element={<PrestataireReviewsPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_MESSAGES}
                element={<PrestataireMessagesPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_NOTIFICATION}
                element={<NotificationsPage />}
              />
              <Route
                path={ROUTES.PRESTATAIRE_SETTINGS}
                element={<PrestataireSettingsPage />}
              />
            </Route>

            {/* ==========================================
                ROUTES ADMIN
                ========================================== */}
            {/* <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
              <Route path={ROUTES.ADMIN_PRESTATAIRES_VALIDATION} element={<AdminValidationPage />} />
              <Route path={ROUTES.ADMIN_REVIEWS_MODERATION} element={<AdminModerationPage />} />
              <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
              <Route path={ROUTES.ADMIN_LOGS} element={<AdminLogsPage />} />
            </Route> */}

            {/* ==========================================
                404 et redirections
                ========================================== */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster />
        </AppInitializer>
      </BrowserRouter>

      {/* React Query Devtools (dev only) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
function incrementUnreadMessages() {
  throw new Error("Function not implemented.");
}
