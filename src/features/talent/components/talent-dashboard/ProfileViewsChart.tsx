import { formatLocalDate } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";

interface ProfileViewsChartProps {
  daily: { date: string; views: number }[];
  height?: number;
}

// PB26 AC2 / PB27: profile views per day over the last 30 days. One series,
// one hue — the title names it, so there is no legend. Each bar carries its
// own hover tooltip; a visually hidden table gives the same numbers to
// screen readers.
export const ProfileViewsChart = ({
  daily,
  height = 96,
}: ProfileViewsChartProps) => {
  const { t } = useTranslation("talent");
  const max = Math.max(1, ...daily.map((d) => d.views));
  const label = (date: string) =>
    formatLocalDate(`${date}T00:00:00Z`, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  return (
    <figure className="m-0">
      <div
        aria-hidden="true"
        className="flex items-end gap-[2px] border-b border-neutral-200"
        style={{ height }}
      >
        {daily.map((d) => (
          <div
            className="group relative flex h-full flex-1 items-end"
            key={d.date}
            title={t("views.chartTooltip", {
              date: label(d.date),
              count: d.views,
            })}
          >
            <div
              className="w-full rounded-t-[4px] bg-brand-500 transition-colors group-hover:bg-brand-700"
              style={{
                height: d.views === 0 ? 2 : `${(d.views / max) * 100}%`,
                opacity: d.views === 0 ? 0.25 : 1,
              }}
            />
          </div>
        ))}
      </div>
      {daily.length > 0 && (
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>{label(daily[0].date)}</span>
          <span>{label(daily[daily.length - 1].date)}</span>
        </div>
      )}
      {/* sr-only on a wrapper div: a <table> ignores the 1px box sr-only
          sets and would widen the page. */}
      <div className="sr-only">
        <table>
          <caption>{t("views.chartCaption")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("views.colDate")}</th>
              <th scope="col">{t("views.colViews")}</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d) => (
              <tr key={d.date}>
                <td>{label(d.date)}</td>
                <td>{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
};
