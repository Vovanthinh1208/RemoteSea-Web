import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import {
  submitVerificationSchema,
  type SubmitVerificationFormValues,
} from "@/features/employer/employer.schemas";
import { useSubmitEmployerVerification } from "@/features/employer/employer.queries";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { applyFormSubmitError } from "@/utils/form-errors";
import type { EmployerVerificationStatus } from "@/types/employer";

interface VerifyCompanyBannerProps {
  verificationStatus: EmployerVerificationStatus;
  verificationEmail: string | null;
}

// Sits alongside EmployerDashboard's "Set up your company profile" banner —
// same amber-card treatment, shown once a profile exists but isVerified is
// still false. Hidden entirely once VERIFIED (the VerifiedInline badge next
// to the company name already covers that state).
export const VerifyCompanyBanner = ({
  verificationStatus,
  verificationEmail,
}: VerifyCompanyBannerProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const submitVerification = useSubmitEmployerVerification();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SubmitVerificationFormValues>({
    resolver: zodResolver(submitVerificationSchema),
    defaultValues: { email: verificationEmail ?? "" },
  });

  const onSubmit = async (values: SubmitVerificationFormValues) => {
    setFormError(null);
    try {
      await submitVerification.mutateAsync(values.email);
    } catch (err) {
      setFormError(
        applyFormSubmitError(
          err,
          setError,
          "Something went wrong. Please try again."
        )
      );
    }
  };

  if (verificationStatus === "PENDING") {
    return (
      <div className="mb-6 flex items-start gap-4 rounded-20 border border-amber-200 bg-amber-50 p-5">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} />
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
            Check your inbox
          </h3>
          <p className="text-[13px] text-neutral-600">
            We sent a confirmation link to <strong>{verificationEmail}</strong>.
            Click it to verify your company.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start gap-4 rounded-20 border border-amber-200 bg-amber-50 p-5">
      <ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} />
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
          Verify your company
        </h3>
        <p className="mb-3 text-[13px] text-neutral-600">
          {verificationStatus === "FAILED"
            ? "That link expired. Enter your company email to try again."
            : "Confirm you control an email at your company domain to earn a Verified badge and skip manual job review."}
        </p>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-start"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full sm:max-w-xs">
            <TextField
              error={errors.email?.message}
              id="verification-email"
              label="Company email"
              placeholder="jane@yourcompany.com"
              autoComplete="email"
              registration={register("email")}
              type="email"
            />
          </div>
          <Button
            className="shrink-0"
            disabled={submitVerification.isPending}
            isLoading={submitVerification.isPending}
            size="sm"
            type="submit"
          >
            Send verification email
          </Button>
        </form>
        {formError && (
          <p className="mt-2 text-[13px] text-red-600">{formError}</p>
        )}
      </div>
    </div>
  );
};
