import { MapPin } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

const EVENTS = [
  {
    id: 1,
    dayNum: "06",
    attendees: 32,
    city: "Đà Nẵng",
    color: "#2E9B52",
  },
  {
    id: 2,
    dayNum: "11",
    attendees: 64,
    city: null,
    color: "#2563EB",
  },
  {
    id: 3,
    dayNum: "18",
    attendees: 41,
    city: null,
    color: "#B45309",
  },
  {
    id: 4,
    dayNum: "27",
    attendees: 22,
    city: "TP.HCM",
    color: "#1F7A3D",
  },
];

export const MeetupsSection = () => {
  const { t } = useTranslation("community");
  return (
    <section className="bg-neutral-900 py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            {t("meetups.eyebrow")}
          </p>
          <h2 className="mb-3 text-[32px] font-semibold text-white">
            {t("meetups.title")}
            <em className="font-serif-italic text-brand-400">
              {t("meetups.titleEm")}
            </em>
            {t("meetups.titleEnd")}
          </h2>
          <p className="mx-auto max-w-lg text-neutral-400">
            {t("meetups.desc")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e, i) => (
            <article
              className="flex gap-4 rounded-16 border border-neutral-700 bg-neutral-800 p-5"
              key={i}
            >
              <div
                className="flex w-14 flex-shrink-0 flex-col items-center rounded-10 border-t-2 bg-neutral-700 pt-2"
                style={{ borderColor: e.color }}
              >
                <span className="text-[10px] font-semibold uppercase text-neutral-400">
                  {t(`meetups.${e.id}.month`)}
                </span>
                <span className="text-[22px] font-semibold text-white">
                  {e.dayNum}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t(`meetups.${e.id}.weekday`)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
                  <MapPin size={10} /> {e.city ?? t("meetups.online")}
                </div>
                <h4 className="mb-1.5 text-[14px] font-semibold text-white">
                  {t(`meetups.${e.id}.title`)}
                </h4>
                <p className="mb-3 text-[12px] leading-relaxed text-neutral-400">
                  {t(`meetups.${e.id}.desc`)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((j) => (
                      <span
                        className="h-5 w-5 rounded-full border border-neutral-800"
                        key={j}
                        style={{
                          background: `hsl(${(i + j) * 60}, 50%, 50%)`,
                        }}
                      />
                    ))}
                    <span className="ml-1 text-[11px] text-neutral-400">
                      {t("meetups.going", { count: e.attendees })}
                    </span>
                  </div>
                  <button
                    className="rounded-8 text-[12px] font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none"
                    style={{ color: e.color }}
                  >
                    {t("meetups.rsvp")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
