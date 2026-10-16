import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";
import { formatLocalDate } from "@/utils/format";
import { selectVisibleSprints } from "../sprint-visibility";
import { ALL_SPRINTS, type Sprint } from "../sprints.data";

// "2026-10-06" as a *local* date: new Date("2026-10-06") parses as UTC midnight
// and would render a day early in timezones west of UTC.
const isoToLocalDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

interface SprintBoardProps {
  sprints?: Sprint[];
  /** Raw VITE_VISIBLE_SPRINTS-style value; defaults to the build env. */
  visible?: string;
}

const SprintDate = ({ label, iso }: { label: string; iso: string | null }) => {
  const { t } = useTranslation("sprints");
  return (
    <div>
      <dt className="text-[12px] text-neutral-500">{label}</dt>
      <dd className="text-[14px] font-medium text-neutral-900">
        {iso ? (
          formatLocalDate(isoToLocalDate(iso), { dateStyle: "medium" })
        ) : (
          <span className="font-normal text-neutral-500">
            {t("page.datesUnknown")}
          </span>
        )}
      </dd>
    </div>
  );
};

export const SprintBoardPage = ({
  sprints = ALL_SPRINTS,
  visible = import.meta.env.VITE_VISIBLE_SPRINTS,
}: SprintBoardProps) => {
  const { t } = useTranslation("sprints");
  useDocumentTitle(t("page.docTitle"));

  const shown = selectVisibleSprints(sprints, visible);
  const hiddenCount = sprints.length - shown.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        {hiddenCount > 0 && (
          <p
            className="mb-6 rounded-12 border border-brand-100 bg-brand-50 px-4 py-3 text-[13px] text-neutral-700"
            role="status"
          >
            {t("mode.banner", { count: hiddenCount })}{" "}
            <span className="text-neutral-500">{t("mode.restore")}</span>
          </p>
        )}

        {shown.length === 0 ? (
          <Card className="p-8 text-center">
            <h1 className="text-[20px] font-semibold text-neutral-900">
              {t("empty.title")}
            </h1>
            <p className="mt-2 text-[14px] text-neutral-500">
              {t("empty.desc")}
            </p>
          </Card>
        ) : (
          shown.map((sprint) => (
            <section
              key={sprint.id}
              aria-labelledby={`sprint-${sprint.id}-title`}
              className="mb-10"
            >
              <Eyebrow className="mb-2">{t("page.eyebrow")}</Eyebrow>
              <h1
                className="text-[28px] font-semibold tracking-tight text-neutral-900 sm:text-[32px]"
                id={`sprint-${sprint.id}-title`}
              >
                {t("page.title", { id: sprint.id })}
              </h1>
              {sprint.name && (
                <p className="mt-1 text-[15px] text-neutral-600">
                  {sprint.name}
                </p>
              )}

              <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                <SprintDate iso={sprint.startDate} label={t("page.start")} />
                <SprintDate iso={sprint.dueDate} label={t("page.due")} />
              </dl>

              <div className="mb-3 mt-8 flex flex-wrap items-center gap-3">
                <h2 className="text-[16px] font-semibold text-neutral-900">
                  {t("page.pbiHeading")}
                </h2>
                <Badge variant="muted">
                  {t("page.pbiCount", { count: sprint.pbis.length })}
                </Badge>
              </div>

              <Card className="overflow-hidden p-0">
                <ul className="divide-y divide-neutral-100">
                  {sprint.pbis.map((pbi) => (
                    <li
                      key={pbi.id}
                      className="flex items-baseline gap-4 px-4 py-3 sm:px-5"
                    >
                      <span className="w-12 shrink-0 font-mono text-[13px] font-medium text-brand-700">
                        {pbi.id}
                      </span>
                      <span className="min-w-0 text-[14px] text-neutral-900">
                        {pbi.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
