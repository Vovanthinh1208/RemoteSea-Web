import { apiClient } from "@/core/http/http-client";
import type { CreateCheckoutSessionResponseDto } from "@/features/billing/billing.dto";

export const billingRepository = {
  createCheckoutSession: async (
    jobId: string
  ): Promise<CreateCheckoutSessionResponseDto> => {
    const { data } = await apiClient.post<CreateCheckoutSessionResponseDto>(
      "/billing/checkout",
      {
        jobId,
      }
    );
    return data;
  },
};
