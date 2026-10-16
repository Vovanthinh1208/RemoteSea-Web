import { Ban, Globe, Laptop, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ChangePasswordForm } from "@/features/settings/components/ChangePasswordForm";
import { TwoFactorSection } from "@/features/settings/components/TwoFactorSection";
import {
  useMySessions,
  useRevokeMyOtherSessions,
  useRevokeMySession,
} from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { timeAgoLong } from "@/utils/time";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

// A mobile-ish device label (see remotesea-api's user-agent.util.ts, which
// produces "<Browser> on <OS>") gets the Globe icon; everything else Laptop —
// same rough split the remotesea design reference used.
const isMobileDevice = (device: string) => /iOS|Android/.test(device);

export const SecuritySection = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const { data: sessions } = useMySessions();
  const revokeMutation = useRevokeMySession();
  const revokeOthersMutation = useRevokeMyOtherSessions();

  const revoke = (id: string) =>
    runWithToast(() => revokeMutation.mutateAsync(id), {
      error: t("sec2.revokeFailed"),
      onError: (err) =>
        err instanceof ApiError ? getErrorMessage(err) : undefined,
    });

  const revokeAllOthers = () =>
    runWithToast(() => revokeOthersMutation.mutateAsync(), {
      success: t("sec2.revokedAll"),
      error: t("sec2.revokeAllFailed"),
    });

  const hasOtherSessions = (sessions?.length ?? 0) > 1;

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="security"
    >
      <SectionHead
        eyebrow={t("sec2.eyebrow")}
        help={t("sec2.help")}
        title={
          <em
            className="font-serif italic text-brand-700"
            style={EMPHASIS_STYLE}
          >
            {t("sec2.title")}
          </em>
        }
      />
      <ChangePasswordForm />

      <TwoFactorSection />

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("sec2.sessions")}
      </p>
      {/* No border here — same reasoning as TwoFactorSection.tsx just
          above: this already sits inside SecuritySection's own bordered
          card, so a second full frame around the row list was doubled,
          not extra grouping. */}
      <div className="mb-3 divide-y divide-neutral-50">
        {sessions?.map((s) => {
          const Icon = isMobileDevice(s.device) ? Globe : Laptop;
          return (
            <div className="flex items-center gap-3 px-4 py-3" key={s.id}>
              <span
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10",
                  s.current
                    ? "bg-brand-100 text-brand-700"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-900">
                  {s.device}
                  {s.current && (
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                      {t("sec2.thisDevice")}
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-neutral-400">
                  {s.location ?? s.ip ?? t("sec2.unknownLocation")}
                </p>
              </div>
              <span className="flex-shrink-0 text-[12px] text-neutral-400">
                {s.current
                  ? t("common.time.activeNow")
                  : timeAgoLong(s.lastSeenAt)}
              </span>
              {!s.current && (
                <button
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-8 border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
                  disabled={
                    revokeMutation.isPending &&
                    revokeMutation.variables === s.id
                  }
                  type="button"
                  onClick={() => revoke(s.id)}
                >
                  {revokeMutation.isPending &&
                    revokeMutation.variables === s.id && (
                      <Loader2 className="animate-spin" size={12} />
                    )}
                  {t("sec2.revoke")}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="flex w-full items-center gap-2 rounded-12 border border-dashed border-red-200 px-4 py-3 text-[13px] font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50/50 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
        disabled={!hasOtherSessions || revokeOthersMutation.isPending}
        type="button"
        onClick={revokeAllOthers}
      >
        <Ban size={15} />
        {t("sec2.signOutOthers")}
      </button>
    </section>
  );
};
