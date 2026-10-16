import { Briefcase, MapPin } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const MEMBERS = [
  {
    name: "Linh Nguyen",
    id: 1,
    company: "Canva",
    city: "Đà Nẵng",
    years: 7,
    initial: "L",
    color: "linear-gradient(135deg,#2E9B52,#1F7A3D)",
  },
  {
    name: "Minh Trần",
    id: 2,
    company: "Linear",
    city: "TP. Hồ Chí Minh",
    years: 5,
    initial: "M",
    color: "linear-gradient(135deg,#F59E0B,#B45309)",
  },
  {
    name: "Hà Phạm",
    id: 3,
    company: "Cedar Co",
    city: "Hà Nội",
    years: 9,
    initial: "H",
    color: "linear-gradient(135deg,#2563EB,#1D4ED8)",
  },
  {
    name: "Khang Lê",
    id: 4,
    company: "Carousell",
    city: "Đà Lạt",
    years: 4,
    initial: "K",
    color: "linear-gradient(135deg,#7C3AED,#5B21B6)",
  },
];

export const MembersSection = () => {
  const { t } = useTranslation("community");
  return (
    <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-2">{t("members.eyebrow")}</Eyebrow>
          <h2 className="mb-3 text-[32px] font-semibold text-neutral-900">
            {t("members.title")}
            <em className="font-serif-italic text-brand-700">
              {t("members.titleEm")}
            </em>
            {t("members.titleEnd")}
          </h2>
          <p className="mx-auto max-w-lg text-neutral-500">
            {t("members.desc")}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <article
              className="rounded-16 border border-neutral-100 bg-white p-5 shadow-card"
              key={m.name}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-base font-semibold text-white"
                  style={{ background: m.color }}
                >
                  {m.initial}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-neutral-900">
                    {m.name}
                  </div>
                  <div className="text-[12px] text-neutral-500">
                    {t(`members.${m.id}.role`)}
                  </div>
                  <div className="text-[12px] text-neutral-400">
                    @ {m.company}
                  </div>
                </div>
              </div>
              <p className="mb-4 text-[13px] italic leading-relaxed text-neutral-600">
                &ldquo;{t(`members.${m.id}.quote`)}&rdquo;
              </p>
              <div className="flex flex-wrap gap-3 text-[12px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {m.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={11} />{" "}
                  {t("members.yearsRemote", { count: m.years })}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
