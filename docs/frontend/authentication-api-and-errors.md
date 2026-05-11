# Authentication, API layer, and error handling

## Where the JWT lives

After login succeeds, `Login.jsx` calls:

```js
setAccessToken(data.tokenResponse.accessToken);
```

`setAccessToken` comes from **Zustand** (`useAuthStore` in `src/store/authStore.js`). The store holds:

- `accessToken`
- `setAccessToken(token)`
- `clearAuth()` (sets token to `null`)

The frontend does **not** store refresh tokens in Zustand; refresh is expected to rely on **HttpOnly cookies** on the backend (implied by `POST /Auth/refresh-token` using `refreshApi` with credentials and no Bearer header in the interceptor chain for that specific call).

## Axios instance (`src/api/api.js`)

### Creation

Two instances:

1. **`api`** — main client: `timeout: 5000`, `withCredentials: true`.
2. **`refreshApi`** — used only for `/Auth/refresh-token` to avoid the response interceptor recurse confusingly through the same object (comment in code explains bypassing interceptor).

Both use `baseURL = "https://localhost:7081/api"`.

### Request interceptor

Before each request:

- Reads **`useAuthStore.getState().accessToken`** synchronously (Zustand is module-safe for getState outside React).
- If present, sets `Authorization: Bearer <token>`.

**Important:** accessing the store outside React avoids unnecessary re-subscriptions.

### Response interceptor (summary)

Behavior in order relevant to debugging:

1. **403 Forbidden** → `window.location.href = "/unauthorized"` then reject promise.
2. **401 Unauthorized** — if already retried (`original._retry`) or status not 401, reject.
3. Otherwise mark `_retry`, `POST /Auth/refresh-token` via **`refreshApi`**, extract `accessToken` from **`res.data.accessToken`**, call `setAccessToken`, replay original request with updated header.
4. If refresh fails → `clearAuth()` and hard redirect **`/login`**.

Rejected values normalize to **`error.response.data`** or **`error.message`** string/object depending on Axios error shape — callers sometimes read `error?.message` assuming string.

### Logout (`logout()` in `api.js`)

Sequence:

1. `POST /auth/logout`
2. `clearAuth()`
3. `window.location.href = "/login"` in `finally` (always clears client auth even if network fails)

Shelter sidebar calls `logout()` from `api/api.js` (same module as axios helpers).

## Auth API wrappers (`src/api/auth.api.js`)

- **`register`** — `POST /auth/register` body `{ name, email, password, role }`; returns **`res.status` only** from the success path on the happy path wrapper (calling code often treats return as generic success).
- **`login`** — `POST /auth/login`; returns **`res.data`** (must include `.tokenResponse.accessToken` matching `Login.jsx` expectation).

Both use **`import api from "./api"`** so interceptors attach.

## Domain API helpers (`api.js` exports)

| Function | Endpoint (relative to `/api`) | Notes |
|---------|-------------------------------|-------|
| `getMe()` | `GET /auth/me` | Validates session; SignalR hook uses before connecting |
| `getMyPetPosts()` | `GET /pets/mine` | Parses `res.data.data ?? []` |
| `getReceivedAdoptionRequests()` | `GET /adoptions/received` | Same `data.data` unwrap |
| `getMyAdoptionRequests()` | `GET /adoptions/my` | **[ENHANCED]** Returns full `petPost` object per request (see below) |
| `getAdoptionHistory()` | `GET /adoptions/history` | **[ENHANCED]** Returns full `petPost` object per adoption (see below) |
| `acceptAdoptionRequest(id)` | `PUT /adoptions/{id}/accept` | 204 no content OK |
| `rejectAdoptionRequest(id)` | `PUT /adoptions/{id}/reject` | 204 no content OK |
| `resolveAssetUrl(path)` | N/A (pure helper) | Prefixes backend origin for relative image paths |

### Enhanced adoption request/history response format (May 2026)

**`GET /adoptions/my`** now returns each request with full pet post details:

```json
[
  {
    "id": 123,
    "pet": { "id": 456, "name": "Max" },
    "petPost": {
      "petPostId": 456,
      "description": "Friendly dog",
      "healthStatus": "Healthy",
      "status": "Active",
      "createdAt": "2026-05-10T10:00:00",
      "petId": 789,
      "name": "Max",
      "type": "Dog",
      "breed": "Golden Retriever",
      "location": "New York",
      "age": 3,
      "ownerId": 10,
      "ownerName": "John Shelter",
      "images": ["url1.jpg", "url2.jpg"],
      "primaryImage": "url1.jpg"
    },
    "status": "pending",
    "createdAt": "2026-05-11T08:30:00"
  }
]
```

**`GET /adoptions/history`** similarly includes the full `petPost` object:

```json
[
  {
    "pet": { "id": 456, "name": "Max" },
    "petPost": { /* same structure as above */ },
    "status": "approved",
    "adoptedAt": "2026-05-11T15:45:00"
  }
]
```

**Frontend impact:** Components can now display comprehensive pet information (images, health status, owner name, etc.) without additional API calls. Previously only compact `{ id, name }` was available.

Many functions treat **404** as **empty list** for list endpoints (returns `[]` instead of throwing).

## `resolveAssetUrl` (images)

Used when API returns a **relative** path for pet or user images.

Rules:

- Empty / non-string → `null`
- Already `http(s)` → unchanged
- Starts with `/` → `ORIGIN_URL + path`
- Else → `ORIGIN_URL + '/' + path`

`ORIGIN_URL` is `https://localhost:7081` (no `/api` segment).

## Common TA questions

**Q: Why Zustand instead of Context for auth?**  
A: Minimal global state (one string token); `getState()` works in Axios interceptors without provider nesting.

**Q: Is the app secure if routes are public?**  
A: Frontend routes are not a security boundary. Emphasize **server-side authorization**; the SPA only improves UX when the backend rejects calls.

**Q: Why hard redirect on 401 refresh failure?**  
A: Guarantees user leaves protected views and cannot keep firing failing requests with stale assumptions.

## `ProtectedRoute.jsx` (frontend gating)

`ProtectedRoute` reads auth state from Zustand (`useAuthStore`) and gates routes for UX:

- If auth is still initializing (`isAuthLoading`) → render nothing (prevents flicker)
- If missing `accessToken` → redirect to `/login`
- If role does not match `allowedRoles` → redirect to `/unauthorized`

This is complementary to (not a replacement for) server-side authorization.
