import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { StickyBottomBar } from "@/components/ui/sticky-bottom-bar";
import { useTranslation } from "@/i18n/useTranslation";

interface SettingsSaveBarProps {
  dashboardRoute: string;
}

// Nothing on this page has a single "save" action (each section persists
// independently, or doesn't persist at all) — this bar is decorative,
// matching the remotesea design reference.
export const SettingsSaveBar = ({ dashboardRoute }: SettingsSaveBarProps) => {
  const { t } = useTranslation("settings");
  return (
    <StickyBottomBar
      actions={
        <>
          <Link
            className="rounded-10 px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
            to={dashboardRoute}
          >
            {t("bar.close")}
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            to={dashboardRoute}
          >
            {t("bar.done")} <Check size={13} />
          </Link>
        </>
      }
      statusText={
        <>
          {t("bar.saved")}
          <span className="font-mono text-[11.5px] text-neutral-400">
            {t("bar.justNow")}
          </span>
        </>
      }
    />
  );
};
