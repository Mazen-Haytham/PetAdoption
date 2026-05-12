# Owner / shelter area — deep dive

This is the richest part of the frontend: **nested routes**, a **dashboard custom hook**, **SignalR realtime**, **outlet context**, and several composed components.

## User-facing flows

1. Shelter signs in → currently redirected to **`/owner`** (see limitations doc).
2. **Dashboard** (`/owner`): stats, pet posts table (with optional “View All”), sidebar preview of latest pending requests.
3. **Adoption Requests** (`/owner/requests`): full list via `RequestsView` with actions.
4. **Request details modal** opens from either view (`RequestDetailsModal`) — mounted once at layout level.
5. **Realtime toast** appears when SignalR broadcasts a new adoption request (then list refreshes).

## Layout shell: `ShelterOwnerLayout.jsx`

Responsibilities:

- Instantiate **`useShelterDashboard()` once** — critical so there is **one** loading cycle, **one** SignalR connection, **one** modal state.
- Render **toast stack** (fixed top center, `pointer-events-none` wrapper with `pointer-events-auto` on each toast).
- Render **`ShelterSidebar`** + **`ShelterHomeHeader`** + **`Outlet`** (`context={dashboard}`).
- Render **`RequestDetailsModal`** controlled by hook state.

Sidebar mobile state: **`sidebarOpen`** toggled via hamburger (`onToggle`); **`onNavigate`** closes drawer after `NavLink` navigation.

## Data + side effects: `useShelterDashboard.js`

### State inventory

| State | Purpose |
|--------|---------|
| `loading` | Initial parallel fetch |
| `loadError` | Surface fetch failure message |
| `pets` | Shelter’s pet posts |
| `receivedRequests` | Incoming adoption requests |
| `detailsOpen` / `selectedRequest` | Modal |
| `actingId` | Disables/conflict prevention while accept/reject in flight |
| `notifications` | In-memory toast queue |

### Initial load (`useEffect` once on mount)

`Promise.all([getMyPetPosts(), getReceivedAdoptionRequests()])` — **cancellation flag** (`alive`) prevents setState after unmount.

Errors set `loadError`; empty arrays on success path coerce with `Array.isArray`.

### Derived data (`useMemo`)

- **`stats`**: counts by pet `status` (case-insensitive: `available`, `adopted`) + pending adoption requests count. Includes `volunteers: 0` placeholder unused in UI.
- **`petRows`**: expands/collapses list (3 vs all), splits available/adopted, sorts by `createdAt`, maps stable `key` from various possible backend id shapes (`petPostId`, `petPostID`, etc.) — demonstrates **schema tolerance** across API casing.
- **`recentRequestItems`**: first three **pending** requests with display fields (`petName` as plain string; UI adds emphasis).

### Accept / reject

Extract id with fallbacks:

```txt
req?.id ?? req?.requestId ?? req?.adoptionRequestId
```

Sets `actingId`, calls API, awaits `refreshRequests()`, clears `actingId` in `finally`.

### Realtime (`useEffect` on `accessToken`, `pushNotification`, `refreshRequests`)

1. Abort if **no JWT**.
2. **`await getMe()`** gate — validates token before dialing SignalR (logs error and returns otherwise).
3. Build connection: `ORIGIN_URL + "/hubs/notifications"` with Bearer via `accessTokenFactory` + `withCredentials: true`.
4. Handler **`AdoptionRequestCreated`**: reads `payload.petName` or PascalCase `PetName`, calls **`pushNotification`**, then **`refreshRequests()`**.
5. Cleanup: **`connection.off`** + **`stop()`**.

**Stable callbacks:** `pushNotification` and `refreshRequests` are **`useCallback`** with empty deps so the SignalR `useEffect` is not tearing down/recreating connections every render unnecessarily.

### Notification UX (`AdoptionToast.jsx`)

- Mount animation uses `requestAnimationFrame` flip.
- Auto-dismiss calls **`onDismiss(notificationId)`** with stable callback from hook.
- Separate 6-second filter in **`pushNotification`** (stack behavior) remains in hook.

### Outlet bridge: `useShelterOwnerOutlet.js`

Thin wrapper:

```js
useOutletContext() + guard if falsy throws Error
```

Page components depend on correct route hierarchy — clearer failure mode than silent `undefined` destructuring.

## Page components

| File | Responsibility |
|------|----------------|
| `ShelterDashboardPage.jsx` | Pull context, render `ShelterDashboard` |
| `ShelterRequestsPage.jsx` | Pull context, render `RequestsView` with handlers |

They stay **thin** so TA can say **separation of concerns**: routing siblings share layout state without prop drilling beyond one level.

## Key presentational components (`components/owner/shelterHome/`)

| Component | Role |
|-----------|------|
| `ShelterDashboard.jsx` | Stats + pet table + new requests sidebar |
| `RequestsView.jsx` | Full requests listing; uses `utils.formatWhen` |
| `RequestDetailsModal.jsx` | Dialog layout; splits applicant vs pet InfoRows |
| `ShelterHomeHeader.jsx` | Search input + bell + `AvatarButton` |
| `StatCard.jsx` | Icon + label + value |
| `StatusPill.jsx` | Status → pill styling for pet rows |
| `OwnerIcons.jsx` | SVG icons for StatCards |
| `AvatarButton.jsx` | Header avatar UI |
| `utils.js` | Shared formatting helpers |

## SignalR ↔ REST interaction (conceptual)

SignalR informs **something changed** → client **refetches** received requests via REST to stay consistent with server truth. Alternative design would push full DTO in hub message; this project chose **notification + refresh** (simpler, slightly more network).

## TA-style “why” questions

**Q: Why not call `useShelterDashboard` in each page?**  
A: Would duplicate effects (double fetch, double hub). Layout owns hook; children consume context.

**Q: Why Outlet context vs React Context.Provider?**  
A: Built-in RR pattern for route trees; avoids another provider wrapper.

**Q: Race conditions?**  
A: Initial load uses `alive` guard; SignalR teardown cleans listeners; acting lock uses `actingId` per-row in `RequestsView` (verify in UI code during review).
