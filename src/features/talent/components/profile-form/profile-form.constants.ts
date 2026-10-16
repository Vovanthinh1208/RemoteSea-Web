import {
  Asterisk,
  Briefcase,
  Code2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  User,
} from "lucide-react";

// `done` is illustrative, same as the source — none of these are computed
// from real profile completeness.
export const PROF_SECTIONS = [
  { id: "basics", labelKey: "talent.nav.basics", done: true, icon: User },
  { id: "about", labelKey: "talent.nav.about", done: true, icon: Asterisk },
  {
    id: "experience",
    labelKey: "talent.nav.experience",
    done: false,
    icon: Briefcase,
  },
  { id: "skills", labelKey: "talent.nav.skills", done: true, icon: Code2 },
  {
    id: "prefs",
    labelKey: "talent.nav.prefs",
    done: false,
    icon: SlidersHorizontal,
  },
  { id: "links", labelKey: "talent.nav.links", done: false, icon: Share2 },
  {
    id: "highlights",
    labelKey: "talent.nav.highlights",
    done: false,
    icon: Sparkles,
  },
  {
    id: "visibility",
    labelKey: "talent.nav.visibility",
    done: true,
    icon: ShieldCheck,
  },
];
