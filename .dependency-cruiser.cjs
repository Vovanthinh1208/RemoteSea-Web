/**
 * Architecture guardrails for remotesea-web — same tool and philosophy as
 * remotesea-api's config: a minimal, high-signal ruleset (circular imports and
 * dead modules), not a style linter. Run with `npm run depcruise`.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular imports make modules impossible to reason about (and can " +
        "break at runtime with ESM live bindings half-initialized).",
      from: {},
      to: { circular: true },
    },
    {
      name: "features-dont-import-page-map",
      severity: "error",
      comment:
        "Feature code importing the router's page map (route-prefetch) creates " +
        "component -> router -> pages -> component cycles (caught once already). " +
        "A feature that wants to warm its own page chunk owns a local prefetch " +
        "module instead (see features/jobs/prefetch-detail-chunk.ts). The layout " +
        "shell (Navbar) is the sanctioned consumer.",
      from: { path: "^src/features" },
      to: { path: "^src/router/route-prefetch" },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "A module nothing imports is either dead code or a missing wire-up.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(cjs|js|ts)$", // dot-config files
          "\\.d\\.ts$",
          "(^|/)main\\.tsx$", // Vite entry — referenced from index.html, not imports
          "(^|/)vite-env\\.d\\.ts$",
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.app.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },
  },
};
