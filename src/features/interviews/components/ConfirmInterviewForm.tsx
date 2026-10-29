import { useState } from "react";
import { useConfirmInterview } from "@/features/interviews/interview.queries";
import { formatSlot } from "@/features/interviews/interview.utils";
import { Button } from "@/components/ui/button";
import { useToastMutation } from "@/hooks/useToastMutation";
import { cn } from "@/utils/cn";
import type { Interview } from "@/types/interview";
import { useTranslation } from "@/i18n/useTranslation";

export const ConfirmInterviewForm = ({
  applicationId,
  interview,
}: {
  applicationId: string;
  interview: Interview;
}) => {
  const { t } = useTranslation("interviews");
  const confirmMutation = useConfirmInterview(applicationId);
  const runWithToast = useToastMutation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    void runWithToast(() => confirmMutation.mutateAsync(selected), {
      success: t("confirm.done"),
      error: t("confirm.failed"),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        {interview.title && (
          <p className="mb-0.5 text-[14px] font-semibold text-neutral-900">
            {interview.title}
            {interview.platform && (
              <span className="font-normal text-neutral-500">
                {" "}
                · {t(`platform.${interview.platform}`)}
              </span>
            )}
          </p>
        )}
        <p className="text-[13px] text-neutral-600">{t("confirm.pick")}</p>
        <p className="text-[11.5px] text-neutral-400">
          {t("confirm.local", { n: interview.durationMinutes })}
        </p>
      </div>
      <div className="space-y-2">
        {interview.proposedSlots.map((slot) => (
          <label
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-10 border px-3.5 py-2.5 text-[13.5px] transition-colors",
              selected === slot
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            )}
            key={slot}
          >
            <input
              checked={selected === slot}
              className="accent-brand-600"
              name="slot"
              type="radio"
              onChange={() => setSelected(slot)}
            />
            {formatSlot(slot)}
          </label>
        ))}
      </div>
      <Button
        disabled={!selected || confirmMutation.isPending}
        isLoading={confirmMutation.isPending}
        onClick={handleConfirm}
      >
        {t("confirm.button")}
      </Button>
    </div>
  );
};
