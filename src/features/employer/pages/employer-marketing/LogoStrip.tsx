import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";
const COMPANIES = [
  "Finch Labs",
  "Brackish",
  "Meridian",
  "Northwind",
  "Cedar Co",
  "Altimeter",
  "Sky Mavis",
  "Carousell",
];

export const LogoStrip = () => {
  const { t } = useTranslation("empmkt");
  return (
    <div className="border-y border-neutral-100 bg-neutral-50 py-8">
      <div className="mx-auto max-w-[1240px] px-6">
        <Eyebrow className="mb-5 text-center">{t("logos.title")}</Eyebrow>
        <div className="flex flex-wrap justify-center gap-x-14 gap-y-3">
          {COMPANIES.map((name) => (
            <span
              className="cursor-default font-serif text-[22px] italic tracking-tight text-neutral-300 transition-colors hover:text-neutral-700"
              key={name}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
