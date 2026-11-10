import { memo, useCallback, useState } from "react";
import { Ban, Search, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { StatCard } from "@/components/ui/stat-card";
import { Pagination } from "@/features/jobs/components/Pagination";
import { useToastMutation } from "@/hooks/useToastMutation";
import { AdminUsersSkeleton } from "@/features/admin/components/AdminUsersSkeleton";
import {
  useAdminUsers,
  useUpdateAdminUser,
} from "@/features/admin/admin.queries";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { AdminUser } from "@/types/admin";
import type { UserRole } from "@/types/user";
import { useTranslation } from "@/i18n/useTranslation";
import { formatLocalDate } from "@/utils/format";

const ROLE_FILTERS = [
  { id: "all" },
  { id: "TALENT" },
  { id: "EMPLOYER" },
  { id: "ADMIN" },
] as const;

const ROLE_VALUES: UserRole[] = ["TALENT", "EMPLOYER", "ADMIN"];

const USER_GRID_COLUMNS = "minmax(220px,1fr) 100px 120px 100px 160px";

interface UserRowProps {
  user: AdminUser;
  isPending: boolean;
  isSelf: boolean;
  onBanChange: (id: string, action: "ban" | "unban", reason?: string) => void;
  onRoleChange: (id: string, role: UserRole) => void;
}

const UserRow = memo(function UserRow({
  user: u,
  isPending,
  isSelf,
  onBanChange,
  onRoleChange,
}: UserRowProps) {
  const { t } = useTranslation("admin");
  const [selectedRole, setSelectedRole] = useState(u.role);
  const roleOptions = ROLE_VALUES.map((value) => ({
    value,
    label: t(`users.roles.${value}`),
  }));
  return (
    <div
      className="grid items-center border-b border-neutral-50 px-5 py-4 transition-colors last:border-0 hover:bg-neutral-50"
      style={{ gridTemplateColumns: USER_GRID_COLUMNS }}
    >
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-neutral-900">
          {u.name ?? "—"}
          {isSelf && (
            <span className="ml-1.5 text-[11px] font-normal text-neutral-400">
              {t("users.you")}
            </span>
          )}
        </div>
        <div className="truncate text-[12px] text-neutral-400">{u.email}</div>
        <div className="truncate font-mono text-[10px] text-neutral-400">
          {u.id}
        </div>
      </div>

      <div className="space-y-1">
        <select
          aria-label={t("users.roleFor", { email: u.email })}
          disabled={isSelf || isPending}
          className="w-full rounded border p-1 text-xs"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          disabled={isSelf || isPending || selectedRole === u.role}
          onClick={() => onRoleChange(u.id, selectedRole)}
        >
          {t("common.actions.save")}
        </Button>
      </div>

      {u.bannedAt ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
          <Ban size={11} /> {t("users.banned")}
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          {t("users.active")}
        </span>
      )}

      <span className="text-[13px] text-neutral-400">
        {formatLocalDate(u.createdAt, { month: "short", year: "numeric" })}
      </span>

      <div className="flex justify-end">
        {isSelf ? (
          <span className="text-[12px] text-neutral-300">—</span>
        ) : u.bannedAt ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onBanChange(u.id, "unban")}
            className="inline-flex h-8 min-w-[76px] items-center justify-center rounded-8 border border-brand-200 bg-brand-50 px-3 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("users.unban")}
          </button>
        ) : (
          <ConfirmAction
            isPending={isPending}
            message={t("users.banQ", { email: u.email })}
            noteMinLength={1}
            noteLabel={t("decision.reason")}
            onConfirm={(reason) => onBanChange(u.id, "ban", reason)}
          >
            {({ onClick }) => (
              <button
                type="button"
                disabled={isPending}
                onClick={onClick}
                className="inline-flex h-8 min-w-[76px] items-center justify-center rounded-8 border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("users.ban")}
              </button>
            )}
          </ConfirmAction>
        )}
      </div>
    </div>
  );
});

