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
