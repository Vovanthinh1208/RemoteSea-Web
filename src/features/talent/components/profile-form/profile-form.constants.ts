import {
  Asterisk,
  Briefcase,
  Code2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";

// `done` is illustrative, same as the source — none of these are computed
// from real profile completeness.
export const PROF_SECTIONS = [
  { id: "basics", label: "Basics", done: true, icon: User },
  { id: "about", label: "About you", done: true, icon: Asterisk },
  {
    id: "experience",
    label: "Experience",
    done: false,
    icon: Briefcase,
  },
  { id: "skills", label: "Skills", done: true, icon: Code2 },
  {
    id: "prefs",
    label: "Preferences",
    done: false,
    icon: SlidersHorizontal,
  },
  { id: "links", label: "Links & CV", done: false, icon: Share2 },
  {
    id: "visibility",
    label: "Visibility",
    done: true,
    icon: ShieldCheck,
  },
];
