import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PillToggle } from "@/components/shared/PillToggle";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const POSTS = [
  {
    id: "p1",
    featured: true,
    category: "negotiation",
    author: "Linh Nguyen",
    authorInitial: "L",
    authorColor: "linear-gradient(135deg,#2E9B52,#1F7A3D)",
    date: "2026-03-12",
    readTime: 9,
    accent: "#2E9B52",
    bg: "linear-gradient(135deg, #2E9B52 0%, #0D3D1F 100%)",
  },
  {
    id: "p2",
    category: "async",
    author: "Minh Trần",
    authorInitial: "M",
    authorColor: "linear-gradient(135deg,#F59E0B,#B45309)",
    date: "2026-03-08",
    readTime: 6,
    accent: "#B45309",
    bg: "linear-gradient(140deg, #FCD34D 0%, #B45309 100%)",
  },
  {
    id: "p3",
    category: "salary",
    author: "Hà Phạm",
    authorInitial: "H",
    authorColor: "linear-gradient(135deg,#2563EB,#1D4ED8)",
    date: "2026-03-04",
    readTime: 11,
    accent: "#2563EB",
    bg: "linear-gradient(135deg, #1F8A5B 0%, #16766F 100%)",
  },
  {
    id: "p4",
    category: "interview",
    author: "Khang Lê",
    authorInitial: "K",
    authorColor: "linear-gradient(135deg,#7C3AED,#5B21B6)",
    date: "2026-02-28",
    readTime: 12,
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #5B21B6 0%, #1E1B4B 100%)",
  },
  {
    id: "p5",
    category: "career",
    author: "Tâm Đặng",
    authorInitial: "T",
    authorColor: "linear-gradient(135deg,#0EA5E9,#0369A1)",
    date: "2026-02-22",
    readTime: 8,
    accent: "#0EA5E9",
    bg: "linear-gradient(135deg, #0EA5E9 0%, #0C4A6E 100%)",
  },
  {
    id: "p6",
    category: "async",
    author: "Phương Vũ",
    authorInitial: "P",
    authorColor: "linear-gradient(135deg,#65A30D,#3F6212)",
    date: "2026-02-18",
    readTime: 5,
    accent: "#65A30D",
    bg: "linear-gradient(135deg, #65A30D 0%, #1A2E05 100%)",
  },
  {
    id: "p7",
    category: "salary",
    author: "Quân Lý",
    authorInitial: "Q",
    authorColor: "linear-gradient(135deg,#DC2626,#7F1D1D)",
    date: "2026-02-14",
    readTime: 14,
    accent: "#DC2626",
    bg: "linear-gradient(135deg, #DC2626 0%, #450A0A 100%)",
  },
  {
    id: "p8",
    category: "tools",
    author: "Sương Bùi",
    authorInitial: "S",
    authorColor: "linear-gradient(135deg,#16766F,#134E4A)",
    date: "2026-02-09",
    readTime: 7,
    accent: "#16766F",
    bg: "linear-gradient(135deg, #16766F 0%, #042F2E 100%)",
  },
];

const POPULAR = ["popular.1", "popular.2", "popular.3", "popular.4"];

// Stable category codes — the label is looked up at render, never stored in state
const CATEGORIES = [
  "all",
  "negotiation",
  "salary",
  "async",
  "interview",
  "career",
  "tools",
];

