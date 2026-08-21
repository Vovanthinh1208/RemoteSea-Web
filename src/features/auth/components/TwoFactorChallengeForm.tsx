import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/core/errors/api-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface TwoFactorChallengeFormProps {
  challengeToken: string;
  remember: boolean;
  onSuccess: () => void;
  onBack: () => void;
}

const TOTP_LENGTH = 6;

interface TotpInputProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
}

const TotpInput = ({
  value,
  disabled,
  onChange,
  onComplete,
}: TotpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: TOTP_LENGTH }, (_, i) => value[i] ?? "");

  const commit = (nextDigits: string[]) => {
    const joined = nextDigits.join("");
    onChange(joined);
    if (joined.length === TOTP_LENGTH) onComplete(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    commit(next);
    if (digit && index < TOTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, TOTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length: TOTP_LENGTH }, (_, i) => pasted[i] ?? "");
    commit(next);
    inputRefs.current[Math.min(pasted.length, TOTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          autoComplete={i === 0 ? "one-time-code" : "off"}
          key={i}
          autoFocus={i === 0}
          className={cn(
            "h-12 w-10 rounded-10 border border-neutral-200 bg-white text-center text-lg font-semibold text-neutral-900 outline-none transition-all",
            "focus:border-brand-600 focus:shadow-focus disabled:opacity-60"
          )}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
};

export const TwoFactorChallengeForm = ({
  challengeToken,
  remember,
  onSuccess,
  onBack,
}: TwoFactorChallengeFormProps) => {
  const { completeTwoFactorChallenge } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verify = async (submittedCode: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await completeTwoFactorChallenge(challengeToken, submittedCode, remember);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
      toast({ title: "Couldn't verify code", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: "totp" | "backup") => {
    setMode(next);
    setCode("");
    setError(null);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void verify(code);
      }}
    >
      <div>
        <p className="mb-1 text-center text-sm font-medium text-neutral-700">
          Two-factor authentication
        </p>
        <p className="mb-4 text-center text-sm text-neutral-500">
          {mode === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter one of your unused backup codes."}
        </p>

        {mode === "totp" ? (
          <TotpInput
            disabled={isSubmitting}
            value={code}
            onChange={setCode}
            onComplete={(fullCode) => void verify(fullCode)}
          />
        ) : (
          <input
            autoComplete="off"
            autoFocus
            className="h-11 w-full rounded-12 border border-neutral-200 bg-white px-4 text-center font-mono text-lg uppercase tracking-widest text-neutral-900 outline-none transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400 focus:border-brand-600 focus:shadow-focus"
            disabled={isSubmitting}
            placeholder="XXXXX-XXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}

        {error && (
          <p className="mt-2 text-center text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          className="mt-3 block w-full text-center text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          type="button"
          onClick={() => switchMode(mode === "totp" ? "backup" : "totp")}
        >
          {mode === "totp"
            ? "Use a backup code instead"
            : "Use your authenticator app instead"}
        </button>
      </div>

      <Button
        className="w-full rounded-12"
        disabled={!code}
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        Verify
      </Button>
      <button
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
        type="button"
        onClick={onBack}
      >
        ← Back to sign in
      </button>
    </form>
  );
};
