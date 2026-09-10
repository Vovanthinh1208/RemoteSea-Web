import { Briefcase, Building, Flag, History, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { AdminQueue } from "@/features/admin/components/AdminQueue";
import { AdminEmployers } from "@/features/admin/components/AdminEmployers";
import { AdminReports } from "@/features/admin/components/AdminReports";
import { AdminRevenue } from "@/features/admin/components/AdminRevenue";
import { AdminAuditLog } from "@/features/admin/components/AdminAuditLog";
import { Eyebrow } from "@/components/ui/eyebrow";

const TABS = [
  { id: "queue", label: "Review queue", icon: Briefcase },
  { id: "employers", label: "Employers", icon: Building },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "revenue", label: "Revenue", icon: Wallet },
  { id: "audit-log", label: "Audit log", icon: History },
] as const;

type AdminTabId = (typeof TABS)[number]["id"];

const isAdminTabId = (v: string): v is AdminTabId =>
  TABS.some((t) => t.id === v);

export const AdminConsole = () => {
  // URL-synced like its sibling components (AdminEmployers' filter/search,
  // ApplicationsTable/ApplicantsPanel's tabs) — previously this was the one
  // piece of admin nav that reset to "Review queue" on every refresh or
  // shared link.
  const [tab, setTab] = useSearchParamState<AdminTabId>(
    "tab",
    "queue",
    isAdminTabId
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1240px] px-6 py-8">
        {/* Below lg: a horizontal scrollable tab strip instead of the fixed
            180px vertical sidebar — that sidebar-plus-content layout had no
            responsive treatment at all, squeezing the actual console
            content (tables that are already dense on desktop) into
            whatever's left of a phone screen after 180px fixed. The lg+
            vertical sidebar below is untouched. */}
        <div className="mb-6 lg:hidden">
          <Eyebrow>RemoteSEA</Eyebrow>
          <p className="mb-3 text-[15px] font-semibold text-neutral-900">
            Ops console
          </p>
          <nav
            aria-label="Ops console sections"
            className="scrollbar-thin flex gap-2 overflow-x-auto pb-1"
          >
            {TABS.map((t) => (
              <button
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                  tab === t.id
                    ? "bg-brand-600 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                )}
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-[180px] flex-shrink-0 lg:block">
            <div className="mb-6">
              <Eyebrow>RemoteSEA</Eyebrow>
              <p className="text-[15px] font-semibold text-neutral-900">
                Ops console
              </p>
            </div>
            <nav aria-label="Ops console sections" className="space-y-0.5">
              {TABS.map((t) => (
                <button
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-10 px-3 py-2 text-[13px] transition-all focus-visible:shadow-focus focus-visible:outline-none",
                    tab === t.id
                      ? "bg-white font-medium text-neutral-900 shadow-chip"
                      : "text-neutral-500 hover:bg-white/60 hover:text-neutral-700"
                  )}
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            {tab === "queue" && <AdminQueue />}
            {tab === "employers" && <AdminEmployers />}
            {tab === "reports" && <AdminReports />}
            {tab === "revenue" && <AdminRevenue />}
            {tab === "audit-log" && <AdminAuditLog />}
          </div>
        </div>
      </div>
    </div>
  );
};
