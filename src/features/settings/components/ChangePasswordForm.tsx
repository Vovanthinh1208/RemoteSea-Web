import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/TextField";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useChangeMyPassword } from "@/features/users/users.queries";
import { applyFormSubmitError } from "@/utils/form-errors";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "@/features/settings/settings.schemas";

const UPDATE_FAILED_MESSAGE = "Could not update password. Please try again.";

export const ChangePasswordForm = () => {
  const runWithToast = useToastMutation();
  const changePasswordMutation = useChangeMyPassword();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    const ok = await runWithToast(() => changePasswordMutation.mutateAsync(values), {
      success: "Password updated",
      error: "Couldn't update password",
      onError: (err) => applyFormSubmitError(err, setError, UPDATE_FAILED_MESSAGE),
    });
    if (ok) reset();
  };

  return (
    <form className="mb-5 max-w-sm space-y-2.5" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        error={errors.currentPassword?.message}
        id="currentPassword"
        label="Change password"
        placeholder="Current password"
        registration={register("currentPassword")}
        type="password"
      />
      <TextField
        error={errors.newPassword?.message}
        id="newPassword"
        label="New password"
        placeholder="New password (min 8 characters)"
        registration={register("newPassword")}
        type="password"
      />
<<<<<<< HEAD
      {errors.newPassword && (
        <p className="text-[12px] text-red-600">{errors.newPassword.message}</p>
      )}
=======
>>>>>>> f72df65 (Fix reliability gaps and consolidate duplicated UI/utils in remotesea-web)
      <button
        className="rounded-10 bg-brand-600 px-4 py-2.5 text-[12.5px] font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Updating…" : "Update password"}
      </button>
    </form>
  );
};
