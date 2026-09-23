import { Link } from "react-router-dom";
import { Check, Loader2, Mail, RefreshCw, X } from "lucide-react";
import { useRespondToInvitation } from "@/features/invitations/invitations.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { ROUTES } from "@/constants/routes";
import type { Invitation } from "@/types/invitation";

const DASHBOARD_INVITATIONS_LIMIT = 4;

type InvitationsPanelProps = {
  invitations: Invitation[] | null;
  isError: boolean;
  refetch: () => void;
};

// Presentational read (data/isError/refetch as props) — TalentDashboard (its
// only caller) now sources these from useTalentDashboard's single aggregate
// request instead of this component firing its own useMyInvitations() call.
// The accept/decline mutation stays owned here — it's independent of where
// the read comes from.
export const InvitationsPanel = ({
  invitations,
  isError,
  refetch,
}: InvitationsPanelProps) => {
  const respond = useRespondToInvitation();
  const runWithToast = useToastMutation();
  const pending = (invitations ?? []).filter((i) => i.status === "PENDING");
  const visible = pending.slice(0, DASHBOARD_INVITATIONS_LIMIT);

  // Checked before the empty-return below, deliberately: `invitations` is
  // undefined on a fetch failure too, so `pending` comes out empty either
  // way — without this, a real pending invitation silently disappeared
  // behind a plain network error, indistinguishable from actually having
  // none. Loading intentionally still renders nothing (unchanged) — this
  // panel's existing "invisible until there's something to show" design
  // for the genuinely-empty case is fine; only the error case was silently
  // misreporting itself as that same "nothing to show" state.
  if (isError) {
    return (
      <div className="mb-5 flex items-center justify-between gap-3 overflow-hidden rounded-16 border border-neutral-100 bg-white px-5 py-4 text-[12.5px] text-neutral-400 shadow-card">
        Couldn't load your invitations.
        <button
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  if (pending.length === 0) return null;

  // respond is one shared mutation for every row, so while it's in flight
  // every button below goes disabled — but .variables still names which
  // invitation/action triggered it, letting that one row show a spinner
  // instead of leaving the whole panel looking frozen with no explanation.
  const respondingTo = respond.isPending ? respond.variables : undefined;

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
            {/* block, not left inline — text-overflow: ellipsis (from
                truncate) doesn't reliably apply to a plain inline box like
                this Link renders as by default, so a long job title could
                silently overflow the card instead of ellipsizing. */}
            <Link
              className="block truncate text-[11.5px] text-neutral-500 hover:text-brand-700 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
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
                className="inline-flex items-center gap-1 rounded-8 bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
                disabled={respond.isPending}
                type="button"
                onClick={() => respondTo(invitation, "ACCEPT")}
              >
                {respondingTo?.id === invitation.id &&
                respondingTo.action === "ACCEPT" ? (
                  <Loader2 className="animate-spin" size={11} />
                ) : (
                  <Check size={11} />
                )}
                Accept &amp; apply
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
                disabled={respond.isPending}
                type="button"
                onClick={() => respondTo(invitation, "DECLINE")}
              >
                {respondingTo?.id === invitation.id &&
                respondingTo.action === "DECLINE" ? (
                  <Loader2 className="animate-spin" size={11} />
                ) : (
                  <X size={11} />
                )}
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
