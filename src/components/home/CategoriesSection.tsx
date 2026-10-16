import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

// Design/Marketing intentionally reach outside the brand/neutral/amber/blue
// tokens used elsewhere in the app — six categories need visually distinct
// tags, and purple/rose are otherwise unused anywhere else in the codebase.
const CATEGORIES = [
  {
    value: "Engineering",
    labelKey: "home.categories.engineering",
    count: 31,
    color: "bg-brand-50 text-brand-700",
  },
  {
    value: "Design",
    labelKey: "home.categories.design",
    count: 8,
    color: "bg-purple-50 text-purple-700",
  },
  {
    value: "Product",
    labelKey: "home.categories.product",
    count: 5,
    color: "bg-blue-50 text-blue-700",
  },
  {
    value: "Data",
    labelKey: "home.categories.data",
    count: 7,
    color: "bg-amber-50 text-amber-700",
  },
  {
    value: "Marketing",
    labelKey: "home.categories.marketing",
    count: 4,
    color: "bg-rose-50 text-rose-700",
  },
  {
    value: "Operations",
    labelKey: "home.categories.operations",
    count: 2,
    color: "bg-neutral-100 text-neutral-700",
  },
];

export const CategoriesSection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="pb-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-8">
          <Eyebrow className="mb-2">{t("categories.eyebrow")}</Eyebrow>
          <h2 className="text-[28px] font-semibold text-neutral-900">
            {t("categories.title")}
            <em className="font-serif-italic">{t("categories.titleEm")}</em>
            {t("categories.titleEnd")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              className="group flex items-center justify-between rounded-12 border border-neutral-100 bg-white px-4 py-3 transition-all hover:border-neutral-200 hover:shadow-card focus-visible:shadow-focus focus-visible:outline-none"
              key={cat.value}
              to={`/jobs?category=${cat.value}`}
            >
              <span className="text-[13px] font-medium text-neutral-700 group-hover:text-neutral-900">
                {t(cat.labelKey)}
              </span>
              <span className="flex items-center gap-0.5 text-[12px] text-neutral-400">
                {cat.count}
                <ArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