export const BlogPage = () => {
  const { t, formatDate } = useTranslation("blog");
  useDocumentTitle(t("docTitle"));
  const [activeCat, setActiveCat] = useState("all");
  const postDate = (iso: string) =>
    formatDate(iso, { year: "numeric", month: "short", day: "2-digit" });

  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const rest = POSTS.filter((p) => !p.featured);
  const filtered =
    activeCat === "all" ? rest : rest.filter((p) => p.category === activeCat);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-100 bg-white py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-white px-3 py-1.5 text-[13px] text-neutral-500 shadow-[0_1px_2px_rgba(26,25,23,0.06)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-600" />
            {t("badge")}
          </div>
          <h1 className="mb-3 max-w-2xl text-[44px] font-semibold leading-[1.1] tracking-tight text-neutral-900 lg:text-[52px]">
            {t("heroTitle")}
            <em className="font-serif-italic text-brand-700">
              {t("heroTitleEm")}
            </em>
            {t("heroTitleEnd")}
          </h1>
          <p className="mb-10 max-w-xl text-[17px] leading-relaxed text-neutral-500">
            {t("heroDesc")}
          </p>

          {/* Featured */}
          <article className="grid grid-cols-1 gap-8 overflow-hidden rounded-20 border border-neutral-100 bg-white shadow-card transition-shadow hover:shadow-[0_4px_24px_rgba(26,25,23,0.10)] lg:grid-cols-[420px_1fr]">
            <div className="overflow-hidden rounded-l-20">
              <div
                className="h-full min-h-[260px] w-full"
                style={{
                  background: featured.bg,
                  aspectRatio: "4/3",
                }}
              />
            </div>
            <div className="flex flex-col justify-center p-8">
              <div className="mb-3 flex items-center gap-2 text-[13px] text-neutral-400">
                <span
                  className="font-semibold"
                  style={{ color: featured.accent }}
                >
                  {t(`cat.${featured.category}`)}
                </span>
                <span>·</span>
                <span>{postDate(featured.date)}</span>
                <span>·</span>
                <span>{t("readTime", { n: featured.readTime })}</span>
              </div>
              <h2 className="mb-3 text-[22px] font-semibold leading-snug text-neutral-900">
                {t(`posts.${featured.id}.title`)}
              </h2>
              <p className="mb-6 text-[14px] leading-relaxed text-neutral-500">
                {t(`posts.${featured.id}.excerpt`)}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: featured.authorColor }}
                >
                  {featured.authorInitial}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">
                    {featured.author}
                  </div>
                  <div className="text-[12px] text-neutral-400">
                    {t("authorTagline")}
                  </div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-brand-600">
                  {t("readEssay")} <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Archive */}
      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow className="mb-1">{t("recent")}</Eyebrow>
              <h2 className="text-[28px] font-semibold text-neutral-900">
                {t("archiveTitle")}
                <em className="font-serif-italic text-brand-700">
                  {t("archiveTitleEm")}
                </em>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <PillToggle
                  active={activeCat === c}
                  activeClassName="bg-brand-600 text-white"
                  className="px-3.5 py-1.5 text-[13px] font-medium transition-all"
                  inactiveClassName="border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  key={c}
                  onClick={() => setActiveCat(c)}
                >
                  {t(`cat.${c}`)}
                </PillToggle>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
            {/* Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {filtered.map((p) => (
                <article
                  className="group overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card transition-shadow hover:shadow-[0_4px_20px_rgba(26,25,23,0.08)]"
                  key={p.id}
                >
                  <div
                    className="h-40 w-full"
                    style={{ background: p.bg, aspectRatio: "16/10" }}
                  />
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-neutral-400">
                      <span
                        className="font-semibold"
                        style={{ color: p.accent }}
                      >
                        {t(`cat.${p.category}`)}
                      </span>
                      <span>·</span>
                      <span>{t("readTimeShort", { n: p.readTime })}</span>
                    </div>
                    <h3 className="mb-2 text-[15px] font-semibold leading-snug text-neutral-900">
                      {t(`posts.${p.id}.title`)}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
                      {t(`posts.${p.id}.excerpt`)}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                        style={{ background: p.authorColor }}
                      >
                        {p.authorInitial}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-semibold text-neutral-900">
                          {p.author}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {postDate(p.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Aside */}
            <aside className="space-y-5">
              <div className="rounded-16 border border-neutral-100 bg-white p-5">
                <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-neutral-400">
                  {t("mostRead")}
                </h4>
                <ol className="space-y-4">
                  {POPULAR.map((key, i) => (
                    <li className="flex items-start gap-3" key={key}>
                      <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-brand-600">
                        0{i + 1}
                      </span>
                      <span className="text-[13px] leading-snug text-neutral-700">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-16 border border-brand-100 bg-brand-50 p-5">
                <h4 className="mb-1 text-[15px] font-semibold text-neutral-900">
                  {t("inboxTitle")}
                </h4>
                <p className="mb-4 text-[13px] text-neutral-500">
                  {t("inboxDesc")}
                </p>
                <NewsletterForm
                  placeholder={t("inboxPlaceholder")}
                  variant="compact"
                />
                <p className="mt-3 text-[11px] text-neutral-400">
                  {t("inboxFine")}
                </p>
              </div>

              <div className="rounded-16 border border-neutral-100 bg-white p-5">
                <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-neutral-400">
                  {t("writeTitle")}
                </h4>
                <p className="mb-3 text-[13px] leading-relaxed text-neutral-600">
                  {t("writeDesc")}
                </p>
                <a
                  className="inline-flex items-center gap-1 rounded-8 text-[13px] font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  {t("pitch")} <ArrowUpRight size={12} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter footer */}
      <section className="border-t border-neutral-100 bg-white py-16">
        <div className="mx-auto max-w-[640px] px-6 text-center">
          <h2 className="mb-3 text-[32px] font-semibold text-neutral-900">
            {t("nlTitle")}
            <em className="font-serif-italic text-brand-700">
              {t("nlTitleEm")}
            </em>
            {t("nlTitleEnd")}
          </h2>
          <p className="mb-8 text-[15px] leading-relaxed text-neutral-500">
            {t("nlDesc")}
          </p>
          <NewsletterForm placeholder={t("inboxPlaceholder")} variant="wide" />
          <p className="mt-4 text-[12px] text-neutral-400">{t("nlFine")}</p>
        </div>
      </section>
    </>
  );
};
