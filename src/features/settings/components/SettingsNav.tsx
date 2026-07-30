import { Link } from "react-router-dom";
import { Asterisk } from "lucide-react";
import { cn } from "@/utils/cn";
import { useActiveSection } from "@/hooks/useActiveSection";
import { SET_SECTIONS } from "@/features/settings/settings.constants";
import { ROUTES } from "@/constants/routes";

const SECTION_IDS = SET_SECTIONS.map((s) => s.id);

export const SettingsNav = () => {
  const [activeSection, setActiveSection] =
    useActiveSection(SECTION_IDS);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-0.5">
        {SET_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-10 px-3 py-2 text-[13px] transition-all",
                s.id === "danger" && "text-red-600 hover:bg-red-50",
                s.id !== "danger" &&
                  (activeSection === s.id
                    ? "bg-white font-medium text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:bg-white/60 hover:text-neutral-700")
              )}
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
            >
              <Icon size={13} />
              {s.label}
            </button>
          );
        })}
        <div className="my-2 border-t border-neutral-200" />
        <Link
          className="flex w-full items-center gap-2 rounded-10 px-3 py-2 text-[13px] text-neutral-500 hover:bg-white/60 hover:text-neutral-700"
          to={ROUTES.profile}
        >
          <Asterisk size={13} /> Profile setup
        </Link>
      </div>
    </aside>
  );
};
