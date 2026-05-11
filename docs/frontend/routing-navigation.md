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
| `/owner/dashboard` | `Navigate` → `/owner` | Compatibility redirect for older links/bookmarks |
| `/owner/requests` | `ShelterRequestsPage` | Adoption requests full view |
| `/admin/*` | `AdminDashboard` | Placeholder |
| `/` | `Navigate` → `/login` | Root redirect |
| `*` | `Navigate` → `/login` | Unknown paths fall back to login (aggressive default) |

## Nested routing under `/owner`

This uses React Router **nested routes**:

```jsx
<Route path="/owner" element={<ShelterOwnerLayout />}>
  <Route index element={<ShelterDashboardPage />} />
  <Route path="dashboard" element={<Navigate to="/owner" replace />} />
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

- **Login:** on success redirects based on role (Owner → `/owner`, Adopter → `/adopter/profile`).
- **Register:** navigates to `/login` only when role is **Adopter**; shelter path shows success toast without redirect.

### Declarative redirects

- `Navigate` components for `/` and `*` and `/adopter` shortcut.

## What is *not* protected yet

`ProtectedRoute` is used for `/adopter/profile`, `/owner/*`, and `/admin/*`. This is **not** a security boundary (the backend must still enforce authorization), but it prevents accidental navigation in the SPA.
