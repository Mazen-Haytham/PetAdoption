# Frontend documentation (Pet Adoption project)

These notes describe the React app under `Frontend/pet-pal-adoption/`. They are written for reviewers (for example a teaching assistant) who may ask detailed questions about structure, libraries, auth, routing, state, API usage, and design trade-offs.

The frontend was iterated with AI assistance; use this folder to ground answers in **what the code actually does**, not hypothetical architecture.

## How to use this folder

| Document | Topics |
|---------|--------|
| [architecture-and-stack.md](./architecture-and-stack.md) | Tooling (Vite, React, Router, Tailwind, Zustand, Axios, SignalR, Sonner), entry points, conventions |
| [folder-structure-and-modules.md](./folder-structure-and-modules.md) | Directory layout, what belongs where |
| [routing-navigation.md](./routing-navigation.md) | All routes, nested layouts, redirects |
| [authentication-api-and-errors.md](./authentication-api-and-errors.md) | JWT in Zustand, Axios interceptors, refresh, logout, CORS/credentials, **API response structures** |
| [owner-shelter-dashboard-deep-dive.md](./owner-shelter-dashboard-deep-dive.md) | Shelter layout, `useShelterDashboard`, SignalR, outlet context, main components |
| [adopter-profile-and-shared-ui.md](./adopter-profile-and-shared-ui.md) | **[UPDATED]** Adopter profile data loading, enriched pet post data, component details, global styles |
| [limitations-and-ta-qa.md](./limitations-and-ta-qa.md) | Gaps, edge cases, good exam-style Q&A, **recent API enhancements** |

## Root path to the app

- Application code: `Frontend/pet-pal-adoption/src/`
- Config: `Frontend/pet-pal-adoption/vite.config.js`, `eslint.config.js`, `package.json`

## Quick facts (for oral defense)

- **Renderer:** React 19 with **Vite 8** for dev server and production build.
- **Routing:** `react-router-dom` v7 with **nested routes** under `/owner` (dashboard index + `requests`).
- **Global client auth state:** Zustand store holding **only** `accessToken` (not full user profile).
- **HTTP:** Axios instance with **request** interceptor (Bearer token) and **response** interceptor (401 refresh, 403 redirect).
- **Realtime (shelter):** Microsoft SignalR client connected to `{ORIGIN_URL}/hubs/notifications`.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`; design tokens as CSS variables in `index.css` plus `.pa-*` component utility classes.
- **Toasts:** `sonner` (`<Toaster />` in `main.jsx`).

## Recent Updates (May 2026)

### API Data Enrichment
- `/api/adoptions/my` and `/api/adoptions/history` endpoints now return **full `petPost` objects** with images, owner details, health status, etc.
- See [authentication-api-and-errors.md](./authentication-api-and-errors.md#enhanced-adoption-requesthistory-response-format-may-2026) for response format details.

### Component Improvements
- **PetAvatar.jsx** — Improved image handling, fallbacks, responsive sizing
- **ActiveApplicationsCard.jsx** — Now displays pet avatar and comprehensive details from enriched response
- **AdoptionHistoryCard.jsx** — Enhanced to show full pet information without additional API calls
- See [adopter-profile-and-shared-ui.md](./adopter-profile-and-shared-ui.md#component-enhancements-may-2026) for details.
