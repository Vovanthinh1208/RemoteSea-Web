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
import { Button } from "@/components/ui/button";

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
    const ok = await runWithToast(
      () => changePasswordMutation.mutateAsync(values),
      {
        success: "Password updated",
        error: "Couldn't update password",
        onError: (err) =>
          applyFormSubmitError(err, setError, UPDATE_FAILED_MESSAGE),
      }
    );
    if (ok) reset();
  };

  return (
    <form
      className="mb-5 max-w-sm space-y-2.5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        error={errors.currentPassword?.message}
        id="currentPassword"
        label="Change password"
        placeholder="Current password"
        autoComplete="current-password"
        registration={register("currentPassword")}
        type="password"
      />
      <TextField
        error={errors.newPassword?.message}
        id="newPassword"
        label="New password"
        placeholder="New password (min 8 characters)"
        autoComplete="new-password"
        registration={register("newPassword")}
        type="password"
      />
      <Button disabled={isSubmitting} size="sm" type="submit">
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
};
