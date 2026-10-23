import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TEXT_INPUT_CLASS } from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useDeleteMyAccount } from "@/features/users/users.queries";
import { ApiError } from "@/core/errors/api-error";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

// PB20: deleting is irreversible, so it needs the current password plus the
// literal word DELETE. OAuth-only accounts have no password — they leave that
// field blank and only the confirmation word applies.
const CONFIRM_WORD = "DELETE";

export const DeleteAccountButton = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const deleteAccountMutation = useDeleteMyAccount();
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  // isPending only flips after TanStack Query's async notify, so a fast
  // double-click/Enter could fire two DELETEs; the second would then fail
  // (session already gone) and toast an error over a successful deletion.
  const inFlight = useRef(false);

  const reset = () => {
    setIsConfirming(false);
    setPassword("");
    setConfirmation("");
  };

  const handleDelete = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await runWithToast(
        () =>
          deleteAccountMutation.mutateAsync({
            password: password || undefined,
            confirmation: CONFIRM_WORD,
          }),
        {
          error: t("del.failed"),
          onError: (err) =>
            err instanceof ApiError ? getErrorMessage(err) : undefined,
        }
      );
    } finally {
      inFlight.current = false;
    }
  };

  if (!isConfirming) {
    return (
      <button
        className="rounded-10 border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:shadow-focus focus-visible:outline-none"
        type="button"
        onClick={() => setIsConfirming(true)}
      >
        {t("del.button")}
      </button>
    );
  }

  const pending = deleteAccountMutation.isPending;
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (confirmation === CONFIRM_WORD && !pending) void handleDelete();
      }}
    >
      <p className="text-[12px] text-neutral-600">
        {t("del.message")} {t("del.confirmHint")}
      </p>
      <label className="flex flex-col gap-1 text-[12px] font-medium text-neutral-700">
        {t("del.passwordLabel")}
        <input
          autoComplete="current-password"
          className={TEXT_INPUT_CLASS}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="font-normal text-neutral-500">
          {t("del.passwordHint")}
        </span>
      </label>
      <label className="flex flex-col gap-1 text-[12px] font-medium text-neutral-700">
        {t("del.confirmLabel")}
        <input
          autoComplete="off"
          className={TEXT_INPUT_CLASS}
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={confirmation !== CONFIRM_WORD || pending}
          isLoading={pending}
          size="sm"
          type="submit"
          variant="danger"
        >
          {pending ? t("del.deleting") : t("del.confirm")}
        </Button>
        <Button
          className="border-neutral-200 hover:bg-neutral-50"
          disabled={pending}
          size="sm"
          type="button"
          variant="ghost"
          onClick={reset}
        >
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
};
