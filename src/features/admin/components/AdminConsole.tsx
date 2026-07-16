import { Briefcase, Building, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { AdminQueue } from "@/features/admin/components/AdminQueue";
import { AdminEmployers } from "@/features/admin/components/AdminEmployers";
import { AdminRevenue } from "@/features/admin/components/AdminRevenue";
import { Eyebrow } from "@/components/ui/eyebrow";

const TABS = [
  { id: "queue", label: "Review queue", icon: Briefcase },
  { id: "employers", label: "Employers", icon: Building },
  { id: "revenue", label: "Revenue", icon: Wallet },
] as const;

type AdminTabId = (typeof TABS)[number]["id"];

const isAdminTabId = (v: string): v is AdminTabId => TABS.some((t) => t.id === v);

export const AdminConsole = () => {
  // URL-synced like its sibling components (AdminEmployers' filter/search,
  // ApplicationsTable/ApplicantsPanel's tabs) — previously this was the one
  // piece of admin nav that reset to "Review queue" on every refresh or
  // shared link.
  const [tab, setTab] = useSearchParamState<AdminTabId>("tab", "queue", isAdminTabId);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto flex max-w-[1240px] gap-6 px-6 py-8">
        <aside className="w-[180px] flex-shrink-0">
          <div className="mb-6">
            <Eyebrow>RemoteSEA</Eyebrow>
            <p className="text-[15px] font-semibold text-neutral-900">Ops console</p>
          </div>
          <nav aria-label="Ops console sections" className="space-y-0.5">
            {TABS.map((t) => (
              <button
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-10 px-3 py-2 text-[13px] transition-all",
                  tab === t.id
                    ? "bg-white font-medium text-neutral-900 shadow-sm"
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
          {tab === "revenue" && <AdminRevenue />}
        </div>
      </div>
    </div>
  );
};
