import { parseOrThrow } from "@/core/validation/validate-response";
import { billingRepository } from "@/features/billing/billing.repository";
import { checkoutSessionSchema } from "@/features/billing/billing.dto";
import type { PlanType } from "@/types/job";

export const createCheckoutSession = async (
  params: string | { jobId: string; planType?: PlanType }
): Promise<{ url: string | null; checkoutUrl: string | null }> => {
  const jobId = typeof params === "string" ? params : params.jobId;
  const planType = typeof params === "object" ? params.planType : undefined;
  const dto = await billingRepository.createCheckoutSession(jobId, planType);
  const parsed = parseOrThrow(
    checkoutSessionSchema,
    dto,
    "POST /billing/checkout-session"
  );
  const checkoutUrl = parsed.checkoutUrl || parsed.url || null;
  return { url: checkoutUrl, checkoutUrl };
};
