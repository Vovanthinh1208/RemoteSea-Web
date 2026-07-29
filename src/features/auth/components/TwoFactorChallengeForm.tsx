import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/core/errors/api-error";
import { Button } from "@/components/ui/button";

interface TwoFactorChallengeFormProps {
  challengeToken: string;
  remember: boolean;
  onSuccess: () => void;
  onBack: () => void;
}

export const TwoFactorChallengeForm = ({
  challengeToken,
  remember,
  onSuccess,
  onBack,
}: TwoFactorChallengeFormProps) => {
  const { completeTwoFactorChallenge } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await completeTwoFactorChallenge(challengeToken, code, remember);
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
      toast({ title: "Couldn't verify code", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <p className="mb-1 text-sm font-medium text-neutral-700">Two-factor authentication</p>
        <p className="mb-3 text-sm text-neutral-500">
          Enter the 6-digit code from your authenticator app, or one of your backup codes.
        </p>
        <input
          autoComplete="one-time-code"
          autoFocus
          className="h-11 w-full rounded-12 border border-neutral-200 bg-white px-4 text-center font-mono text-lg tracking-widest outline-none transition-all placeholder:text-neutral-400 focus:border-brand-600 focus:shadow-focus"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
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
