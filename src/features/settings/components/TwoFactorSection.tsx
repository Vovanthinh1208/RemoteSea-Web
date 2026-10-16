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
import { useSubmitError } from "@/hooks/useSubmitError";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

type Step = "idle" | "setting_up" | "backup_codes" | "disabling";

export const TwoFactorSection = () => {
  const { t } = useTranslation("settings");
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
  const submitError = useSubmitError();
  const [codesCopied, setCodesCopied] = useState(false);

  const enabled = status?.enabled ?? false;

  const startSetup = () =>
    runWithToast(
      async () => {
        submitError.clear();
        const result = await setupMutation.mutateAsync();
        setSetup({
          secret: result.secret,
          qrCodeDataUrl: result.qrCodeDataUrl,
        });
        setStep("setting_up");
      },
      { error: t("tfa.startFailed") }
    );

  const cancelSetup = () => {
    setStep("idle");
    setSetup(null);
    setCode("");
    submitError.clear();
  };

  const confirmSetup = async () => {
    submitError.clear();
    try {
      const result = await verifyMutation.mutateAsync({
        token: code,
      });
      setBackupCodes(result.backupCodes);
      setStep("backup_codes");
      setSetup(null);
      setCode("");
    } catch (err) {
      submitError.fail(err);
    }
  };

  const finishBackupCodes = () => {
    setBackupCodes([]);
    setStep("idle");
  };

  const startDisable = () => {
    submitError.clear();
    setPassword("");
    setStep("disabling");
  };

  const cancelDisable = () => {
    setStep("idle");
    setPassword("");
    submitError.clear();
  };

  const confirmDisable = () =>
    runWithToast(
      async () => {
        await disableMutation.mutateAsync({ password });
        setStep("idle");
        setPassword("");
      },
      {
        success: t("tfa.disabled"),
        error: t("tfa.disableFailed"),
        onError: (err) =>
          err instanceof ApiError ? getErrorMessage(err) : undefined,
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
              {t("tfa.title")}
              <span className="rounded-full border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                {t("tfa.recommended")}
              </span>
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-500">
              {t("tfa.desc")}
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
              {t("tfa.scan")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                alt={t("tfa.qrAlt")}
                className="h-32 w-32 flex-shrink-0 self-center rounded-10 border border-neutral-200 bg-white p-1.5 sm:self-start"
                src={setup.qrCodeDataUrl}
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {t("tfa.setupKey")}
                  </p>
                  <p className="break-all rounded-8 border border-neutral-200 bg-white px-2.5 py-2 font-mono text-[12px] text-neutral-500">
                    {setup.secret}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {t("tfa.code")}
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
            {submitError.message && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-red-600">
                <AlertTriangle size={12} /> {submitError.message}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                disabled={code.length !== 6}
                isLoading={verifyMutation.isPending}
                size="sm"
                onClick={confirmSetup}
              >
                {t("tfa.confirm")}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelSetup}>
                {t("common.actions.cancel")}
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
              {t("tfa.enabled")}
            </p>
            <p className="text-[12.5px] leading-relaxed text-neutral-600">
              {t("tfa.saveCodes")}
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
                    <Check size={12} /> {t("tfa.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={12} /> {t("tfa.copy")}
                  </>
                )}
              </Button>
              <Button size="sm" onClick={finishBackupCodes}>
                {t("tfa.saved")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "disabling" && (
        <div className="py-4">
          <div className="space-y-3 rounded-14 border border-red-100 bg-red-50/40 p-4">
            <p className="text-[12.5px] leading-relaxed text-neutral-600">
              {t("tfa.disablePrompt")}
            </p>
            <input
              autoComplete="current-password"
              className={TEXT_INPUT_CLASS}
              placeholder={t("tfa.password")}
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
                {t("tfa.disable")}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelDisable}>
                {t("common.actions.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
