
# SamBring Driver Dashboard

A modern Vue.js dashboard for eco-delivery drivers built with TypeScript, Tailwind CSS, and Chart.js.

## Features

- **Vue 3 + TypeScript**: Modern reactive framework with type safety
- **Auth & Guards**: `/login` view, session management, and router guards that protect all routes except login
- **Live Data Integration**: Active and past deliveries, driver profile, and dashboard signups wired to the backend
- **Package Actions**: Pick up and deliver flows with modal, optimistic refresh, and toasts
- **Global UX**: Centralized toasts and consistent loading spinners/empty states
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Icon System**: Consistent lucide-vue-next icons throughout

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Vue Router for navigation
- Chart.js + vue-chartjs for analytics
- Tailwind CSS for styling
- Lucide Vue Next for icons
- Vite for build tooling

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure (highlights)

- `src/api/`
  - `http.ts` — Fetch wrapper (base URL, credentials, auth headers, CSRF, retry)
  - `auth.ts` — login, logout, signup, change password
  - `driver.ts` — deliveries and profile
  - `packages.ts` — pickup and deliver actions
  - `dashboard.ts` — user signups
- `src/composables/`
  - `useAuth.ts` — session state; login/logout/signup/changePassword
  - `useDriverDeliveries.ts` — future/past deliveries
  - `useDriverProfile.ts` — driver profile
  - `useDashboardStats.ts` — signups data
- `src/components/`
  - `ActiveDeliveriesFromApi.vue` — API-driven list with actions
  - `PackageDeliveryModal.vue` — deliver modal
  - `DriverProfile.vue` — profile card wired to API
  - `AnalyticsCharts.vue` — dashboard charts (live signups)
  - `ToastHost.vue` — global toast container
  - `Spinner.vue` — loading indicator
- `src/router/` — guards + routes (login, protected views)
- `src/types/` — API models and enums
- `src/utils/` — `toast.ts` utility

## Environment Configuration

The app reads API configuration from environment variables (Vite):

- `VITE_API_BASE_URL` — Base URL for the backend (default: `https://test.sambring.no`).
- `VITE_API_KEY` — Optional send `Authorization` header.
  - If it already contains a scheme (e.g., `ApiKey X` or `Bearer Y`), it is sent as-is.
  - Without a scheme, it is sent as `ApiKey <value>`.

Create a `.env` file (or `.env.local`) based on `.env.example`:

```env
VITE_API_BASE_URL=https://test.sambring.no
# VITE_API_KEY=ApiKey YOUR_KEY
```

## Development Proxy (cookieAuth friendly)

To avoid CORS issues and support session cookies during development, the Vite dev server proxies API routes to the backend target from `VITE_API_BASE_URL`:

- Proxied paths:
  - `/api/**` → `${VITE_API_BASE_URL}`
  - `/dashboard/api/**` → `${VITE_API_BASE_URL}`

`vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': { target, changeOrigin: true, secure: true },
    '/dashboard/api': { target, changeOrigin: true, secure: true },
  },
}
```

This allows cookie-based auth (session cookie) to work seamlessly in dev.

## Auth & Security

- **Cookie-based sessions (default)**
  - All requests include credentials (`credentials: 'include'`).
  - Router guards protect all routes except `/login`.
  - Global 401 handler clears session and redirects to `/login` with `redirect` query.
- **CSRF support**
  - For unsafe methods (POST/PUT/PATCH/DELETE), the client sends `X-CSRFToken` if a CSRF cookie exists.
  - Recognized cookie names: `csrftoken`, `csrf`, `csrf_token`.
- **Optional Authorization header**
  - If `VITE_API_KEY` is set, an `Authorization` header is attached (ApiKey or Bearer).
  - Basic auth is also supported via the request `auth.basic` option.
- **Resilience**
  - GET requests retry once on transient 5xx.

## API Layer

- HTTP client: `src/api/http.ts` (base URL, query, JSON, error normalization, 401 handling, CSRF, retry)
- Services:
  - `src/api/auth.ts` — login, logout, signup, change password
  - `src/api/driver.ts` — deliveries list and driver profile
  - `src/api/packages.ts` — pickup and deliver actions
  - `src/api/dashboard.ts` — user signup stats
- Types: `src/types/api.ts` contains API models and enums

## Manual Test Plan

1. Login & Guards
   - Visit a protected route (e.g., `/active`) and verify redirect to `/login`.
   - Submit invalid credentials → error message.
   - Submit valid credentials → redirected back to intended route.
2. Active Deliveries (future)
   - Visit `/active`. Spinner appears while loading, then items render or an empty state.
   - Click “Pick up” on a package → success toast and list refresh.
   - Click “Deliver” → modal opens. Enter `delivered_to` and optional notes, submit → success toast and list refresh.
3. Delivery History (past)
   - Visit `/history`. Spinner shows while loading; past deliveries render or empty state.
4. Driver Profile
   - Visit `/profile`. Overlay spinner shows while loading; details populate after fetch.
5. Dashboard Signups
   - On the dashboard, the “User Signups” chart overlays a spinner during fetch; data updates with latest points.
6. Unauthorized handling
   - Clear cookies or expire the session; next API call should 401, clearing local session and redirecting to `/login`.
7. CSRF
   - Ensure the backend issues a CSRF cookie (e.g., `csrftoken`). Verify unsafe actions still succeed.
8. Logout
   - Call logout (via UI or console using `useAuth().logout()`) and confirm redirect to `/login`.

## Notes

- For production deployments behind a shared domain, set `VITE_API_BASE_URL` to the API origin and ensure cookies/CSRF are configured on the backend.
- The toast system is globally available; see `src/utils/toast.ts` and `src/components/ToastHost.vue`.
- Spinners are available via `src/components/Spinner.vue` and are integrated into data-driven views.
