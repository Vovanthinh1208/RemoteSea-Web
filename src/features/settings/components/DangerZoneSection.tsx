import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { DeleteAccountButton } from "@/features/settings/components/DeleteAccountButton";
import {
  useMyPauseState,
  usePauseMyAccount,
  useReactivateMyAccount,
} from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useTranslation } from "@/i18n/useTranslation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const DangerZoneSection = () => {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const runWithToast = useToastMutation();
  const { data: pauseState } = useMyPauseState();
  const pauseMutation = usePauseMyAccount();
  const reactivateMutation = useReactivateMyAccount();
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);

  const isPaused = pauseState?.isPaused ?? false;
  const isPending = pauseMutation.isPending || reactivateMutation.isPending;

  const togglePause = () =>
    runWithToast(
      () =>
        isPaused
          ? reactivateMutation.mutateAsync()
          : pauseMutation.mutateAsync(),
      {
        success: isPaused ? t("dz.reactivated") : t("dz.paused"),
        error: isPaused ? t("dz.reactivateFailed") : t("dz.pauseFailed"),
      }
    );

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-red-100 bg-white p-7"
      id="danger"
    >
      <SectionHead
        eyebrow={t("dz.eyebrow")}
        help={t("dz.help")}
        title={
          <>
            <em
              className="font-serif italic text-red-600"
              style={EMPHASIS_STYLE}
            >
              {t("dz.title1")}
            </em>
            {t("dz.title2")}
          </>
        }
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-16 border border-neutral-200 px-5 py-4">
          <div>
            <p className="text-[13.5px] font-semibold text-neutral-900">
              {isPaused ? t("dz.pausedTitle") : t("dz.pauseTitle")}
            </p>
            <p className="text-[12.5px] text-neutral-500">
              {isPaused ? t("dz.pausedDesc") : t("dz.pauseDesc")}
            </p>
          </div>
          <button
            className="ml-6 flex-shrink-0 rounded-10 border border-amber-300 bg-amber-50 px-4 py-2 text-[13px] font-medium text-amber-800 hover:bg-amber-100 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
            disabled={isPending}
            type="button"
            onClick={() =>
              isPaused ? void togglePause() : setPauseDialogOpen(true)
            }
          >
            {isPaused ? t("dz.reactivate") : t("dz.pause")}
          </button>
        </div>
        {(user?.role === "TALENT" || user?.role === "EMPLOYER") && (
          <div className="flex items-center justify-between rounded-16 border border-red-200 bg-red-50/40 px-5 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-neutral-900">
                {t("dz.deleteTitle")}
              </p>
              <p className="text-[12.5px] text-neutral-500">
                {t("dz.deleteDesc")}
              </p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <DeleteAccountButton />
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        cancelLabel={t("actions.cancel")}
        confirmLabel={pauseMutation.isPending ? t("dz.pausing") : t("dz.pause")}
        confirmDisabled={pauseMutation.isPending}
        description={t("dz.pauseConfirm")}
        onCancel={() => setPauseDialogOpen(false)}
        onConfirm={() => {
          setPauseDialogOpen(false);
          void togglePause();
        }}
        open={pauseDialogOpen}
        title={t("dz.pauseTitle")}
        destructive
      />
    </section>
  );
};
