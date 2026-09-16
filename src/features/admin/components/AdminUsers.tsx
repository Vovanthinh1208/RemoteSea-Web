import { memo, useCallback } from "react";
import { Ban, Search, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { StatCard } from "@/components/ui/stat-card";
import { Dropdown } from "@/components/ui/dropdown";
import { useToastMutation } from "@/hooks/useToastMutation";
import { AdminUsersSkeleton } from "@/features/admin/components/AdminUsersSkeleton";
import {
  useAdminUsers,
  useUpdateAdminUser,
} from "@/features/admin/admin.queries";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { AdminUser } from "@/types/admin";
import type { UserRole } from "@/types/user";

const ROLE_FILTERS = [
  { id: "all", label: "All" },
  { id: "TALENT", label: "Talent" },
  { id: "EMPLOYER", label: "Employer" },
  { id: "ADMIN", label: "Admin" },
] as const;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "TALENT", label: "Talent" },
  { value: "EMPLOYER", label: "Employer" },
  { value: "ADMIN", label: "Admin" },
];

const USER_GRID_COLUMNS = "minmax(220px,1fr) 100px 120px 100px 160px";

interface UserRowProps {
  user: AdminUser;
  isPending: boolean;
  isSelf: boolean;
  onBanChange: (id: string, action: "ban" | "unban") => void;
  onRoleChange: (id: string, role: UserRole) => void;
}

const UserRow = memo(function UserRow({
  user: u,
  isPending,
  isSelf,
  onBanChange,
  onRoleChange,
}: UserRowProps) {
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
              (you)
            </span>
          )}
        </div>
        <div className="truncate text-[12px] text-neutral-400">{u.email}</div>
      </div>

      <Dropdown
        aria-label={`Role for ${u.email}`}
        className={isSelf || isPending ? "pointer-events-none opacity-60" : ""}
        options={ROLE_OPTIONS}
        value={u.role}
        onChange={(v) => onRoleChange(u.id, v as UserRole)}
      />

      {u.bannedAt ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
          <Ban size={11} /> Banned
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          Active
        </span>
      )}

      <span className="text-[13px] text-neutral-400">
        {new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
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
            Unban
          </button>
        ) : (
          <ConfirmAction
            isPending={isPending}
            message={`Ban ${u.email}? They'll be signed out everywhere and can't log back in.`}
            onConfirm={() => onBanChange(u.id, "ban")}
          >
            {({ onClick }) => (
              <button
                type="button"
                disabled={isPending}
                onClick={onClick}
                className="inline-flex h-8 min-w-[76px] items-center justify-center rounded-8 border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ban
              </button>
            )}
          </ConfirmAction>
        )}
      </div>
    </div>
  );
});

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const runWithToast = useToastMutation();
  const { data, isLoading, isError, refetch } = useAdminUsers();
  const updateUserMutation = useUpdateAdminUser();

  const isRoleFilterId = (
    v: string
  ): v is (typeof ROLE_FILTERS)[number]["id"] =>
    ROLE_FILTERS.some((f) => f.id === v);
  const [roleFilter, setRoleFilter] = useSearchParamState<
    (typeof ROLE_FILTERS)[number]["id"]
  >("role", "all", isRoleFilterId);
  const [search, setSearch] = useSearchParamState<string>("q", "");

  const users = data?.users ?? [];

  const { mutateAsync: updateUser } = updateUserMutation;
  const changeBanStatus = useCallback(
    (id: string, action: "ban" | "unban") =>
      runWithToast(() => updateUser({ id, action }), {
        success: action === "ban" ? "User banned" : "User unbanned",
        successVariant: action === "ban" ? "info" : "success",
        error: "Couldn't update user",
      }),
    [updateUser, runWithToast]
  );
  const changeRole = useCallback(
    (id: string, role: UserRole) =>
      runWithToast(() => updateUser({ id, action: "change-role", role }), {
        success: "Role updated",
        error: "Couldn't update role",
      }),
    [updateUser, runWithToast]
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
            Try again
          </Button>
        }
        description="Something went wrong loading users."
        title="Couldn't load users"
      />
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6">
        <Eyebrow className="mb-0.5">Operations</Eyebrow>
        <h1 className="text-[26px] font-semibold text-neutral-900">Users</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {users.length} accounts · {bannedCount} banned
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          icon={UsersIcon}
          label="Total users"
          sub="all roles"
          value={users.length}
        />
        <StatCard
          icon={ShieldAlert}
          label="Admins"
          sub="platform-wide access"
          value={counts.ADMIN}
        />
        <StatCard
          icon={Ban}
          label="Banned"
          sub="blocked from sign-in"
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
              onClick={() => setRoleFilter(f.id)}
            >
              {f.label}{" "}
              <span
                className={`ml-1 text-[11px] ${roleFilter === f.id ? "text-white/70" : "text-neutral-400"}`}
              >
                {counts[f.id]}
              </span>
            </PillToggle>
          ))}
        </div>
        <div className="flex h-9 w-full items-center gap-2 rounded-10 border border-neutral-200 bg-white px-3 focus-within:border-brand-600 focus-within:shadow-focus sm:ml-auto sm:w-auto">
          <Search className="text-neutral-400" size={14} />
          <input
            aria-label="Search users"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 sm:w-48"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-12 border border-neutral-100 bg-white">
        <div
          className="grid border-b border-neutral-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
          style={{ gridTemplateColumns: USER_GRID_COLUMNS }}
        >
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <EmptyRow>No users match this filter.</EmptyRow>
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
    </div>
  );
};
