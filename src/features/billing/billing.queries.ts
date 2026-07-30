import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "@/features/billing/billing.service";

export const useCreateCheckoutSession = () =>
  useMutation({ mutationFn: createCheckoutSession });
