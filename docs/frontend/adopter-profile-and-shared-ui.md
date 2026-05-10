# Adopter profile and shared UI

## Route and purpose

Primary route: **`/adopter/profile`** (with **`/adopter` → `/adopter/profile`** redirect).

The page aggregates **identity** (`getMe`), **current adoption requests** (`getMyAdoptionRequests`), and **historical completions** (`getAdoptionHistory`) to show adoption progress.

## Implementation: `AdopterProfile.jsx`

### Loading strategy

Single `useEffect` on mount:

```js
Promise.all([ getMe(), getMyAdoptionRequests(), getAdoptionHistory() ])
```

Uses **`cancelled`** flag returned from cleanup — same concurrency pattern as the shelter dashboard initial load.

### Error and loading UX

- While loading → generic “Loading…” card after header.
- On error → rose-tinted error card (`pa-card`).
- Sections still render skeleton structure only when guarded — inspect JSX for precise ordering **(applications/history sections appear after conditional block)**.

### Defensive casing for backend DTO

`useMemo` for `adopter` reads both camelCase **and** PascalCase (`user?.name ?? user?.Name`) — aligns with inconsistent JSON serialization historically seen across .NET serializers / proxy layers.

### Computed projections

#### `activeApplications`

Filters requests where **`status` case-insensitive === `"pending"`** and maps stable string `id`s from:

```txt
r.id ?? r.requestId ?? composite of pet id + createdAt
```

Produces card-friendly `{ petName, subtitle, status, trailingText }`.

#### `adoptionHistoryItems`

Merges two sources:

1. **Non-pending** items from `requests` (accepted/rejected/etc.) with humanized secondary text.
2. **`history` array** from dedicated history endpoint (adopted pets with notes).

Then:

- **Sorts** by `_sortDate` descending.
- **Dedupes** by key `petName + secondary` string.
- Strips internal `_sortDate` before passing to cards.

#### `visibleAdoptionHistoryItems`

Shows first **4** or **all** based on `showAllHistory` toggle passed to `AdoptionHistoryCard`.

### Layout structure

- `TopNav` brand string **"PawAdopt"** (note naming vs “PetPal” elsewhere).
- Main uses **`pa-container`** spacing.
- Right column placeholder: `<div className="space-y-6" />` **empty** — potential future widgets.
- `PageFooter` with same brand.

## Shared components (`components/shared/`)

| Component | Role |
|-----------|------|
| `TopNav.jsx` | Top navigation chrome for adopter-facing pages |
| `PageFooter.jsx` | Footer chrome |

(Exact props and links — open files if TA asks for accessibility or link targets.)

## Adopter-specific components (`components/adopterProfile/`)

Includes (non-exhaustive list from tree):

- `ProfileHeaderCard.jsx`
- `ActiveApplicationsCard.jsx`
- `AdoptionHistoryCard.jsx`
- `AdoptionHistoryCard`-related display pieces
- `PetAvatar.jsx`, `Avatar.jsx`, `StatusPill.jsx` (adopter-scoped styling variants)
- `VolunteerCard.jsx`, `VetReferencesCard.jsx` — may be **presentational placeholders** or partially wired; verify against actual JSX usage in `AdopterProfile.jsx` (current page imports subset only).

**Fact check for defense:** `AdopterProfile.jsx` imports:

- `ProfileHeaderCard`, `ActiveApplicationsCard`, `AdoptionHistoryCard` only (plus shared nav/footer). Other adopter components may be **unused** in the current page — worth confirming with `grep` before claiming full integration.

## Global styling (`index.css`)

### CSS variables (`:root`)

Examples:

- `--pa-bg`, `--pa-card`, `--pa-text`, `--pa-muted`, `--pa-primary`

Used as **`rgb(var(--pa-primary))`** in Tailwind arbitrary values.

### Component utility layer (`.pa-*`)

Reusable classes: `pa-container`, `pa-card`, `pa-section-title`, `pa-link`, `pa-btn`, `pa-btn-primary`, `pa-btn-soft`, `pa-icon-btn`, pill variants (`pa-pill-pending`, etc.).

**TA angle:** This is a lightweight **design token + utility hybrid** — not a full component library (no Storybook in repo).

## Toasts (global)

`sonner` `<Toaster position="bottom-right" richColors />` in `main.jsx`.

Login/Register fire success/error toasts; shelter notifications use custom **AdoptionToast** stack — two parallel notification systems by design.
