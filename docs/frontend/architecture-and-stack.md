# Architecture and tech stack

## High-level architecture

The app is a **single-page application (SPA)**. The browser loads one HTML shell; React mounts at `#root` and **client-side routing** swaps page components without full page reloads.

Data flows **from** the ASP.NET backend (`https://localhost:7081` in code) **to** React via REST calls (Axios) and optionally **SignalR** for realtime events on the shelter owner side.

## Runtime and build tooling

| Piece | Role in this project |
|--------|----------------------|
| **Vite** | Dev server (HMR), production bundling (`npm run build`), plugin pipeline |
| **`@vitejs/plugin-react`** | Fast Refresh, JSX compilation |
| **`@tailwindcss/vite`** | Integrates Tailwind v4 into the Vite build (see `vite.config.js`) |

Entry sequence:

1. `index.html` loads `src/main.jsx`.
2. `main.jsx` imports global styles (`index.css`), mounts `<App />`, and renders **Sonner** `<Toaster />` for global toast notifications.
3. `App.jsx` wraps the tree in `<BrowserRouter>` and declares all `<Route>` definitions.

**Note:** `main.jsx` imports `BrowserRouter` but does **not** render it; routing is entirely inside `App.jsx`. The unused import in `main.jsx` is harmless but could be removed for cleanliness.

## UI libraries

| Library | Usage |
|---------|--------|
| **React 19** | Components, hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) |
| **react-router-dom 7** | `BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `NavLink`, `Outlet`, `useNavigate`, `useOutletContext` |
| **Tailwind CSS 4** | Utility classes; project tokens in `index.css` (`--pa-*`) |
| **lucide-react** | Icons (e.g. sidebar, login form) |
| **sonner** | `toast.success` / `toast.error` from Login/Register flows |

## State management

There is **no global Redux**.

- **Auth token:** **Zustand** store `src/store/authStore.js` exposes `accessToken`, `setAccessToken`, `clearAuth`.
- **Page-local state:** `useState` / `useReducer` inside pages and hooks (e.g. shelter dashboard hook, adopter profile).
- **Route-scoped “shared” state for owner area:** React Router **`Outlet`** **context** — the shelter layout passes the entire `useShelterDashboard()` return object to child routes so `/owner` and `/owner/requests` share one data subscription and one SignalR connection.

## Networking

- **Axios** default instance in `src/api/api.js`:
  - `baseURL`: `https://localhost:7081/api`
  - `withCredentials: true` — sends cookies cross-site when configured; aligns with backend refresh-cookie patterns
  - `timeout`: 5000 ms on main instance (`refreshApi` has no timeout, so refresh is less likely to abort mid-flight)

Auth-specific thin wrappers live in `src/api/auth.api.js` (`login`, `register`) using the same Axios instance — so interceptors apply to them too.

## Realtime

- **`@microsoft/signalr`** is used only in **`useShelterDashboard`** (`src/hooks/useShelterDashboard.js`).
- Connection URL uses **`ORIGIN_URL`** (scheme + host **without** `/api`): `https://localhost:7081/hubs/notifications`.
- JWT is supplied via `accessTokenFactory` on the hub connection; `withCredentials: true` is also set on the transport.

## Code style / quality

- **ESLint** flat config (`eslint.config.js`) with React Hooks rules.
- Project uses **JavaScript** (`.jsx`) — no TypeScript layer on the frontend at this time.

## Design systems (two visual “zones”)

1. **Auth pages (Login / Register):** mostly **inline Tailwind** with hard-coded hex colors (`#6a79e0`, `#2a2f63`, etc.) for a marketing-style layout.
2. **In-app “PetPal / PawAdopt” shell:** uses **CSS variables** `--pa-primary`, `--pa-bg`, etc., and **`pa-*` utility classes** in `index.css` for cards, buttons, pills.

Being able to explain **why** there are two styles (iterative builds / different sources) is useful if a TA asks about consistency.
