import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, X } from "lucide-react";
import {
  useInviteTeamMember,
  usePendingInvitations,
  useRevokeTeamInvitation,
} from "@/features/team/team.queries";
import {
  inviteMemberFormSchema,
  type InviteMemberFormValues,
} from "@/features/team/team.schemas";
import { roleLabel } from "@/features/team/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldError } from "@/components/shared/FieldError";
import {
  TEXT_INPUT_CLASS,
  SELECT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import type { CompanyMemberRole } from "@/types/team";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// timeAgoLong is built for past timestamps only (diff = now - date) and
// silently collapses to "Just now" for any future one — expiresAt is
// always in the future for a still-pending invitation, so this needs its
// own small "expires in..." formatter instead of reusing that helper.
const expiresInLabel = (expiresAt: string): string => {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "expired";
  const days = Math.floor(diffMs / MS_PER_DAY);
  if (days >= 1) return `expires in ${days}d`;
  const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
  return `expires in ${hours}h`;
};

const INVITABLE_ROLES: Exclude<CompanyMemberRole, "OWNER">[] = [
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
];

export const InviteMemberSection = () => {
  const runWithToast = useToastMutation();
  const inviteMutation = useInviteTeamMember();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: { role: "RECRUITER" },
  });

  const onSubmit = (values: InviteMemberFormValues) =>
    runWithToast(() => inviteMutation.mutateAsync(values), {
      success: "Invitation sent",
      successDescription: `${values.email} has 7 days to accept.`,
      error: "Couldn't send invitation",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    }).then((ok) => {
      if (ok) reset({ email: "", role: "RECRUITER" });
    });

  return (
    <section className="rounded-20 border border-neutral-100 bg-white p-5">
      <h2 className="mb-1 text-[15px] font-semibold text-neutral-900">
        Invite a team member
      </h2>
      <p className="mb-4 text-[12.5px] text-neutral-500">
        They'll get an email with a link to join, and sign in with their own
        account — never shared credentials.
      </p>

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1 space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="invite-email"
          >
            Email
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="invite-email"
            placeholder="teammate@company.com"
            type="email"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-1.5 sm:w-44">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="invite-role"
          >
            Role
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id="invite-role"
            {...register("role")}
          >
            {INVITABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          {/* Invisible label-height spacer — keeps the button's own top edge
              aligned with the email/role inputs (not their labels) on the
              sm:flex-row layout, without hardcoding a pixel offset. */}
          <span
            aria-hidden="true"
            className="hidden text-[12.5px] font-medium sm:block"
          >
            &nbsp;
          </span>
          <Button
            disabled={inviteMutation.isPending}
            isLoading={inviteMutation.isPending}
            type="submit"
          >
            Send invite
          </Button>
        </div>
      </form>

      <PendingInvitationsList />
    </section>
  );
};

const PendingInvitationsList = () => {
  const { data, isLoading, isError, refetch } = usePendingInvitations();
  const runWithToast = useToastMutation();
  const revokeMutation = useRevokeTeamInvitation();

  const handleRevoke = (id: string) =>
    runWithToast(() => revokeMutation.mutateAsync(id), {
      error: "Couldn't revoke invitation",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  if (isLoading) {
    return (
      <div className="mt-5 space-y-2 border-t border-neutral-100 pt-4">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-9 w-full rounded-10" />
      </div>
    );
  }

  // A failed fetch gets a retry affordance, same as TeamMembersSection and
  // ReviewsSection — hiding it outright would be indistinguishable from
  // "no pending invitations" and silently swallow a real error. Zero
  // invitations, by contrast, isn't an error, so that case still renders
  // nothing (this section's optional, secondary to the invite form above).
  if (isError) {
    return (
      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-[12.5px] text-neutral-400">
        Couldn't load pending invitations.
        <button
          className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }
  if (!data || data.length === 0) return null;

  // revokeMutation is one shared mutation for every row below — while it's
  // in flight every row's button goes disabled, but .variables still names
  // which invitation triggered it, so that one row can show a spinner
  // instead of the whole list looking frozen with no explanation (same
  // fix as InvitationsPanel/SecuritySection/ConnectedAccountsSection).
  const revokingId = revokeMutation.isPending
    ? revokeMutation.variables
    : undefined;

  return (
    <div className="mt-5 border-t border-neutral-100 pt-4">
      <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-neutral-400">
        Pending invitations
      </p>
      <div className="space-y-1.5">
        {data.map((invitation) => (
          <div
            className="flex items-center justify-between gap-3 rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
            key={invitation.id}
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-neutral-800">
                {invitation.email}
              </p>
              <p className="text-[11.5px] text-neutral-500">
                {roleLabel(invitation.role)} ·{" "}
                {expiresInLabel(invitation.expiresAt)}
              </p>
            </div>
            <button
              aria-label={`Revoke invitation to ${invitation.email}`}
              className="flex-shrink-0 rounded-8 p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
              disabled={revokeMutation.isPending}
              type="button"
              onClick={() => void handleRevoke(invitation.id)}
            >
              {revokingId === invitation.id ? (
                <Loader2 className="animate-spin" size={13} />
              ) : (
                <X size={13} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
