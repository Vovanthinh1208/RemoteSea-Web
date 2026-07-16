# remotesea-web — Architecture & Conventions

Short, binding conventions for this codebase. Every rule here is enforced
somewhere (a lint rule, dependency-cruiser, a shared module) or has a named
owner file — this doc tells you where to look, not how to feel.

## Layers & dependency direction

```
pages / feature pages        (compose sections & feature components)
  ↓
feature modules  src/features/<name>/
  ↓
core             src/core/    (http client, query client/keys, pagination, token)
shared UI        src/components/ui|shared/
utils            src/utils/   (cn, color, format, time, labels, form-errors)
```

- **Dependency rules are enforced by dependency-cruiser** (`npm run depcruise`,
  config in `.dependency-cruiser.cjs`, runs in CI): no circular imports, no
  orphan modules.
- Cross-feature imports are allowed **only through another feature's public
  surface** (its `*.queries.ts` hooks, exported components). If two features
  need the same util, it moves to `src/utils` (precedent: `companyColor`,
  `countryFlag`, `formatSalaryRange`).
- Components never import the router's page map (`src/router/route-prefetch.ts`).
  A feature that wants to warm its own page chunk owns a tiny prefetch module
  (see `features/jobs/prefetch-detail-chunk.ts`) — this is what keeps the
  component → router → pages → component cycle impossible.

## Feature module anatomy

Every feature under `src/features/<name>/` follows the same file split:

| File                    | Role                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `<name>.api.ts`         | raw endpoint paths                                           |
| `<name>.dto.ts`         | wire types (what the API actually sends)                     |
| `<name>.mapper.ts`      | dto → domain mapping                                         |
| `<name>.repository.ts`  | apiClient calls, returns dtos                                |
| `<name>.service.ts`     | repository + mapper composition                              |
| `<name>.queries.ts`     | React Query hooks — **the only file that touches the cache** |
| `components/`, `pages/` | UI                                                           |

UI components consume `*.queries.ts` hooks only — never the service/repository
directly (verified: zero direct `useQuery` calls outside queries files).

## Server state (React Query)

- All server state lives in the query cache. No `useState` copies of query
  data, no sync-with-effect (`src/hooks/useSyncedState.ts` is the sanctioned
  render-time pattern for local editable copies).
- `staleTime`/`gcTime` come from the `TIER` table in
  `src/core/query/query-client.ts` — never inline numbers.
- `retry: false` at the client level is deliberate: the axios layer
  (`src/core/http/http-client.ts`) already retries retryable GETs with backoff;
  a second layer would compound.
- Query keys come from the factories in `src/core/query/query-keys.ts`.
- The auth session is a query too (`AuthContext` owns its writes); cross-tab
  sync rides `storage` events on `ACCESS_TOKEN_STORAGE_KEY`.

## Pages

- Marketing/static pages are **section-per-file**: `components/home/*`,
  `components/salary/*`, `components/community/*`,
  `features/employer/pages/employer-marketing/*`. Each section owns its own
  static data. A page file is a query-owner + composition (~25-70 lines).
  Exception with a reason: `BlogPage` stays whole — its sections share POSTS
  and filter state.
- Every route is lazy (`src/router/AppRouter.tsx`); Suspense is scoped inside
  `RootLayout` so route changes don't unmount the shell. Navbar links warm
  their chunks on hover/focus via `src/router/route-prefetch.ts`.
- Below-the-fold marketing sections carry
  `[content-visibility:auto] [contain-intrinsic-size:auto_44rem]`.

## UI system

- Primitives live in `src/components/ui` (Button/buttonVariants, Badge, Tag,
  SalaryBadge, CompanyLogo, GradientInitial, Eyebrow, Skeleton, StatCard,
  toast) and `src/components/shared` (EmptyState, EmptyRow, PillToggle,
  TextField, VerifiedBadge, VerifiedInline, ConfirmAction, NewsletterForm).
- **Extraction bar**: extract only at 2+ real call sites with actual behavior
  or proven drift. One-line class idioms (pulse dot, serif `<em>`) stay inline
  on purpose.
- Every list surface follows: skeleton while loading → `EmptyState` + retry on
  error → `EmptyState`/`EmptyRow` when empty. Mutations report through
  `useToastMutation`. Submit buttons disable + swap label while pending.
- The status→label maps are per-persona vocabularies (talent vs employer vs
  admin) — do not merge them.

## Verification (run all before calling work done)

```bash
npm run type-check && npm run lint && npm run depcruise && npx vitest run && npm run build
```

CI (`.github/workflows/ci.yml`) runs the same set on Node 22 (matching the
API's CI and Docker base image).
