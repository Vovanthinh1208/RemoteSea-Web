import { memo, useCallback } from "react";
import { Briefcase, Building, Search, Shield, Wallet } from "lucide-react";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { CompanyLogo } from "@/components/ui/company-logo";
import { StatCard } from "@/components/ui/stat-card";
import { useToastMutation } from "@/hooks/useToastMutation";
import { AdminEmployersSkeleton } from "@/features/admin/components/AdminEmployersSkeleton";
import { useAdminEmployers, useUpdateAdminEmployer } from "@/features/admin/admin.queries";
import { colorFor } from "@/features/admin/admin.utils";
import type { AdminEmployer } from "@/types/admin";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unverified", label: "Unverified" },
] as const;

const CENTS_PER_DOLLAR = 100;
const DOLLARS_PER_THOUSAND = 1000;

interface EmployerRowProps {
  employer: AdminEmployer;
  maxSpend: number;
  isPending: boolean;
  onStatusChange: (id: string, action: "verify" | "suspend") => void;
}

const EMPLOYER_GRID_COLUMNS = "minmax(260px, 1fr) 90px 140px 100px 88px";
const EmployerRow = memo(function EmployerRow({
  employer: e,
  maxSpend,
  isPending,
  onStatusChange,
}: EmployerRowProps) {
  return (
    <div
      className="grid items-center border-b border-neutral-50 px-5 py-4 transition-colors last:border-0 hover:bg-neutral-50"
      style={{ gridTemplateColumns: EMPLOYER_GRID_COLUMNS }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo color={colorFor(e.companyName)} name={e.companyName} size={38} />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-neutral-900">
            <span className="truncate">{e.companyName}</span>
            <VerifiedBadge isVerified={e.isVerified} />
          </div>

          <div className="truncate text-[12px] text-neutral-400">
            {e.user.email} · {e.hqCountry ?? "—"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[14px] font-semibold text-neutral-900">
        <Briefcase className="text-neutral-300" size={12} />
        {e.jobCount}
      </div>

      <div>
        <div className="mb-1 font-mono text-[13px] font-semibold text-neutral-900">
          ${(e.totalSpend / CENTS_PER_DOLLAR).toLocaleString()}
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{
              width: `${Math.round((e.totalSpend / maxSpend) * 100)}%`,
            }}
          />
        </div>
      </div>

      <span className="text-[13px] text-neutral-400">
        {new Date(e.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
      </span>

      <div className="flex justify-end">
        {e.isVerified ? (
          <ConfirmAction
            isPending={isPending}
            message={`Suspend ${e.companyName}? Their listings will come down immediately.`}
            onConfirm={() => onStatusChange(e.id, "suspend")}
          >
            {({ onClick }) => (
              <button
                type="button"
                disabled={isPending}
                onClick={onClick}
                className="inline-flex h-8 min-w-[76px] items-center justify-center rounded-8 border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Suspend
              </button>
            )}
          </ConfirmAction>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onStatusChange(e.id, "verify")}
            className="inline-flex h-8 min-w-[76px] items-center justify-center rounded-8 border border-brand-200 bg-brand-50 px-3 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
});

export const AdminEmployers = () => {
  const runWithToast = useToastMutation();
  const { data, isLoading, isError, refetch } = useAdminEmployers();
  const updateEmployerMutation = useUpdateAdminEmployer();

  // URL-synced (like JobsBoard) so a filtered/searched view survives a refresh and
  // can be shared/deep-linked, instead of silently resetting to "All" on reload.
  const isFilterId = (v: string): v is (typeof FILTERS)[number]["id"] =>
    FILTERS.some((f) => f.id === v);
  const [filter, setFilter] = useSearchParamState<(typeof FILTERS)[number]["id"]>(
    "filter",
    "all",
    isFilterId
  );
  const [search, setSearch] = useSearchParamState<string>("q", "");

  const employers = data?.employers ?? [];

  const { mutateAsync: updateEmployer } = updateEmployerMutation;
  const updateEmployerStatus = useCallback(
    (id: string, action: "verify" | "suspend") =>
      runWithToast(() => updateEmployer({ id, action }), {
        success: action === "verify" ? "Employer verified" : "Employer suspended",
        successVariant: action === "verify" ? "success" : "info",
        error: "Couldn't update employer",
      }),
    [updateEmployer, runWithToast]
  );

  const rows = employers.filter((e) => {
    if (filter === "unverified" && e.isVerified) return false;
    if (search && !e.companyName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: employers.length,
    unverified: employers.filter((e) => !e.isVerified).length,
  };
  const totalSpendCents = employers.reduce((a, e) => a + e.totalSpend, 0);
  const totalListings = employers.reduce((a, e) => a + e.jobCount, 0);
  const maxSpend = Math.max(1, ...employers.map((e) => e.totalSpend));

  if (isLoading) return <AdminEmployersSkeleton />;
  // A failed load used to fall through with employers=[] — $0 stat tiles plus a
  // misleading "No employers match this filter" row, indistinguishable from a
  // genuinely empty result. Same error treatment as the queue tab instead.
  if (isError) {
    return (
      <EmptyState
        action={
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        }
        description="Something went wrong loading employers."
        title="Couldn't load employers"
      />
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Operations
        </p>
        <h1 className="text-[26px] font-semibold text-neutral-900">Employers</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {employers.length} companies · {totalListings} total listings · $
          {(totalSpendCents / CENTS_PER_DOLLAR).toLocaleString()} billed
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard icon={Building} label="Total employers" sub="all time" value={employers.length} />
        <StatCard
          icon={Shield}
          label="Unverified"
          sub="need review"
          value={counts.unverified}
          warn={counts.unverified > 0}
        />
        <StatCard
          icon={Wallet}
          label="Total billed"
          sub="lifetime"
          value={`$${(totalSpendCents / CENTS_PER_DOLLAR / DOLLARS_PER_THOUSAND).toFixed(1)}k`}
        />
      </div>

      {/* Filter + search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <PillToggle
              active={filter === f.id}
              activeClassName="bg-brand-600 text-white"
              className="px-3.5 py-1.5 text-[13px] font-medium transition-colors"
              inactiveClassName="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              key={f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}{" "}
              <span
                className={`ml-1 text-[11px] ${filter === f.id ? "text-white/70" : "text-neutral-400"}`}
              >
                {counts[f.id]}
              </span>
            </PillToggle>
          ))}
        </div>
        <div className="ml-auto flex h-9 items-center gap-2 rounded-10 border border-neutral-200 bg-white px-3 focus-within:border-brand-600 focus-within:shadow-focus">
          <Search className="text-neutral-400" size={14} />
          <input
            aria-label="Search employers"
            className="w-48 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Search employers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-12 border border-neutral-100 bg-white">
        <div
          className="grid border-b border-neutral-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
          style={{ gridTemplateColumns: EMPLOYER_GRID_COLUMNS }}
        >
          <span>Employer</span>
          <span>Listings</span>
          <span>Total spend</span>
          <span>Joined</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <EmptyRow>No employers match this filter.</EmptyRow>
        ) : (
          rows.map((e) => (
            <EmployerRow
              employer={e}
              // Scoped to this row's id — a shared mutation instance would otherwise
              // disable every other row's buttons while one employer's update is in flight.
              isPending={
                updateEmployerMutation.isPending && updateEmployerMutation.variables?.id === e.id
              }
              key={e.id}
              maxSpend={maxSpend}
              onStatusChange={updateEmployerStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};
