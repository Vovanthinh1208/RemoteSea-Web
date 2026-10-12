import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

export const Footer = () => {
  const { t, locale } = useTranslation();

  const footerCols = [
    {
      heading: locale === "vi" ? "Nền tảng" : "Platform",
      links: [
        { label: t("nav.jobs"), href: "/jobs" },
        {
          label: locale === "vi" ? "Cẩm nang lương" : "Salary guide",
          href: "/salary",
        },
        { label: t("nav.forEmployers"), href: "/employer" },
        {
          label: locale === "vi" ? "Bản tin việc làm" : "Newsletter",
          href: "/newsletter",
        },
      ],
    },
    {
      heading: t("footer.resources"),
      links: [
        {
          label: locale === "vi" ? "Cẩm nang làm từ xa" : "Remote work guide",
          href: "#",
        },
        { label: locale === "vi" ? "Mẫu CV chuẩn" : "CV templates", href: "#" },
        {
          label: locale === "vi" ? "Kinh nghiệm phỏng vấn" : "Interview prep",
          href: "#",
        },
        { label: t("nav.community"), href: "/community" },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: locale === "vi" ? "Giới thiệu" : "About", href: "#" },
        {
          label: locale === "vi" ? "Câu chuyện sáng lập" : "Founder story",
          href: "#",
        },
        {
          label: locale === "vi" ? "Liên hệ" : "Contact",
          href: "mailto:hello@remotesea.io",
        },
        { label: locale === "vi" ? "Báo chí" : "Press", href: "#" },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "#" },
        { label: t("footer.terms"), href: "#" },
        { label: "Cookies", href: "#" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-neutral-100 bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-neutral-900">
              <span
                className="grid h-[26px] w-[26px] place-items-center rounded-8 pb-0.5 font-serif text-lg italic leading-none text-white"
                style={{
                  background: "linear-gradient(140deg, #2E9B52, #1F7A3D)",
                }}
              >
                R
              </span>
              RemoteSEA
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-neutral-500">
              {locale === "vi"
                ? "Việc làm remote từ Singapore, Úc và toàn cầu — tuyển chọn cho nhân sự Việt Nam."
                : "Remote jobs from Singapore, Australia & beyond — curated for Vietnam talent."}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="font-medium uppercase tracking-widest">
                {locale === "vi" ? "Phát triển tại" : "Made in"}
              </span>
              <span>Đà Nẵng, Việt Nam 🇻🇳</span>
            </div>
          </div>

          {/* Columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {col.heading}
              </h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      to={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 text-xs text-neutral-400">
          <span>© 2026 RemoteSEA · {t("footer.rightsReserved")}</span>
          <span>
            {locale === "vi"
              ? "Xây dựng bởi người làm việc từ xa, vì cộng đồng làm việc từ xa."
              : "Built by a remote worker, for remote workers."}
          </span>
        </div>
      </div>
    </footer>
  );
};
