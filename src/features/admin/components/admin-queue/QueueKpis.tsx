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
    {
      icon: Ban,
      label: "Rejected this session",
      val: rejectedCount,
      sub: "incl. changes requested",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-4 gap-3">
      {tiles.map((s) => (
        <StatCard
          icon={s.icon}
          key={s.label}
          label={s.label}
          sub={s.sub}
          value={s.val}
          warn={s.warn}
        />
      ))}
    </div>
  );
};
