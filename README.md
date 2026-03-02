# BookMe Frontend

> React client for the BookMe appointment booking platform.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://bookme-front-end-9a8n.vercel.app)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | TailwindCSS + shadcn/ui |
| Routing | React Router v6 |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Real-time | Socket.io Client |
| Icons | Lucide React |
| Date Utilities | date-fns |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation
```bash
git clone https://github.com/Diderot-sielinou/bookmeFrontEnd.git
cd bookmeFrontEnd
npm install
```

### Environment Variables

Create a `.env` file at the root:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=BookMe
```

### Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Project Structure
```
src/
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── shared/       # Reusable components (EmptyState, LoadingSpinner…)
│   ├── layout/       # App layouts (PublicLayout, AuthLayout, DashboardLayout)
│   ├── dashboard/    # Dashboard-specific components
│   └── search/       # Search UI components
├── pages/
│   ├── public/       # Public-facing pages
│   ├── auth/         # Authentication pages
│   ├── client/       # Client dashboard pages
│   ├── prestataire/  # Provider dashboard pages
│   └── admin/        # Admin panel pages
├── services/         # API service layer
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── lib/              # API client, constants, socket, query config
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

---

## Pages

### Public
| Page | Route |
|---|---|
| Home | `/` |
| Search | `/search` |
| Provider Profile | `/providers/:id` |
| Booking | `/book/:id` |

### Authentication
| Page | Route |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |
| Verify Email | `/verify-email` |

### Client Dashboard
| Page | Description |
|---|---|
| Dashboard | Overview and upcoming appointments |
| Appointments | Manage bookings |
| Messages | Chat with providers |
| Reviews | View submitted reviews |
| Profile | Account settings |
| Notifications | Notification center |

### Provider Dashboard
| Page | Description |
|---|---|
| Dashboard | Stats and activity overview |
| Profile | Manage public profile |
| Services | Define offered services |
| Slots | Manage availability |
| Appointments | View and manage client bookings |
| Reviews | Read and reply to reviews |
| Messages | Chat with clients |
| Settings | Account configuration |

### Admin Panel
| Page | Description |
|---|---|
| Dashboard | Platform KPIs |
| Users | User management |
| Validation | Provider approval queue |
| Moderation | Review moderation |
| Categories | Category management |
| Logs | Audit logs |

---

## Key Features

- **JWT Authentication** — Access/refresh token flow with protected routes via `PrivateRoute`
- **Role-based UI** — Separate dashboards and views for clients, providers, and admins
- **Real-time Messaging** — Per-appointment chat powered by Socket.io
- **Live Notifications** — Booking events pushed via WebSocket
- **Availability Booking** — Dynamic slot selection with conflict prevention
- **Responsive Design** — Optimized for mobile, tablet, and desktop

---

## API Integration

This frontend connects to the [BookMe API](https://github.com/Diderot-sielinou/bookMeApp-api) (NestJS + PostgreSQL).

- REST for all CRUD operations
- WebSocket for real-time messaging and notifications
- JWT Bearer tokens in `Authorization` headers
- Multipart upload for profile images

---

## Build Output

| Metric | Value |
|---|---|
| Bundle size | ~1.1 MB |
| Gzipped | ~312 KB |
| Pages | 30 |
| API services | 11 |
| Custom hooks | 6 |
