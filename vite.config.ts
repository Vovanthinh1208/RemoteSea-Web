import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// index.html's CSP meta tag has no 'unsafe-inline'/nonce for script-src, which
// is right for the built production bundle but blocks the unnonced inline
// module script the Vite dev server injects for the React Refresh preamble —
// every component's `$RefreshSig$()` call then throws ReferenceError on
// import, before anything renders. `ctx.server` is only set while serving
// (never during `vite build`), so this only loosens the dev-server response.
const relaxCspForDev = (): Plugin => ({
  name: "relax-csp-for-dev",
  transformIndexHtml(html, ctx) {
    if (!ctx.server) return html;
    return html.replace(/(script-src 'self')/, "$1 'unsafe-inline'");
  },
});

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (command === "build" && !env.VITE_API_URL) {
    // index.html interpolates %VITE_API_URL% into the CSP connect-src with no
    // fallback (unlike the JS client, which silently defaults to localhost) —
    // an unset var ships a literal "%VITE_API_URL%" token in production, which
    // the browser ignores as an invalid CSP source and blocks all API requests.
    throw new Error(
      "VITE_API_URL is not set. It must point at the deployed remotesea-api origin at build time. " +
        "In GitHub Actions set it as job-level `env:` in the workflow (see .github/workflows/ci.yml) " +
        "or as a repository variable; locally put it in .env / .env.production."
    );
  }

  return {
    plugins: [react(), relaxCspForDev()],
    // Release identifier for Sentry (error <-> deploy correlation). CI passes
    // the commit SHA via GITHUB_SHA; local builds fall back to "dev".
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.GITHUB_SHA?.slice(0, 12) ?? env.VITE_APP_VERSION ?? "dev"
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3001,
    },
    build: {
      // Generated but not referenced from the bundles ("hidden") — stack traces
      // stay symbolicable (locally, or uploaded to Sentry in a release step)
      // without advertising map URLs to every visitor's devtools.
      sourcemap: "hidden",
      rollupOptions: {
        output: {
          // Only node_modules gets manual grouping (stable vendor chunks). App
          // code is left to Rollup's automatic shared-chunk splitting: it emits
          // many small shared chunks, one per module shared across lazy routes,
          // so each route pulls only the shared code it needs — and Vite's
          // injected modulepreload fetches them in parallel, not in a waterfall.
          // (Bundling them into one "app-shared" chunk was measured worse: it
          // forced 275KB / 87KB gzip onto the initial load.)
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id))
              return "vendor-react";
            if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id))
              return "vendor-router";
            if (id.includes("node_modules/@tanstack/react-query"))
              return "vendor-query";
            // zod gets its own chunk; react-hook-form / @hookform deliberately do NOT.
            // A manual vendor chunk is hoisted to a static import of the entry and
            // modulepreloaded on first paint. That's what we want for zod — the DTOs
            // validate every API response, so it's needed eagerly (session check +
            // public jobs list on first paint) and a named chunk keeps it out of the
            // entry bundle. But react-hook-form is used only by form routes (all lazy),
            // so giving it a manual chunk forced ~16KB gzip of form library onto the
            // initial load of pages with no forms. Left unnamed, Rollup auto-splits it
            // into a shared chunk imported only by those lazy route chunks — off the
            // critical path until a form route is actually opened.
            if (id.includes("node_modules/zod")) return "vendor-zod";
            if (id.includes("node_modules/@sentry")) return "vendor-sentry";
            if (id.includes("node_modules/axios")) return "vendor-axios";
            return undefined;
          },
        },
      },
    },
  };
});
