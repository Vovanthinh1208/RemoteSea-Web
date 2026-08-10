import { parseOrThrow } from "@/core/validation/validate-response";
import { billingRepository } from "@/features/billing/billing.repository";
import { checkoutSessionSchema } from "@/features/billing/billing.dto";

export const createCheckoutSession = async (
  jobId: string
): Promise<{ url: string | null }> => {
  const dto = await billingRepository.createCheckoutSession(jobId);
  return parseOrThrow(checkoutSessionSchema, dto, "POST /billing/checkout");
};
