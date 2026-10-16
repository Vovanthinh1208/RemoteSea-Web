import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useAcceptTeamInvitation,
  useInvitationPreview,
} from "@/features/team/team.queries";
import { roleLabel } from "@/features/team/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useSubmitError } from "@/hooks/useSubmitError";
import { useTranslation } from "@/i18n/useTranslation";

export const TeamInvitePage = () => {
  const { t } = useTranslation("team");
  useDocumentTitle(t("join.docTitle"));
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: preview, isLoading, isError } = useInvitationPreview(token);
  const acceptMutation = useAcceptTeamInvitation();
  const submitError = useSubmitError();
  const [accepted, setAccepted] = useState(false);

  const callbackUrl = encodeURIComponent(ROUTES.teamInvite(token ?? ""));

  const handleAccept = async () => {
    if (!token) return;
    submitError.clear();
    try {
      await acceptMutation.mutateAsync(token);
      setAccepted(true);
    } catch (err) {
      submitError.fail(err);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      {isLoading ? (
        <div className="space-y-3 rounded-20 border border-neutral-100 bg-white p-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full rounded-12" />
        </div>
      ) : isError || !preview || !preview.valid ? (
        <div className="rounded-20 border border-neutral-100 bg-white p-8 text-center">
          <h1 className="mb-2 text-[20px] font-semibold text-neutral-900">
            {t("join.notFoundTitle")}
          </h1>
          <p className="text-[13.5px] text-neutral-500">
            {t("join.notFoundDesc")}
          </p>
          <Link className="mt-6 inline-block" to={ROUTES.home}>
            <Button variant="outline">{t("join.goHome")}</Button>
          </Link>
        </div>
      ) : accepted ? (
        <div className="rounded-20 border border-brand-100 bg-brand-50/60 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-brand-600" size={32} />
          <h1 className="mb-2 text-[20px] font-semibold text-neutral-900">
            {t("join.in")}
          </h1>
          <p className="mb-6 text-[13.5px] text-neutral-500">
            {t("join.joined", {
              company: preview.companyName,
              role: roleLabel(preview.role),
            })}
          </p>
          <Button onClick={() => navigate(ROUTES.employerDashboard)}>
            {t("join.dashboard")}
          </Button>
        </div>
      ) : (
        <div className="rounded-20 border border-neutral-100 bg-white p-8 text-center">
          <h1 className="mb-2 text-[20px] font-semibold text-neutral-900">
            {t("join.title", { company: preview.companyName })}
          </h1>
          <p className="mb-6 text-[13.5px] text-neutral-500">
            {t("join.invitedAs")}
            <strong className="text-neutral-700">
              {roleLabel(preview.role)}
            </strong>
            {t("join.signIn")}
            <strong className="text-neutral-700">{preview.email}</strong>
            {t("join.toAccept")}
          </p>

          {user ? (
            <>
              {user.email.toLowerCase() !== preview.email.toLowerCase() && (
                <p className="mb-4 rounded-10 border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-700">
                  {t("join.mismatch", {
                    current: user.email,
                    invited: preview.email,
                  })}
                </p>
              )}
              {submitError.message && (
                <p className="mb-4 text-[12.5px] text-red-600">
                  {submitError.message}
                </p>
              )}
              <Button
                className="w-full"
                disabled={acceptMutation.isPending}
                isLoading={acceptMutation.isPending}
                onClick={() => void handleAccept()}
              >
                {t("join.accept")}
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                className="flex-1"
                to={`${ROUTES.login}?callbackUrl=${callbackUrl}`}
              >
                <Button className="w-full" variant="outline">
                  {t("join.login")}
                </Button>
              </Link>
              <Link
                className="flex-1"
                to={`${ROUTES.register}?callbackUrl=${callbackUrl}`}
              >
                <Button className="w-full">{t("join.register")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
