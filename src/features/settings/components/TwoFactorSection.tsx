import { useState } from "react";
import { AlertTriangle, Check, Copy, ShieldCheck } from "lucide-react";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import {
  useDisableTwoFactor,
  useSetupTwoFactor,
  useTwoFactorStatus,
  useVerifyTwoFactorSetup,
} from "@/features/auth/auth.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { TEXT_INPUT_CLASS } from "@/components/shared/input-styles";
import { Button } from "@/components/ui/button";

type Step = "idle" | "setting_up" | "backup_codes" | "disabling";

export const TwoFactorSection = () => {
  const runWithToast = useToastMutation();
  const { data: status } = useTwoFactorStatus();
  const setupMutation = useSetupTwoFactor();
  const verifyMutation = useVerifyTwoFactorSetup();
  const disableMutation = useDisableTwoFactor();

  const [step, setStep] = useState<Step>("idle");
  const [setup, setSetup] = useState<{
    secret: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  const enabled = status?.enabled ?? false;

  const startSetup = () =>
    runWithToast(
      async () => {
        setError(null);
        const result = await setupMutation.mutateAsync();
        setSetup({
          secret: result.secret,
          qrCodeDataUrl: result.qrCodeDataUrl,
        });
        setStep("setting_up");
      },
      { error: "Couldn't start two-factor setup" }
    );

  const cancelSetup = () => {
    setStep("idle");
    setSetup(null);
    setCode("");
    setError(null);
  };

  const confirmSetup = async () => {
    setError(null);
    try {
      const result = await verifyMutation.mutateAsync({
        token: code,
      });
      setBackupCodes(result.backupCodes);
      setStep("backup_codes");
      setSetup(null);
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  const finishBackupCodes = () => {
    setBackupCodes([]);
    setStep("idle");
  };

  const startDisable = () => {
    setError(null);
    setPassword("");
    setStep("disabling");
  };

  const cancelDisable = () => {
    setStep("idle");
    setPassword("");
    setError(null);
  };

  const confirmDisable = () =>
    runWithToast(
      async () => {
        await disableMutation.mutateAsync({ password });
        setStep("idle");
        setPassword("");
      },
      {
        success: "Two-factor authentication disabled",
        error: "Couldn't disable two-factor authentication",
        onError: (err) => (err instanceof ApiError ? err.message : undefined),
      }
    );

  return (
    // No border/bg wrapper — this renders directly inside SecuritySection's
    // own bordered card, immediately above the "Active sessions" list; a
    // second full card frame around a single toggle row was doubled
    // framing, not extra information.
    <div className="mb-6 divide-y divide-neutral-50">
      <div className="flex items-start justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-brand-50 text-brand-600">
            <ShieldCheck size={16} />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-medium text-neutral-800">
              Two-factor authentication
              <span className="rounded-full border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                Recommended
              </span>
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-500">
              Require a code from your authenticator app at sign-in. Strongest
              protection against takeovers.
            </p>
          </div>
        </div>
        <Toggle
          disabled={setupMutation.isPending}
          on={enabled}
          onChange={(on) => {
            if (on) void startSetup();
            else startDisable();
          }}
        />
      </div>

      {step === "setting_up" && setup && (
        <div className="py-4">
          <div className="space-y-4 rounded-14 border border-neutral-100 bg-neutral-50/60 p-4">
            <p className="text-[12.5px] leading-relaxed text-neutral-600">
              Scan this QR code with your authenticator app (Google
              Authenticator, 1Password, Authy…), then enter the 6-digit code
              it shows.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                alt="Two-factor authentication QR code"
                className="h-32 w-32 flex-shrink-0 self-center rounded-10 border border-neutral-200 bg-white p-1.5 sm:self-start"
                src={setup.qrCodeDataUrl}
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Setup key
                  </p>
                  <p className="break-all rounded-8 border border-neutral-200 bg-white px-2.5 py-2 font-mono text-[12px] text-neutral-500">
                    {setup.secret}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    6-digit code
                  </p>
                  <input
                    autoComplete="one-time-code"
                    className={`${TEXT_INPUT_CLASS} text-center font-mono text-base tracking-[0.4em]`}
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-red-600">
                <AlertTriangle size={12} /> {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                disabled={code.length !== 6}
                isLoading={verifyMutation.isPending}
                size="sm"
                onClick={confirmSetup}
              >
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={cancelSetup}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "backup_codes" && (
        <div className="py-4">
          <div className="space-y-4 rounded-14 border border-brand-100 bg-brand-50/40 p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium text-neutral-900">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Check size={12} />
              </span>
              Two-factor authentication enabled
            </p>
            <p className="text-[12.5px] leading-relaxed text-neutral-600">
              Save these backup codes somewhere safe — each works once if you
              lose access to your authenticator app. They won't be shown
              again.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-10 border border-neutral-200 bg-white p-3.5 font-mono text-[13px] text-neutral-800 sm:grid-cols-3">
              {backupCodes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(backupCodes.join("\n"));
                  setCodesCopied(true);
                  setTimeout(() => setCodesCopied(false), 1500);
                }}
              >
                {codesCopied ? (
                  <>
                    <Check size={12} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy codes
                  </>
                )}
              </Button>
              <Button size="sm" onClick={finishBackupCodes}>
                I've saved these
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "disabling" && (
        <div className="py-4">
          <div className="space-y-3 rounded-14 border border-red-100 bg-red-50/40 p-4">
            <p className="text-[12.5px] leading-relaxed text-neutral-600">
              Enter your password to disable two-factor authentication.
            </p>
            <input
              autoComplete="current-password"
              className={TEXT_INPUT_CLASS}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                disabled={!password}
                isLoading={disableMutation.isPending}
                size="sm"
                variant="danger"
                onClick={confirmDisable}
              >
                Disable
              </Button>
              <Button size="sm" variant="outline" onClick={cancelDisable}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
