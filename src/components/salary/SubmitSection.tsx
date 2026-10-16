import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

export const SubmitSection = () => {
  const { t } = useTranslation("salary");
  return (
    <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-2">{t("submit.eyebrow")}</Eyebrow>
            <h2 className="mb-3 text-[28px] font-semibold tracking-tight text-neutral-900">
              {t("submit.title")}
              <em className="font-serif-italic text-brand-700">
                {t("submit.titleEm")}
              </em>
              .
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500">
              {t("submit.desc")}
            </p>

            <div className="mb-6 space-y-2.5">
              {[
                {
                  icon: ShieldCheck,
                  label: t("submit.point1"),
                },
                { icon: Users, label: t("submit.point2") },
                {
                  icon: RefreshCw,
                  label: t("submit.point3"),
                },
              ].map(({ icon: Icon, label }) => (
                <div
                  className="flex items-center gap-2.5 text-[13px] text-neutral-500"
                  key={label}
                >
                  <Icon className="text-brand-600" size={14} />
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                className="rounded-12 px-5"
                disabled
                size="lg"
                title={t("submit.comingSoon")}
              >
                {t("submit.cta")} <ArrowRight size={14} />
              </Button>
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-8 px-5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
                to={ROUTES.jobs}
              >
                {t("submit.liveJobs")}
              </Link>
            </div>
          </div>

          {/* Form preview */}
          <div className="rounded-20 border border-neutral-200 bg-neutral-50 p-6">
            {[
              { k: t("submit.preview.role"), v: t("submit.preview.roleValue") },
              { k: t("submit.preview.hq"), v: t("submit.preview.hqValue") },
              { k: t("submit.preview.years"), v: "6" },
              { k: t("submit.preview.base"), v: "$5,200", highlight: true },
              { k: t("submit.preview.equity"), v: "0.05% @ $40M" },
            ].map(({ k, v, highlight }) => (
              <div
                className="flex items-center justify-between border-b border-neutral-200/60 py-3 last:border-none"
                key={k}
              >
                <span className="text-[12.5px] text-neutral-500">{k}</span>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    highlight
                      ? "font-semibold text-brand-700"
                      : "text-neutral-900"
                  )}
                >
                  {v}
                </span>
              </div>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3 text-[12px] text-neutral-400">
              <ShieldCheck className="text-brand-600" size={13} />
              {t("submit.preview.note")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
