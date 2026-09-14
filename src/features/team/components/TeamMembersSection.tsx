import { RefreshCw, X } from "lucide-react";
import {
  useRemoveTeamMember,
  useTeamMembers,
  useUpdateTeamMemberRole,
} from "@/features/team/team.queries";
import { RoleBadge, roleLabel } from "@/features/team/components/RoleBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { GradientInitial } from "@/components/ui/gradient-initial";
import { SELECT_INPUT_CLASS } from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { timeAgoLong } from "@/utils/time";
import { personInitial } from "@/utils/name";
import { cn } from "@/utils/cn";
import type { CompanyMemberRole, TeamMember } from "@/types/team";

const ASSIGNABLE_ROLES: CompanyMemberRole[] = [
  "OWNER",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
];

const MEMBER_SKELETON_COUNT = 3;

const MemberRowSkeleton = () => (
  <div className="flex items-center gap-3 border-b border-neutral-50 px-5 py-4 last:border-none">
    <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-3 w-52" />
    </div>
    <Skeleton className="h-6 w-24 flex-shrink-0 rounded-full" />
  </div>
);

interface MemberRowProps {
  member: TeamMember;
  isOwner: boolean;
  isSelf: boolean;
}

const MemberRow = ({ member, isOwner, isSelf }: MemberRowProps) => {
  const runWithToast = useToastMutation();
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();
  const displayName = member.user.name ?? member.user.email;

  const handleRoleChange = (role: string) =>
    runWithToast(() => updateRole.mutateAsync({ id: member.id, role }), {
      error: "Couldn't change role",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  const handleRemove = () =>
    runWithToast(() => removeMember.mutateAsync(member.id), {
      success: `Removed ${displayName}`,
      error: "Couldn't remove member",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  return (
    <div className="flex items-center gap-3 border-b border-neutral-50 px-5 py-4 last:border-none">
      <GradientInitial className="h-9 w-9 rounded-full text-[13px]">
        {personInitial(displayName)}
      </GradientInitial>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-neutral-900">
          {displayName}
          {isSelf && <span className="ml-1.5 text-neutral-400">(you)</span>}
        </p>
        <p className="truncate text-[12px] text-neutral-500">
          {member.user.email} · Joined {timeAgoLong(member.createdAt)}
        </p>
      </div>
      {isOwner && !isSelf ? (
        <select
          className={cn(
            SELECT_INPUT_CLASS,
            "w-auto flex-shrink-0 py-1.5 text-[12.5px]"
          )}
          disabled={updateRole.isPending}
          value={member.role}
          onChange={(e) => void handleRoleChange(e.target.value)}
        >
          {ASSIGNABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
      ) : (
        <RoleBadge role={member.role} />
      )}
      {isOwner && !isSelf && (
        <button
          aria-label={`Remove ${displayName}`}
          className="flex-shrink-0 rounded-8 p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
          disabled={removeMember.isPending}
          type="button"
          onClick={() => void handleRemove()}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

interface TeamMembersSectionProps {
  currentUserId: string;
}

export const TeamMembersSection = ({
  currentUserId,
}: TeamMembersSectionProps) => {
  const { data, isLoading, isError, refetch } = useTeamMembers();

  const isOwner =
    data?.find((m) => m.userId === currentUserId)?.role === "OWNER";

  return (
    <section className="overflow-hidden rounded-20 border border-neutral-100 bg-white">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          Team members
        </h2>
        <p className="text-[12.5px] text-neutral-500">
          {data
            ? `${data.length} ${data.length === 1 ? "member" : "members"}`
            : "Who has access to this company"}
        </p>
      </div>

      {isLoading ? (
        Array.from({ length: MEMBER_SKELETON_COUNT }, (_, i) => (
          <MemberRowSkeleton key={i} />
        ))
      ) : isError ? (
        <div className="flex items-center justify-between px-5 py-8 text-[13px] text-neutral-400">
          Couldn't load your team.
          <button
            className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyRow className="px-5">No team members yet.</EmptyRow>
      ) : (
        data.map((member) => (
          <MemberRow
            isOwner={isOwner}
            isSelf={member.userId === currentUserId}
            key={member.id}
            member={member}
          />
        ))
      )}
    </section>
  );
};
