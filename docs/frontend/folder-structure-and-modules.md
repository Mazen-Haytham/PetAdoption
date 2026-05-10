# Folder structure and modules

Paths are relative to `Frontend/pet-pal-adoption/src/`.

## Top-level layout

```
src/
  main.jsx           # React root mount, global Toaster, imports App + index.css
  App.jsx            # BrowserRouter + all Route definitions
  index.css          # Tailwind layers, CSS variables (--pa-*), .pa-* component classes

  api/
    api.js           # Axios instance, interceptors, pet/adoption/me/logout helpers
    auth.api.js      # login + register wrappers

  store/
    authStore.js     # Zustand: accessToken only

  hooks/
    useShelterDashboard.js   # Shelter data + SignalR + accept/reject + derived lists
    useShelterOwnerOutlet.js # Typed/context guard for Outlet context under owner layout

  pages/
    auth/Login.jsx
    auth/Register.jsx
    adopter/AdopterProfile.jsx
    owner/ShelterOwnerLayout.jsx      # Sidebar + header + Outlet + modal + toasts
    owner/ShelterDashboardPage.jsx    # Dashboard child route
    owner/ShelterRequestsPage.jsx     # Requests child route

  components/
    ProtectedRoute.jsx   # Exists but expects missing auth context — not wired in App (see limitations doc)
    shared/               # Cross-role UI (TopNav, PageFooter)
    adopterProfile/       # Cards and pieces for AdopterProfile page
    owner/
      ShelterSidebar.jsx
      shelterHome/        # Owner dashboard feature components
        AdoptionToast.jsx
        AvatarButton.jsx
        OwnerIcons.jsx
        RequestDetailsModal.jsx
        RequestsView.jsx
        ShelterDashboard.jsx
        ShelterHomeHeader.jsx
        StatCard.jsx
        StatusPill.jsx
        utils.js            # e.g. formatWhen for requests UI
```

## Naming conventions (practical)

- **Pages** under `pages/` are route targets (or layout wrappers with `Outlet`).
- **Feature UI** under `components/<area>/` — reusable pieces for that area.
- **Hooks** that encapsulate data + side effects: `hooks/use*.js`.
- **API** surface: `api/api.js` for shared client + domain calls; `auth.api.js` for credential entry points.

## What is intentionally *not* in a dedicated folder

- No `context/` folder for auth (Zustand is used instead).
- No `types/` (JavaScript only).
- No `services/` layer separate from `api/` — functions live next to the Axios instance.

## Correlation: module → user role

| Area | Typical user | Main entry route |
|------|----------------|------------------|
| `pages/auth/*` | Everyone (public) | `/login`, `/register` |
| `pages/adopter/*` + `components/adopterProfile/*` | Adopter | `/adopter/profile` |
| `pages/owner/*` + `components/owner/*` + `hooks/useShelterDashboard.js` | Shelter / owner | `/owner`, `/owner/requests` |

Admin is a **placeholder** inline component in `App.jsx`, not a full module tree yet.
