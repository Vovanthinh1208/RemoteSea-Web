import { z } from "zod";

export type CreateCheckoutSessionResponseDto = {
  url?: string | null;
  checkoutUrl?: string | null;
};

// Money/checkout flow — validated per the refactor plan (supports both url and checkoutUrl)
export const checkoutSessionSchema = z.object({
  url: z.string().nullable().optional(),
  checkoutUrl: z.string().nullable().optional(),
});
