# Routing and navigation

Routing is declared in `src/App.jsx` inside a single `<BrowserRouter>` wrapping `<Routes>`.

## Route table

| Path | Component | Notes |
|------|-----------|--------|
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/unauthorized` | `Unauthorized` | Simple placeholder page; Axios **403** handler redirects here |
| `/adopter/profile` | `AdopterProfile` | Adopter main screen |
| `/adopter` | `Navigate` → `/adopter/profile` | Convenience redirect |
| `/owner` | `ShelterOwnerLayout` | **Parent layout** with nested children |
| `/owner` (index) | `ShelterDashboardPage` | Default child when path is exactly `/owner` |
| `/owner/requests` | `ShelterRequestsPage` | Adoption requests full view |
| `/admin/*` | `AdminDashboard` | Placeholder |
| `/` | `Navigate` → `/login` | Root redirect |
| `*` | `Navigate` → `/login` | Unknown paths fall back to login (aggressive default) |

## Nested routing under `/owner`

This uses React Router **nested routes**:

```jsx
<Route path="/owner" element={<ShelterOwnerLayout />}>
  <Route index element={<ShelterDashboardPage />} />
  <Route path="requests" element={<ShelterRequestsPage />} />
</Route>
```

**Why nesting matters:**

- **One layout mount** keeps sidebar + header + modal + realtime toasts persistent while switching URLs.
- **URLs are bookmarkable**: `/owner` vs `/owner/requests`.

The layout renders `<Outlet context={dashboard} />` (`ShelterOwnerLayout.jsx`). Children read that object via `useShelterOwnerOutlet()` (wrapper around `useOutletContext()`).

## Navigation components

### Sidebar (`ShelterSidebar.jsx`)

Uses **`NavLink`** with:

- Dashboard → `to="/owner"` with `end` so `/owner/requests` does **not** mark dashboard active.
- Requests → `to="/owner/requests"`.

Mobile drawer closes via **`onNavigate`** callback from the parent (`setSidebarOpen(false)`).

### Programmatic navigation

- **Login:** on success calls `navigate("/owner")` — see limitations doc for role mismatch.
- **Register:** navigates to `/login` only when role is **Adopter**; shelter path shows success toast without redirect.

### Declarative redirects

- `Navigate` components for `/` and `*` and `/adopter` shortcut.

## What is *not* protected yet

`ProtectedRoute` exists in `components/ProtectedRoute.jsx` but is **commented out** in `App.jsx`. Routes are reachable without enforcing login or role checks on the frontend (backend may still enforce — explain defense in depth).
