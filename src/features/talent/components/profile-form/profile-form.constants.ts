import {
  Asterisk,
  Briefcase,
  Code2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";

export const PROF_SECTIONS = [
  { id: "basics", label: "Basics", icon: User },
  { id: "about", label: "About you", icon: Asterisk },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "prefs", label: "Preferences", icon: SlidersHorizontal },
  { id: "links", label: "Links & CV", icon: Share2 },
  { id: "visibility", label: "Visibility", icon: ShieldCheck },
];
