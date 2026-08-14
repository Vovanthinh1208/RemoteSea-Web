import { z, type ZodType } from "zod";

export type CreateCheckoutSessionResponseDto = { url: string | null };

// Money/checkout flow — validated per the refactor plan (a wrong shape here is a
// silently broken "Upgrade" button, not just a wrong pixel).
export const checkoutSessionSchema: ZodType<CreateCheckoutSessionResponseDto> =
  z.object({
    url: z.string().nullable(),
  });
