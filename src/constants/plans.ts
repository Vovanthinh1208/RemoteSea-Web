import type { PlanType } from "@/types/job";

/**
 * Single source of truth for job-plan pricing on the web side. These must match
 * PLAN_PRICES in remotesea-api (stored in cents: STANDARD=15000, FEATURED=35000,
 * HANDS_ON=120000) — the backend is what Stripe actually charges, so a drift
 * here bills the user a different amount than the wizard/marketing page showed.
 * Previously hardcoded independently in post-job's TIERS and the employer
 * PricingSection; now both read from here so a price change is one web edit.
 */
export const PLAN_PRICES_USD: Record<PlanType, number> = {
  STANDARD: 150,
  FEATURED: 350,
  HANDS_ON: 1200,
};

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  STANDARD: "Standard",
  FEATURED: "Featured",
  HANDS_ON: "Hands-on",
};
