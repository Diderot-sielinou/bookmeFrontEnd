# BookMe Frontend

Application frontend React pour la plateforme de réservation BookMe.

## 🛠 Stack Technique

- **React 18** avec TypeScript
- **Vite 5** pour le bundling et le dev server
- **TailwindCSS** pour le styling
- **shadcn/ui** pour les composants UI
- **React Router v6** pour le routing
- **React Query (TanStack Query)** pour le data fetching
- **Zustand** pour le state management global
- **React Hook Form + Zod** pour les formulaires
- **Socket.io Client** pour les WebSockets
- **Axios** pour les requêtes HTTP
- **date-fns** pour la manipulation des dates
- **Lucide React** pour les icônes

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/               # Composants UI shadcn/ui (20+ composants)
│   ├── shared/           # Composants partagés (EmptyState, LoadingSpinner, etc.)
│   ├── layout/           # Layouts (PublicLayout, AuthLayout, DashboardLayout)
│   ├── dashboard/        # Composants dashboard
│   └── search/           # Composants recherche
├── pages/
│   ├── public/           # Pages publiques (4)
│   ├── auth/             # Pages authentification (5)
│   ├── client/           # Pages client (6)
│   ├── prestataire/      # Pages prestataire (8)
│   └── admin/            # Pages admin (6)
├── services/             # Services API (11)
├── hooks/                # Custom hooks (6)
├── stores/               # Zustand stores (3)
├── lib/                  # Utilitaires (api, constants, queryClient, socket, utils)
├── types/                # Types TypeScript
└── utils/                # Fonctions utilitaires
```

## 📄 Pages Implémentées (30 pages)

### Pages Publiques (4)
- `HomePage` - Page d'accueil avec recherche et catégories
- `SearchPage` - Recherche de prestataires avec filtres
- `PrestataireProfilePage` - Profil public d'un prestataire
- `BookingPage` - Page de réservation

### Pages Authentification (5)
- `LoginPage` - Connexion
- `RegisterPage` - Inscription (client/prestataire)
- `ForgotPasswordPage` - Demande de réinitialisation mot de passe
- `ResetPasswordPage` - Réinitialisation du mot de passe
- `VerifyEmailPage` - Vérification de l'email

### Pages Client (6)
- `DashboardPage` - Tableau de bord client
- `AppointmentsPage` - Gestion des rendez-vous
- `MessagesPage` - Messagerie
- `ReviewsPage` - Avis laissés
- `ProfilePage` - Profil et paramètres
- `NotificationsPage` - Centre de notifications

### Pages Prestataire (8)
- `DashboardPage` - Tableau de bord prestataire avec statistiques
- `ProfilePage` - Gestion du profil public
- `ServicesPage` - Gestion des services proposés
- `SlotsPage` - Gestion des créneaux horaires
- `AppointmentsPage` - Gestion des rendez-vous clients
- `ReviewsPage` - Gestion des avis reçus et réponses
- `MessagesPage` - Messagerie avec les clients
- `SettingsPage` - Paramètres du compte

### Pages Admin (6)
- `DashboardPage` - Tableau de bord admin avec KPIs
- `UsersPage` - Gestion des utilisateurs
- `ValidationPage` - Validation des prestataires
- `ModerationPage` - Modération des avis
- `CategoriesPage` - Gestion des catégories
- `LogsPage` - Logs d'audit

### Page Erreur (1)
- `NotFoundPage` - Page 404

## 🔌 Services API (11)

| Service | Description |
|---------|-------------|
| `auth.service` | Authentification, tokens, profil |
| `appointments.service` | CRUD rendez-vous |
| `prestataires.service` | Recherche, profils prestataires |
| `services.service` | Gestion des services |
| `slots.service` | Gestion des créneaux |
| `reviews.service` | Avis et notes |
| `messages.service` | Messagerie |
| `notifications.service` | Notifications |
| `clients.service` | Profil client |
| `dashboard.service` | Statistiques |
| `upload.service` | Upload fichiers |

## 🪝 Custom Hooks (6)

- `useAuth` - Gestion authentification
- `useAppointments` - Gestion rendez-vous
- `useSlots` - Gestion créneaux
- `useReviews` - Gestion avis
- `useMessages` - Messagerie temps réel
- `useNotifications` - Notifications temps réel

## 🏪 Stores Zustand (3)

- `authStore` - État d'authentification
- `notificationStore` - Notifications
- `uiStore` - État UI (sidebar, modals, theme)

## ⚙️ Configuration

### Variables d'Environnement

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=BookMe
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview

# Lint
npm run lint
```

## 📊 Statistiques

- **30 pages** complètes et fonctionnelles
- **11 services** API
- **6 hooks** personnalisés
- **20+ composants** UI
- **25,000+ lignes** de code TypeScript/React
- **Build production**: ~1.1MB (312KB gzipped)

## 🔗 Intégration Backend

Cette application frontend s'intègre avec l'API BookMe (NestJS):
- API REST pour toutes les opérations CRUD
- WebSocket pour la messagerie temps réel
- JWT pour l'authentification
- Upload de fichiers multipart

## 📱 Responsive

L'application est entièrement responsive et optimisée pour:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)
