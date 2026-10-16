import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

const EMPLOYER_POINTS = [
  "home.employerCta.point1",
  "home.employerCta.point2",
  "home.employerCta.point3",
  "home.employerCta.point4",
];

export const EmployerCtaSection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="flex flex-col items-center gap-10 rounded-24 bg-neutral-900 p-10 md:flex-row">
          <div className="flex-1">
            <Eyebrow className="mb-3">{t("employerCta.eyebrow")}</Eyebrow>
            <h2 className="mb-3 text-[28px] font-semibold leading-tight text-white">
              {t("employerCta.title")}
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-400">
              {t("employerCta.desc")}
            </p>
            <div className="flex gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-12 bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                to={ROUTES.employer}
              >
                {t("employerCta.postJob")} <ArrowRight size={14} />
              </Link>
              {/* Same mailto the employer-marketing CTAs use — this was a dead
                to="#" link that just scrolled to the top. */}
              <a
                className="inline-flex h-11 items-center rounded-8 px-5 text-sm font-medium text-neutral-300 transition-colors hover:text-white focus-visible:shadow-focus focus-visible:outline-none"
                href="mailto:hello@remotesea.io"
              >
                {t("employerCta.talkToFounder")}
              </a>
            </div>
          </div>
          <div className="space-y-3">
            {EMPLOYER_POINTS.map((item) => (
              <div
                className="flex items-start gap-2.5 text-sm text-neutral-400"
                key={item}
              >
                <span className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-brand-600">
                  <Star className="text-white" fill="white" size={9} />
                </span>
                {t(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
