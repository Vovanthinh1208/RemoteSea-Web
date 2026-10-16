import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

const PREVIEW_JOBS = [
  {
    id: 1,
    company: "Canva · AU",
    color: "#00C4CC",
    initial: "C",
  },
  {
    id: 2,
    company: "Linear · US",
    color: "#5E6AD2",
    initial: "L",
  },
];

export const LoginPage = () => {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("pages.login.docTitle"));

  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-2">
      {/* Left panel */}
      <div className="auth-panel-gradient hidden flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-8 bg-white/10 pb-0.5 font-serif text-xl italic leading-none">
            R
          </span>
          RemoteSEA
        </div>

        <div>
          <p
            className="mb-1 text-[26px] font-light italic text-white/60"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("pages.login.welcomeBack")}
          </p>
          {/* Decorative marketing copy, not document structure — using <p> instead
              of <h2> avoids a heading that appears before the page's real <h1>. */}
          <p className="mb-4 text-[40px] font-semibold leading-tight">
            {t("pages.login.pickUp1")}
            <br />
            {t("pages.login.pickUp2")}
          </p>
          <p className="mb-8 text-sm leading-relaxed text-white/60">
            {t("pages.login.newJobs")}
          </p>

          <div className="mb-6 grid grid-cols-3 gap-4 rounded-16 border border-white/10 bg-white/5 p-5">
            {[
              { v: "12", l: t("pages.login.stat1") },
              { v: "2", l: t("pages.login.stat2") },
              { v: "$3.2k", l: t("pages.login.stat3") },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[22px] font-semibold">{s.v}</div>
                <div className="mt-0.5 whitespace-pre-line text-[11px] leading-tight text-white/50">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {PREVIEW_JOBS.map((j) => (
              <div
                className="flex items-center gap-3 rounded-12 border border-white/10 bg-white/5 p-3"
                key={j.id}
              >
                <div
                  className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 text-xs font-semibold text-white"
                  style={{ background: j.color }}
                >
                  {j.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {t(`pages.login.job${j.id}Title`)}
                  </div>
                  <div className="text-[12px] text-white/50">{j.company}</div>
                </div>
                <span className="whitespace-nowrap rounded-8 bg-amber-400/10 px-2 py-0.5 font-mono text-[11px] text-amber-300">
                  {t(`pages.login.job${j.id}Salary`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30">{t("pages.login.footer")}</p>
      </div>

      {/* Right panel (form) */}
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-8 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-1.5 rounded-8 text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.home}
          >
            <ArrowLeft size={14} /> {t("pages.login.back")}
          </Link>
          <p className="text-sm text-neutral-500">
            {t("pages.login.newHere")}{" "}
            <Link
              className="inline-flex items-center gap-0.5 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.register}
            >
              {t("pages.login.createAccount")} <ArrowRight size={13} />
            </Link>
          </p>
        </div>

        {/* 36px — larger than the app-wide 32px page title; intentional for
            this standalone, hero-like auth screen (matches RegisterPage.tsx). */}
        <h1 className="mb-1 text-[36px] font-semibold tracking-tight text-neutral-900">
          {t("pages.login.title")}
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          {t("pages.login.subtitle")}
        </p>

        <LoginForm />
      </div>
    </div>
  );
};
