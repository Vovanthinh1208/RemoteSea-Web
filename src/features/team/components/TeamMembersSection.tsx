import { useState } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TEXT_INPUT_CLASS } from "@/components/shared/input-styles";
import type { CompanyMemberRole, TeamMember } from "@/types/team";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("team");
  const runWithToast = useToastMutation();
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();
  const displayName = member.user.name ?? member.user.email;
  const [confirm, setConfirm] = useState<"remove" | "transfer" | null>(null);
  const [password, setPassword] = useState("");

  const closeConfirm = () => {
    setConfirm(null);
    setPassword("");
  };

  const applyRole = (role: string, pw?: string) =>
    runWithToast(
      () => updateRole.mutateAsync({ id: member.id, role, password: pw }),
      {
        error: t("members.changeRoleFailed"),
        onError: (err) =>
          err instanceof ApiError ? getErrorMessage(err) : undefined,
      }
    );

  // PB39 AC3: handing the company over is never a one-click dropdown change —
  // it opens the warning + password step first. Other roles apply directly.
  const handleRoleChange = (role: string) => {
    if (role === "OWNER" && member.role !== "OWNER") {
      setConfirm("transfer");
      return;
    }
    return applyRole(role);
  };

  const handleTransfer = async () => {
    // Stay open on a wrong password so it can be retyped; close once it worked.
    const done = await applyRole("OWNER", password);
    if (done) closeConfirm();
    else setPassword("");
  };

  const handleRemove = async () => {
    closeConfirm();
    await runWithToast(() => removeMember.mutateAsync(member.id), {
      success: t("members.removed", { name: displayName }),
      error: t("members.removeFailed"),
      onError: (err) =>
        err instanceof ApiError ? getErrorMessage(err) : undefined,
    });
  };

  return (
    <div className="flex items-center gap-3 border-b border-neutral-50 px-5 py-4 last:border-none">
      <GradientInitial className="h-9 w-9 rounded-full text-[13px]">
        {personInitial(displayName)}
      </GradientInitial>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-neutral-900">
          {displayName}
          {isSelf && (
            <span className="ml-1.5 text-neutral-400">{t("members.you")}</span>
          )}
        </p>
        <p className="truncate text-[12px] text-neutral-500">
          {t("members.joined", {
            email: member.user.email,
            time: timeAgoLong(member.createdAt),
          })}
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
          aria-label={t("members.removeAria", { name: displayName })}
          className="flex-shrink-0 rounded-8 p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
          disabled={removeMember.isPending}
          type="button"
          onClick={() => setConfirm("remove")}
        >
          <X size={14} />
        </button>
      )}
      {isOwner && !isSelf && (
        <>
          <ConfirmDialog
            destructive
            cancelLabel={t("common.actions.cancel")}
            confirmLabel={t("members.removeConfirm")}
            description={t("members.removeDesc")}
            open={confirm === "remove"}
            title={t("members.removeTitle", { name: displayName })}
            onCancel={closeConfirm}
            onConfirm={() => void handleRemove()}
          />
          <ConfirmDialog
            destructive
            cancelLabel={t("common.actions.cancel")}
            confirmDisabled={!password || updateRole.isPending}
            confirmLabel={t("members.transferConfirm")}
            description={t("members.transferWarning", { name: displayName })}
            open={confirm === "transfer"}
            title={t("members.transferTitle", { name: displayName })}
            onCancel={closeConfirm}
            onConfirm={() => void handleTransfer()}
          >
            <label className="mt-4 flex flex-col gap-1 text-[12px] font-medium text-neutral-700">
              {t("members.transferPassword")}
              <input
                autoComplete="current-password"
                className={TEXT_INPUT_CLASS}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </ConfirmDialog>
        </>
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
  const { t } = useTranslation("team");
  const { data, isLoading, isError, refetch } = useTeamMembers();

  const isOwner =
    data?.find((m) => m.userId === currentUserId)?.role === "OWNER";

  return (
    <section className="overflow-hidden rounded-20 border border-neutral-100 bg-white">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          {t("members.title")}
        </h2>
        <p className="text-[12.5px] text-neutral-500">
          {data
            ? t("members.count", { count: data.length })
            : t("members.whoHasAccess")}
        </p>
      </div>

      {isLoading ? (
        Array.from({ length: MEMBER_SKELETON_COUNT }, (_, i) => (
          <MemberRowSkeleton key={i} />
        ))
      ) : isError ? (
        <div className="flex items-center justify-between px-5 py-8 text-[13px] text-neutral-400">
          {t("members.loadError")}
          <button
            className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={11} /> {t("common.actions.retryShort")}
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyRow className="px-5">{t("members.empty")}</EmptyRow>
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
