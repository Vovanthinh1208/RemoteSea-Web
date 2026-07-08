import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (command === "build" && !env.VITE_API_URL) {
    // index.html interpolates %VITE_API_URL% into the CSP connect-src with no
    // fallback (unlike the JS client, which silently defaults to localhost) —
    // an unset var ships a literal "%VITE_API_URL%" token in production, which
    // the browser ignores as an invalid CSP source and blocks all API requests.
    throw new Error(
      "VITE_API_URL is not set. It must point at the deployed remotesea-api origin at build time."
    );
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id)) return "vendor-react";
            if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id)) return "vendor-router";
            if (id.includes("node_modules/@tanstack/react-query")) return "vendor-query";
            if (
              id.includes("node_modules/react-hook-form") ||
              id.includes("node_modules/@hookform/resolvers") ||
              id.includes("node_modules/zod")
            ) {
              return "vendor-forms";
            }
            if (id.includes("node_modules/@sentry")) return "vendor-sentry";
            return undefined;
          },
        },
      },
    },
  };
});
