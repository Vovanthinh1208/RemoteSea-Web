import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

export const Footer = () => {
  const { t } = useTranslation();

  const footerCols = [
    {
      heading: t("footer.platform"),
      links: [
        { label: t("nav.jobs"), href: "/jobs" },
        {
          label: t("footer.salaryGuide"),
          href: "/salary",
        },
        { label: t("nav.forEmployers"), href: "/employer" },
        {
          label: t("footer.newsletter"),
          href: "/newsletter",
        },
      ],
    },
    {
      heading: t("footer.resources"),
      links: [
        {
          label: t("footer.remoteGuide"),
          href: "#",
        },
        { label: t("footer.cvTemplates"), href: "#" },
        {
          label: t("footer.interviewPrep"),
          href: "#",
        },
        { label: t("nav.community"), href: "/community" },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "#" },
        {
          label: t("footer.founderStory"),
          href: "#",
        },
        {
          label: t("footer.contact"),
          href: "mailto:hello@remotesea.io",
        },
        { label: t("footer.press"), href: "#" },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "#" },
        { label: t("footer.terms"), href: "#" },
        { label: t("footer.cookies"), href: "#" },
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
              {t("footer.description")}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="font-medium uppercase tracking-widest">
                {t("footer.madeIn")}
              </span>
              <span>{t("footer.location")}</span>
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
          <span>{t("footer.builtBy")}</span>
        </div>
      </div>
    </footer>
  );
};
