import { apiClient } from "@/core/http/http-client";
import type { CreateCheckoutSessionResponseDto } from "@/features/billing/billing.dto";
import type { PlanType } from "@/types/job";

export const billingRepository = {
  createCheckoutSession: async (
    jobId: string,
    planType?: PlanType
  ): Promise<CreateCheckoutSessionResponseDto> => {
    const { data } = await apiClient.post<CreateCheckoutSessionResponseDto>(
      "/billing/checkout-session",
      {
        jobId,
        ...(planType ? { planType } : {}),
      }
    );
    return data;
  },
};
