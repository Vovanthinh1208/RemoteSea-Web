import { Link } from "react-router-dom";
import { Check, Mail, X } from "lucide-react";
import {
  useMyInvitations,
  useRespondToInvitation,
} from "@/features/invitations/invitations.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { ROUTES } from "@/constants/routes";
import type { Invitation } from "@/types/invitation";

const DASHBOARD_INVITATIONS_LIMIT = 4;

export const InvitationsPanel = () => {
  const { data: invitations } = useMyInvitations();
  const respond = useRespondToInvitation();
  const runWithToast = useToastMutation();
  const pending = (invitations ?? []).filter((i) => i.status === "PENDING");
  const visible = pending.slice(0, DASHBOARD_INVITATIONS_LIMIT);

  if (pending.length === 0) return null;

  const respondTo = (invitation: Invitation, action: "ACCEPT" | "DECLINE") =>
    runWithToast(() => respond.mutateAsync({ id: invitation.id, action }), {
      success:
        action === "ACCEPT" ? "Application submitted" : "Invitation declined",
      error: "Couldn't respond to invitation",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-brand-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="flex items-center gap-1.5 text-[14px] font-semibold text-neutral-900">
          <Mail className="text-brand-600" size={14} />
          Invitations
        </h3>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
          {pending.length}
        </span>
      </div>
      <div>
        {visible.map((invitation) => (
          <div
            className="border-b border-neutral-50 px-5 py-3.5 last:border-none"
            key={invitation.id}
          >
            <p className="text-[13px] font-medium text-neutral-900">
              {invitation.employer.companyName}
            </p>
            <Link
              className="truncate text-[11.5px] text-neutral-500 hover:text-brand-700 hover:underline"
              to={ROUTES.jobDetail(invitation.job.id)}
            >
              invited you to apply — {invitation.job.title}
            </Link>
            {invitation.message && (
              <p className="mt-1.5 line-clamp-2 text-[12px] italic text-neutral-500">
                “{invitation.message}”
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1 rounded-8 bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                disabled={respond.isPending}
                type="button"
                onClick={() => respondTo(invitation, "ACCEPT")}
              >
                <Check size={11} /> Accept &amp; apply
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
                disabled={respond.isPending}
                type="button"
                onClick={() => respondTo(invitation, "DECLINE")}
              >
                <X size={11} /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
