# Limitations, edge cases, and TA Q&A

Use this file to answer “what’s missing / what would you improve” honestly.

## Security and auth UX

### Routes are not gated in `App.jsx`

`ProtectedRoute` is **commented out**. Anyone can navigate to `/owner` or `/adopter/profile` in the URL bar.

**Correct engineering answer:** Authorization must be enforced by the **API** (401/403). The SPA should also gate routes for UX, but that layer is incomplete here.

### `ProtectedRoute.jsx` is broken if enabled as-is

It imports `useAuth` from `../context/authContext`, but **no auth context module exists** in `src/`. Enabling `<ProtectedRoute>` without implementing that provider would **throw at runtime**.

### Login always navigates to `/owner`

`Login.jsx` calls `navigate("/owner")` after success **regardless of role**. If an **Adopter** logs in, they land on the **shelter dashboard** unless manually visiting `/adopter/profile`.

**Improvement:** branch on `data.user.role` (or equivalent) after login, or fetch `getMe()` then redirect.

### Register flow for Owner/Shelter

On success for non-Adopter, UI shows “wait for approval” toast but **does not navigate** away (user stays on register page). That may be intentional — confirm with product spec.

## Backend coupling

### Hard-coded HTTPS origin

`BASE_URL` and `ORIGIN_URL` point to **`https://localhost:7081`**. Changing environments (staging, production) requires code or env config change — there is **no `import.meta.env.VITE_*` pattern** in `api.js` at time of writing.

**TA question:** “How would you deploy?” → introduce environment variables and CI substitution.

### TLS / dev certificates

Browser must trust the dev cert for `https://localhost:7081`. SignalR and Axios both hit that origin.

## Routing edge cases

### Unknown paths → login

`<Route path="*">` sends **everything** unmatched to `/login`, including possibly mistyped `/adopter/foo`. That may confuse users; an **NotFound** page is often clearer.

### Admin area

`/admin/*` renders a **one-line placeholder** — not a real admin module.

## Data consistency

### SignalR + REST refresh

On hub event, client **refetches** requests. If refetch fails silently, list could desync — today errors bubble through normal Axios rejection paths on that call.

### Mixed response shapes

Helpers sometimes use `res.data.data` vs `res.data`. This reflects API evolution; it’s pragmatic but easy to get wrong when adding endpoints.

## Performance (not yet optimized)

- No `React.memo` on heavy lists.
- No virtualization for long request tables.
- Dashboard `petRows` sorts inline on derived arrays — fine for small N.

## Testing

No `*.test.*` files were present in the frontend tree at documentation time. **Manual testing** and `npm run build` are the primary verifications.

## Exam-style Q&A cheat sheet

**Q: What state management do you use and why?**  
A: Zustand for the JWT (read in Axios interceptors); local React state + custom hooks for feature data; React Router Outlet context to share shelter hook output between nested routes.

**Q: How does token refresh work?**  
A: Response interceptor catches 401, calls `/Auth/refresh-token` with credentials via a separate Axios instance, updates Zustand token, retries original request; on failure clears auth and redirects to login.

**Q: Why SignalR?**  
A: Push notification when a new adoption request is created so the shelter UI updates without polling.

**Q: How do you avoid memory leaks?**  
A: `useEffect` cleanup flags (`alive` / `cancelled`) and SignalR `stop()` + `off()` on unmount.

**Q: What would you refactor next?**  
A: Role-based redirect after login, wire or remove `ProtectedRoute`, environment-based API base URL, consolidate toast systems or document when to use which, add tests for API helpers and hooks.

**Q: How is the project organized for scalability?**  
A: Pages vs components vs hooks vs api modules; owner area already split by route + layout. Further scaling might add feature folders with colocated tests and `msw` for API mocking.

## Keeping docs honest

If the code changes, update the relevant markdown file or add a short **“Last reviewed”** date in `README.md`. The TA may diff the repo against these notes.
