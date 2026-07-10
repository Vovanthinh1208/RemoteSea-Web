# remotesea-web

React 19 + TypeScript + Vite frontend for RemoteSEA, a remote job board for Southeast Asia. Talks to the [`remotesea-api`](../remotesea-api) NestJS backend over HTTP — this app has no server of its own.

## Stack

- **Vite** (dev server + build) with `@vitejs/plugin-react`
- **React 19**, **react-router-dom** for routing
- **TanStack Query** for server state, **react-hook-form** + **zod** for forms
- **Tailwind CSS** with a custom design-token scale (see `tailwind.config.ts`)
- **Sentry** (`@sentry/react`) for error tracking, optional and disabled unless `VITE_SENTRY_DSN` is set

## Setup

```bash
npm install
cp .env.example .env   # then fill in VITE_API_URL
npm run dev
```

The app expects a running `remotesea-api` instance — see that project's README/docker-compose for how to start it locally (defaults to `http://localhost:4000`).

### Environment variables

| Variable                 | Required                                            | Description                                                                      |
| ------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `VITE_API_URL`           | Yes (build fails without it — see `vite.config.ts`) | Base URL of the `remotesea-api` backend.                                         |
| `VITE_SENTRY_DSN`        | No                                                  | Sentry DSN for error tracking/session replay. Unset = `initMonitoring()` no-ops. |
| `VITE_GA_MEASUREMENT_ID` | No                                                  | Google Analytics 4 measurement ID. Unset = disabled.                             |

## Scripts

| Command                           | Description                                             |
| --------------------------------- | ------------------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server (port 3000).                  |
| `npm run build`                   | Type-check (`tsc -b`) then production build to `dist/`. |
| `npm run preview`                 | Serve the production build locally.                     |
| `npm run lint` / `lint:fix`       | ESLint (`eslint.config.js`).                            |
| `npm run format` / `format:check` | Prettier.                                               |
| `npm run type-check`              | `tsc -b` only, no build.                                |

CI (`.github/workflows/ci.yml`) runs lint, format:check, type-check, and build on every push/PR.

## Project layout

```
src/
  app/        # providers, app-level wiring
  components/ # shared UI primitives (components/ui) and cross-feature components (components/shared)
  constants/  # shared app-wide constants (routes, etc.)
  contexts/   # React context providers (auth, etc.)
  features/   # one directory per domain area (jobs, talent, employer, admin, ...),
              # each typically with *.api.ts, *.queries.ts, components/, pages/
  hooks/      # shared custom hooks
  layouts/    # page layout wrappers
  pages/      # top-level, non-feature-specific pages
  router/     # route definitions (lazy-loaded page components)
  services/   # api-client, monitoring, analytics
  styles/     # global CSS
  types/      # shared TypeScript types
  utils/      # shared utility functions
```

There is no test suite yet.
