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
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { useTranslation } from "@/i18n/useTranslation";

export const ChangePasswordForm = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const changePasswordMutation = useChangeMyPassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  useRevalidateOnLocaleChange(form);

  const onSubmit = async (values: ChangePasswordFormValues) => {
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    const ok = await runWithToast(
      () => changePasswordMutation.mutateAsync(payload),
      {
        success: t("changePassword.success"),
        error: t("changePassword.error"),
        onError: (err) => {
          applyFormSubmitError(err, setError);
        },
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
        label={t("security.currentPassword")}
        placeholder={t("changePassword.currentPlaceholder")}
        autoComplete="current-password"
        registration={register("currentPassword")}
        type="password"
      />

      <TextField
        error={errors.newPassword?.message}
        id="newPassword"
        label={t("changePassword.newLabel")}
        placeholder={t("changePassword.newPlaceholder")}
        autoComplete="new-password"
        registration={register("newPassword")}
        type="password"
      />
      <TextField
        error={errors.confirmNewPassword?.message}
        id="confirmNewPassword"
        label={t("security.confirmPassword")}
        placeholder={t("security.confirmPassword")}
        autoComplete="new-password"
        registration={register("confirmNewPassword")}
        type="password"
      />
      <Button disabled={isSubmitting} size="sm" type="submit">
        {isSubmitting
          ? t("changePassword.updating")
          : t("changePassword.update")}
      </Button>
    </form>
  );
};
