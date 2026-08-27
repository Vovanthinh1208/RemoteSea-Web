import { useToastMutation } from "@/hooks/useToastMutation";
import { useDeleteMyAccount } from "@/features/users/users.queries";
import { ConfirmAction } from "@/components/shared/ConfirmAction";

export const DeleteAccountButton = () => {
  const runWithToast = useToastMutation();
  const deleteAccountMutation = useDeleteMyAccount();

  const handleDelete = async () => {
    await runWithToast(() => deleteAccountMutation.mutateAsync(), {
      error: "Couldn't delete account",
      errorDescription: "Please try again.",
    });
  };

  return (
    <ConfirmAction
      confirmLabel="Yes, delete"
      isPending={deleteAccountMutation.isPending}
      message="Are you sure? This cannot be undone."
      pendingLabel="Deleting…"
      onConfirm={handleDelete}
    >
      {({ onClick }) => (
        <button
          className="rounded-10 border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={onClick}
        >
          Delete account
        </button>
      )}
    </ConfirmAction>
  );
};
