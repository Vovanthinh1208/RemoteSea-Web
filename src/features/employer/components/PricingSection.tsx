import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PLAN_PRICES_USD } from "@/constants/plans";
import { useTranslation } from "@/i18n/useTranslation";
import type { PlanType } from "@/types/job";
import { formatUsd } from "@/utils/format";

interface PricingTier {
  id: PlanType;
  price: number;
  annualPrice: number | null;
  featured: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: "STANDARD",
    price: PLAN_PRICES_USD.STANDARD,
    annualPrice: 1500,
    featured: false,
  },
  {
    id: "FEATURED",
    price: PLAN_PRICES_USD.FEATURED,
    annualPrice: 3500,
    featured: true,
  },
  {
    id: "HANDS_ON",
    price: PLAN_PRICES_USD.HANDS_ON,
    annualPrice: null,
    featured: false,
  },
];

interface TierPriceProps {
  tier: PricingTier;
  annual: boolean;
}

const TierPrice = ({ tier, annual }: TierPriceProps) => {
  const { t } = useTranslation("empmkt");
  if (annual && tier.annualPrice) {
    return (
      <>
        {formatUsd(tier.annualPrice)}
        <span className="ml-1 font-sans text-[16px] text-neutral-400">
          {t("pricing.perYear")}
        </span>
      </>
    );
  }
  if (annual && !tier.annualPrice) {
    return <span className="text-[32px] italic">{t("pricing.quote")}</span>;
  }
  return (
    <>
      {formatUsd(tier.price)}
      <span className="ml-1 font-sans text-[16px] text-neutral-400">
        {t("pricing.perPost")}
      </span>
    </>
  );
};

export const PricingSection = () => {
  const { t } = useTranslation("empmkt");
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-3">{t("pricing.eyebrow")}</Eyebrow>
          <h2 className="text-[36px] font-semibold tracking-tight text-neutral-900">
            {t("pricing.title")}
            <em className="font-serif-italic text-brand-700">
              {t("pricing.titleEm")}
            </em>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
            {t("pricing.desc")}
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1">
            <button
              className={`rounded-full px-5 py-2 text-[13.5px] font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none ${
                !annual
                  ? "bg-white text-neutral-900 shadow-chip"
                  : "text-neutral-500"
              }`}
              onClick={() => setAnnual(false)}
            >
              {t("pricing.perRole")}
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13.5px] font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none ${
                annual
                  ? "bg-white text-neutral-900 shadow-chip"
                  : "text-neutral-500"
              }`}
              onClick={() => setAnnual(true)}
            >
              {t("pricing.annual")}
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-semibold text-brand-700">
                {t("pricing.save")}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              className={`relative flex flex-col rounded-24 border p-7 ${
                tier.featured
                  ? "border-brand-600 bg-gradient-to-b from-brand-50 to-white shadow-card-lg"
                  : "border-neutral-100 bg-white"
              }`}
              key={tier.id}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {t("pricing.popular")}
                </div>
              )}

              <div className="mb-1 text-[16px] font-semibold text-neutral-900">
                {t(`pricing.${tier.id}.name`)}
              </div>
              <div className="mb-4 text-[12.5px] text-neutral-400">
                {t(`pricing.${tier.id}.tag`)}
              </div>

              <div
                className="mb-3 font-serif text-[48px] leading-none tracking-tight text-neutral-900"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <TierPrice annual={annual} tier={tier} />
              </div>

              <p className="mb-5 min-h-[42px] text-[13.5px] leading-relaxed text-neutral-500">
                {t(`pricing.${tier.id}.desc`)}
              </p>

              {tier.id === "HANDS_ON" ? (
                <a
                  className="mb-6 flex w-full items-center justify-center gap-2 rounded-12 border border-neutral-200 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none"
                  href="mailto:hello@remotesea.io"
                >
                  {t("pricing.talk")} <ArrowRight size={14} />
                </a>
              ) : (
                <Link
                  className={`mb-6 flex w-full items-center justify-center gap-2 rounded-12 py-3 text-sm font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none ${
                    tier.featured
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                  to={ROUTES.postJob}
                >
                  {t("pricing.start")} <ArrowRight size={14} />
                </Link>
              )}

              <ul className="space-y-2.5 border-t border-neutral-100 pt-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <li
                    className="flex items-start gap-2.5 text-[13.5px] text-neutral-700"
                    key={n}
                  >
                    <span className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-brand-50">
                      <Check className="text-brand-600" size={10} />
                    </span>
                    {t(`pricing.${tier.id}.f${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-5 py-3 text-[13.5px] text-brand-700">
            <Check size={15} />
            {t("pricing.guarantee")}
          </div>
        </div>
      </div>
    </section>
  );
};
