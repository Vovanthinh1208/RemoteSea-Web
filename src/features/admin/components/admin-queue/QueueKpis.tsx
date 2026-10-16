import { Ban, Check, Clock, Inbox } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { URGENT_WAIT_HOURS, waitFmt } from "@/features/admin/admin.utils";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("admin");
  const tiles = [
    {
      icon: Inbox,
      label: t("kpi.inQueue"),
      val: activeCount,
      sub: t("kpi.overSla", { count: overdueCount }),
    },
    {
      icon: Clock,
      label: t("kpi.avgWait"),
      val: waitFmt(avgWaitHours),
      sub: t("kpi.sla"),
      warn: avgWaitHours >= URGENT_WAIT_HOURS,
    },
    {
      icon: Check,
      label: t("kpi.approved"),
      val: approvedCount,
      sub: t("kpi.approvedSub"),
    },
    {
      icon: Ban,
      label: t("kpi.rejected"),
      val: rejectedCount,
      sub: t("kpi.rejectedSub"),
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
