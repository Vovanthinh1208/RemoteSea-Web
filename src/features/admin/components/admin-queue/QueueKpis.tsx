import { Ban, Check, Clock, Inbox } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { URGENT_WAIT_HOURS, waitFmt } from "@/features/admin/admin.utils";

interface QueueKpisProps {
  activeCount: number;
  overdueCount: number;
  avgWaitHours: number;
  approvedCount: number;
  rejectedCount: number;
}

export const QueueKpis = ({
  activeCount,
  overdueCount,
  avgWaitHours,
  approvedCount,
  rejectedCount,
}: QueueKpisProps) => {
  const tiles = [
    { icon: Inbox, label: "In queue", val: activeCount, sub: `${overdueCount} over SLA` },
    {
      icon: Clock,
      label: "Avg. wait",
      val: waitFmt(avgWaitHours),
      sub: "SLA 24h",
      warn: avgWaitHours >= URGENT_WAIT_HOURS,
    },
    { icon: Check, label: "Approved this session", val: approvedCount, sub: "+ live now" },
    { icon: Ban, label: "Rejected this session", val: rejectedCount, sub: "incl. changes requested" },
  ];

  return (
    <div className="mb-6 grid grid-cols-4 gap-3">
      {tiles.map((s) => (
<<<<<<< HEAD
        <div className="rounded-12 border border-neutral-100 bg-white p-4" key={s.label}>
          <div className="mb-2 flex items-center gap-1.5 text-[12px] text-neutral-400">
            {s.icon}
            {s.label}
          </div>
          <div
            className={`text-[22px] font-semibold ${s.warn ? "text-amber-600" : "text-neutral-900"}`}
          >
            {s.val}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400">{s.sub}</div>
        </div>
=======
        <StatCard icon={s.icon} key={s.label} label={s.label} sub={s.sub} value={s.val} warn={s.warn} />
>>>>>>> f72df65 (Fix reliability gaps and consolidate duplicated UI/utils in remotesea-web)
      ))}
    </div>
  );
};
