import { useToastMutation } from "@/hooks/useToastMutation";
import { useDeleteMyAccount } from "@/features/users/users.queries";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { ApiError } from "@/core/errors/api-error";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

export const DeleteAccountButton = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const deleteAccountMutation = useDeleteMyAccount();

  const handleDelete = async () => {
    await runWithToast(() => deleteAccountMutation.mutateAsync(), {
      error: t("del.failed"),
      onError: (err) =>
        err instanceof ApiError ? getErrorMessage(err) : undefined,
    });
  };

  return (
    <ConfirmAction
      confirmLabel={t("del.confirm")}
      isPending={deleteAccountMutation.isPending}
      message={t("del.message")}
      pendingLabel={t("del.deleting")}
      onConfirm={handleDelete}
    >
      {({ onClick }) => (
        <button
          className="rounded-10 border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={onClick}
        >
          {t("del.button")}
        </button>
      )}
    </ConfirmAction>
  );
};
