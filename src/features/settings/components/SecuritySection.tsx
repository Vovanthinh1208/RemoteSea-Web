import { Globe, Laptop } from "lucide-react";
import { cn } from "@/utils/cn";
import { SectionHead, EMPHASIS_STYLE } from "@/features/talent/components/profile-form/SectionHead";
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

// A mobile-ish device label (see remotesea-api's user-agent.util.ts, which
// produces "<Browser> on <OS>") gets the Globe icon; everything else Laptop —
// same rough split the remotesea design reference used.
const isMobileDevice = (device: string) => /iOS|Android/.test(device);

export const SecuritySection = () => {
  const runWithToast = useToastMutation();
  const { data: sessions } = useMySessions();
  const revokeMutation = useRevokeMySession();
  const revokeOthersMutation = useRevokeMyOtherSessions();

  const revoke = (id: string) =>
    runWithToast(() => revokeMutation.mutateAsync(id), {
      error: "Couldn't revoke session",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  const revokeAllOthers = () =>
    runWithToast(() => revokeOthersMutation.mutateAsync(), {
      success: "Signed out of all other sessions",
      error: "Couldn't sign out other sessions",
    });

  const hasOtherSessions = (sessions?.length ?? 0) > 1;

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="security"
    >
      <SectionHead
        eyebrow="02 · Access"
        help="Keep your account locked down. We'll email you whenever a new device signs in."
        title={
          <em className="font-serif italic text-brand-700" style={EMPHASIS_STYLE}>
            Security.
          </em>
        }
      />
      <ChangePasswordForm />

      <TwoFactorSection />

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Active sessions
      </p>
      <div className="mb-3 divide-y divide-neutral-50 overflow-hidden rounded-16 border border-neutral-100">
        {sessions?.map((s) => {
          const Icon = isMobileDevice(s.device) ? Globe : Laptop;
          return (
            <div className="flex items-center gap-3 px-4 py-3" key={s.id}>
              <span
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10",
                  s.current ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-500"
                )}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-900">
                  {s.device}
                  {s.current && (
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-neutral-400">{s.ip ?? "Unknown location"}</p>
              </div>
              <span className="flex-shrink-0 text-[12px] text-neutral-400">
                {s.current ? "Active now" : timeAgoLong(s.lastSeenAt)}
              </span>
              {!s.current && (
                <button
                  className="flex-shrink-0 rounded-8 border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 disabled:opacity-60"
                  disabled={revokeMutation.isPending}
                  type="button"
                  onClick={() => revoke(s.id)}
                >
                  Revoke
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="flex items-center gap-2 text-[13px] font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
        disabled={!hasOtherSessions || revokeOthersMutation.isPending}
        type="button"
        onClick={revokeAllOthers}
      >
        Sign out of all other sessions
      </button>
    </section>
  );
};
