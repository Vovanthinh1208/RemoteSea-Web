import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const FOUNDER_STATS = [
  { k: "home.founder.stat.yearsRemote", v: "7" },
  { k: "home.founder.stat.upworkHours", v: "10,400+" },
  {
    k: "home.founder.stat.upworkRank",
    v: "home.founder.stat.topPlus",
    translate: true,
  },
  {
    k: "home.founder.stat.basedIn",
    v: "home.founder.stat.location",
    translate: true,
  },
  { k: "home.founder.stat.workedWith", v: "SG · AU · US" },
];

export const FounderStorySection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <Eyebrow className="mb-3">{t("founder.eyebrow")}</Eyebrow>
        <h2 className="mb-10 text-[32px] font-semibold tracking-tight text-neutral-900">
          {t("founder.title")}
          <em className="font-serif-italic text-brand-700">
            {t("founder.titleEm")}
          </em>
        </h2>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          {/* Aside */}
          <div>
            <div className="mb-4 h-48 w-48 rounded-24 bg-gradient-to-br from-brand-200 to-brand-600" />
            <div className="space-y-2">
              {FOUNDER_STATS.map((s) => (
                <div
                  className="flex items-center justify-between rounded-8 bg-neutral-50 px-3 py-2 text-[13px]"
                  key={s.k}
                >
                  <span className="text-neutral-500">{t(s.k)}</span>
                  <span className="font-semibold text-neutral-900">
                    {s.translate ? t(s.v) : s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Prose */}
          <div className="flex flex-col justify-center">
            <blockquote className="mb-5 border-l-2 border-brand-600 pl-5">
              <p className="text-[17px] italic leading-relaxed text-neutral-700">
                &ldquo;{t("founder.quoteStart")}
                <strong className="not-italic text-neutral-900">
                  {t("founder.quoteStrong")}
                </strong>
                {t("founder.quoteEnd")}&rdquo;
              </p>
            </blockquote>
            <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
              {t("founder.p1")}
            </p>
            <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
              {t("founder.p2")}
            </p>
            <div className="mt-2">
              <div className="text-[15px] font-semibold text-neutral-900">
                — Trần Minh
              </div>
              <div className="text-[13px] text-neutral-400">
                {t("founder.role")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
