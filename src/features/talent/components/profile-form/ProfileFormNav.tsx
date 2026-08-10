import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Eye, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useMyTalentProfile } from "@/features/talent/talent.queries";
import { PROF_SECTIONS } from "@/features/talent/components/profile-form/profile-form.constants";
import { ROUTES } from "@/constants/routes";

const SECTION_IDS = PROF_SECTIONS.map((s) => s.id);

// Scroll-spy state lives here, not in ProfileForm: it's only ever read/written
// by this nav, and ProfileForm's other sections (Basics/About/Experience/...)
// aren't memoized — every IntersectionObserver tick used to re-render the whole
// form for state none of those sections care about.
export const ProfileFormNav = () => {
  const [activeSection, setActiveSection] = useActiveSection(SECTION_IDS);
  // Cache-shared with ProfileForm's own useMyTalentProfile() call — React
  // Query dedupes it, so this doesn't cost a second request.
  const { data: profile } = useMyTalentProfile();

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full",
                  s.done
                    ? "bg-brand-100 text-brand-700"
                    : "bg-neutral-100 text-neutral-400"
                )}
              >
                {s.done ? <Check size={9} /> : <Minus size={9} />}
              </span>
            </button>
          );
        })}
        <div className="my-2 border-t border-neutral-200" />
        {profile ? (
          <Link
            className="flex w-full items-center justify-between rounded-10 px-3 py-2 text-[13px] text-neutral-500 hover:bg-white/60 hover:text-neutral-700"
            target="_blank"
            to={{
              pathname: ROUTES.talentProfile(profile.slug),
              search: "?preview=recruiter",
            }}
          >
            <span className="flex items-center gap-2">
              <Eye size={13} />
              Preview as recruiter
            </span>
            <ArrowUpRight size={11} />
          </Link>
        ) : (
          <span
            className="flex w-full cursor-not-allowed items-center justify-between rounded-10 px-3 py-2 text-[13px] text-neutral-300"
            title="Save your profile first"
          >
            <span className="flex items-center gap-2">
              <Eye size={13} />
              Preview as recruiter
            </span>
            <ArrowUpRight size={11} />
          </span>
        )}
      </div>
    </aside>
  );
};