export const AdminUsers = () => {
  const { t } = useTranslation("admin");
  const { user: currentUser } = useAuth();
  const runWithToast = useToastMutation();
  const [page, setPage] = useState(1);
  const [banned, setBanned] = useState<"all" | "true" | "false">("all");
  const updateUserMutation = useUpdateAdminUser();

  const isRoleFilterId = (
    v: string
  ): v is (typeof ROLE_FILTERS)[number]["id"] =>
    ROLE_FILTERS.some((f) => f.id === v);
  const [roleFilter, setRoleFilter] = useSearchParamState<
    (typeof ROLE_FILTERS)[number]["id"]
  >("role", "all", isRoleFilterId);
  const [search, setSearch] = useSearchParamState<string>("q", "");

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    role: roleFilter === "all" ? undefined : roleFilter,
    banned: banned === "all" ? undefined : banned,
    q: search || undefined,
  });
  const users = data?.users ?? [];

  const { mutateAsync: updateUser } = updateUserMutation;
  const changeBanStatus = useCallback(
    (id: string, action: "ban" | "unban", reason?: string) =>
      runWithToast(() => updateUser({ id, action, reason }), {
        success:
          action === "ban" ? t("users.bannedToast") : t("users.unbannedToast"),
        successVariant: action === "ban" ? "info" : "success",
        error: t("users.updateFailed"),
      }),
    [updateUser, runWithToast, t]
  );
  const changeRole = useCallback(
    (id: string, role: UserRole) =>
      runWithToast(() => updateUser({ id, action: "change-role", role }), {
        success: t("users.roleUpdated"),
        error: t("users.roleFailed"),
      }),
    [updateUser, runWithToast, t]
  );

  const rows = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (
      search &&
      !u.email.toLowerCase().includes(search.toLowerCase()) &&
      !(u.name ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: users.length,
    TALENT: users.filter((u) => u.role === "TALENT").length,
    EMPLOYER: users.filter((u) => u.role === "EMPLOYER").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };
  const bannedCount = users.filter((u) => u.bannedAt).length;

  if (isLoading) return <AdminUsersSkeleton />;
  if (isError) {
    return (
      <EmptyState
        action={
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            {t("common.actions.retry")}
          </Button>
        }
        description={t("users.errorDesc")}
        title={t("users.errorTitle")}
      />
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6">
        <Eyebrow className="mb-0.5">{t("users.eyebrow")}</Eyebrow>
        <h1 className="text-[26px] font-semibold text-neutral-900">
          {t("users.title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {t("users.summary", {
            total: data?.pagination.total ?? 0,
            banned: bannedCount,
          })}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          icon={UsersIcon}
          label={t("users.stat.total")}
          sub={t("users.stat.totalSub")}
          value={data?.pagination.total ?? 0}
        />
        <StatCard
          icon={ShieldAlert}
          label={t("users.stat.admins")}
          sub={t("rep.stat.thisView")}
          value={counts.ADMIN}
        />
        <StatCard
          icon={Ban}
          label={t("users.stat.banned")}
          sub={t("rep.stat.thisView")}
          value={bannedCount}
          warn={bannedCount > 0}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {ROLE_FILTERS.map((f) => (
            <PillToggle
              active={roleFilter === f.id}
              activeClassName="bg-brand-600 text-white"
              className="px-3.5 py-1.5 text-[13px] font-medium transition-colors"
              inactiveClassName="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              key={f.id}
              onClick={() => {
                setRoleFilter(f.id);
                setPage(1);
              }}
            >
              {t(`users.roles.${f.id}`)}{" "}
            </PillToggle>
          ))}
        </div>
        <div className="flex h-9 w-full items-center gap-2 rounded-10 border border-neutral-200 bg-white px-3 focus-within:border-brand-600 focus-within:shadow-focus sm:ml-auto sm:w-auto">
          <select
            aria-label={t("users.statusFilter")}
            value={banned}
            onChange={(e) => {
              setBanned(e.target.value as "all" | "true" | "false");
              setPage(1);
            }}
          >
            <option value="all">{t("users.roles.all")}</option>
            <option value="false">{t("users.active")}</option>
            <option value="true">{t("users.banned")}</option>
          </select>
          <Search className="text-neutral-400" size={14} />
          <input
            aria-label={t("users.searchAria")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 sm:w-48"
            placeholder={t("users.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-12 border border-neutral-100 bg-white">
        <div
          className="grid border-b border-neutral-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
          style={{ gridTemplateColumns: USER_GRID_COLUMNS }}
        >
          <span>{t("users.col.user")}</span>
          <span>{t("users.col.role")}</span>
          <span>{t("users.col.status")}</span>
          <span>{t("users.col.joined")}</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <EmptyRow>{t("users.empty")}</EmptyRow>
        ) : (
          rows.map((u) => (
            <UserRow
              isPending={
                updateUserMutation.isPending &&
                updateUserMutation.variables?.id === u.id
              }
              isSelf={u.id === currentUser?.id}
              key={u.id}
              user={u}
              onBanChange={changeBanStatus}
              onRoleChange={changeRole}
            />
          ))
        )}
      </div>
      {data && (
        <Pagination
          page={data.pagination.page}
          pages={data.pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
