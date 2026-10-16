import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

export const RegisterPage = () => {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("pages.register.docTitle"));

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
          {/* Decorative marketing copy, not document structure — using <p> instead
              of <h2> avoids a heading that appears before the page's real <h1>. */}
          <p className="mb-4 text-[40px] font-semibold leading-tight">
            <span
              className="text-brand-400"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
              }}
            >
              {t("pages.register.talentLead")}
            </span>
            {t("pages.register.headline1")}
            <br />
            {t("pages.register.headline2")}
            <br />
            {t("pages.register.headline3")}
          </p>
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/60">
            {t("pages.register.noSpam")}
          </p>
          <div className="rounded-16 border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-sm italic leading-relaxed text-white/80">
              &ldquo;{t("pages.register.quote")}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold">
                PT
              </div>
              <div>
                <div className="text-sm font-medium">Phạm Tuấn</div>
                <div className="text-[12px] text-white/40">
                  {t("pages.register.quoteRole")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/30">{t("pages.register.footer")}</p>
      </div>

      {/* Right panel */}
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-8 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-1.5 rounded-8 text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.home}
          >
            <ArrowLeft size={14} /> {t("pages.login.back")}
          </Link>
          <p className="text-sm text-neutral-500">
            {t("pages.register.alreadyMember")}{" "}
            <Link
              className="inline-flex items-center gap-0.5 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.login}
            >
              {t("pages.register.signIn")} <ArrowRight size={13} />
            </Link>
          </p>
        </div>

        <div className="mb-8 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
            1
          </span>
          <span className="text-sm text-neutral-400">
            {t("pages.register.stepOf")}
          </span>
          <div className="mx-2 h-1.5 flex-1 rounded-full bg-neutral-100">
            <div className="h-full w-1/2 rounded-full bg-brand-600" />
          </div>
          <span className="text-[12px] text-neutral-400">
            {t("pages.register.stepLabel")}
          </span>
        </div>

        {/* 36px — larger than the app-wide 32px page title; intentional for
            this standalone, hero-like auth screen (matches LoginPage.tsx). */}
        <h1 className="mb-1 text-[36px] font-semibold tracking-tight text-neutral-900">
          {t("pages.register.title")}
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          {t("pages.register.subtitle")}
        </p>

        <RegisterForm />
      </div>
    </div>
  );
};
