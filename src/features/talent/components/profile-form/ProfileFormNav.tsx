import { cn } from "@/utils/cn";
import { useActiveSection } from "@/hooks/useActiveSection";
import { PROF_SECTIONS } from "@/features/talent/components/profile-form/profile-form.constants";

const SECTION_IDS = PROF_SECTIONS.map((s) => s.id);

// Scroll-spy state lives here, not in ProfileForm: it's only ever read/written
// by this nav, and ProfileForm's other sections (Basics/About/Experience/...)
// aren't memoized — every IntersectionObserver tick used to re-render the whole
// form for state none of those sections care about.
export const ProfileFormNav = () => {
  const [activeSection, setActiveSection] = useActiveSection(SECTION_IDS);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-0.5">
        {PROF_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-10 px-3 py-2 text-[13px] transition-all",
                activeSection === s.id
                  ? "bg-white font-medium text-neutral-900 shadow-chip"
                  : "text-neutral-500 hover:bg-white/60 hover:text-neutral-700"
              )}
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
            >
              <span className="flex items-center gap-2">
                <Icon size={13} />
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
