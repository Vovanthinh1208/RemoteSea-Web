import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { reportError } from "@/services/monitoring";

interface ToastMutationMessages {
  success?: string;
  successDescription?: string;
  successVariant?: "success" | "info";
  error: string;
  errorDescription?: string;
  /** Runs before the error toast — e.g. to map field-level errors onto a form via
   *  setError. Its return value (if any) overrides `errorDescription`. */
  onError?: (err: unknown) => string | void;
}

export const useToastMutation = () => {
  const { toast } = useToast();

  return useCallback(
    async (
      action: () => Promise<unknown>,
      messages: ToastMutationMessages
    ): Promise<boolean> => {
      try {
        await action();

        if (messages.success) {
          toast({
            variant: messages.successVariant ?? "success",
            title: messages.success,
            description: messages.successDescription,
          });
        }
        return true;
      } catch (err) {
        reportError(err);
        const dynamicDescription = messages.onError?.(err);
        toast({
          variant: "error",
          title: messages.error,
          description: dynamicDescription ?? messages.errorDescription,
        });
        return false;
      }
    },
    [toast]
  );
};
