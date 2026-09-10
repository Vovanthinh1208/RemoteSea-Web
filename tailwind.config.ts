import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F9F4",
          100: "#DCEFDF",
          200: "#B8DFC0",
          // 300 and 500 were missing from the scale but referenced at 11 call
          // sites (progress fills, status dots, focus/hover states) — since
          // "brand" isn't a built-in Tailwind color name, those utilities had
          // no fallback and generated no CSS at all (same failure mode as the
          // rounded-20 gap below). Interpolated to fit the existing progression.
          300: "#93CFA1",
          400: "#6DBF82",
          500: "#4EAD6A",
          600: "#2E9B52",
          700: "#1F7A3D",
          900: "#0D3D1F",
        },
        neutral: {
          50: "#F8F7F4",
          100: "#EFEDE8",
          200: "#DDD9D1",
          300: "#C7C2B9",
          400: "#9B9690",
          500: "#757069",
          600: "#5C5954",
          700: "#423F3C",
          800: "#2C2A28",
          900: "#1A1917",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          400: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        // No token existed for error/destructive UI — every author reaching
        // for red independently fell back to Tailwind's stock `red-*` scale
        // (39 files, per audit), bypassing this token file entirely the same
        // way the missing brand-300/500 and rounded-20 gaps above did.
        // Values are Tailwind's own default red palette (not invented) so
        // existing `red-*` usage and this token render identically —
        // formalizes the vocabulary going forward without a wide, separate
        // repaint of every existing call site.
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4": "4px",
        "8": "8px",
        "10": "10px",
        "12": "12px",
        "16": "16px",
        // 20 was missing from the scale but `rounded-20` is used in ~29 places
        // (cards across settings, post-job, employer, talent) — the class
        // generated no CSS, so those corners rendered square. Restores the
        // intended 20px radius.
        "20": "20px",
        "24": "24px",
      },
      boxShadow: {
        card: "0 2px 4px rgba(26,25,23,0.04), 0 6px 16px rgba(26,25,23,0.06)",
        "card-lg": "0 8px 24px rgba(26,25,23,0.10)",
        focus: "0 0 0 3px rgba(46,155,82,0.20)",
        // The recurring "active tab/segment" pill background (6 call sites)
        // was reaching for Tailwind's default shadow-sm instead of a named
        // token — naming it here keeps that pattern inside the app's own
        // 4-shadow scale instead of a stray 5th unnamed shadow.
        chip: "0 1px 2px rgba(26,25,23,0.05)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Scales/fades from the corner it's anchored to (paired with an
        // `origin-bottom-right` class on the panel) so the AI chat popup
        // visibly grows out of its launcher button rather than just fading
        // in place — the "-out" pair is what makes the close feel like a
        // real transition instead of an instant disappearance.
        "chat-pop-in": {
          from: { opacity: "0", transform: "scale(0.92) translateY(12px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "chat-pop-out": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to: { opacity: "0", transform: "scale(0.92) translateY(12px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,0.61,0.36,1) both",
        "chat-pop-in": "chat-pop-in 0.22s cubic-bezier(0.16,1,0.3,1) both",
        "chat-pop-out": "chat-pop-out 0.16s ease-in both",
      },
    },
  },
  plugins: [],
};

export default config;
