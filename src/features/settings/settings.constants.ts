import {
  AlertTriangle,
  Bell,
  Lock,
  Share2,
  ShieldCheck,
  User,
} from "lucide-react";

export const SET_SECTIONS = [
  { id: "account", labelKey: "settings.nav.account", icon: User },
  { id: "security", labelKey: "settings.nav.security", icon: Lock },
  { id: "connected", labelKey: "settings.nav.connected", icon: Share2 },
  {
    id: "notifications",
    labelKey: "settings.nav.notifications",
    icon: Bell,
  },
  { id: "data", labelKey: "settings.nav.data", icon: ShieldCheck },
  { id: "danger", labelKey: "settings.nav.danger", icon: AlertTriangle },
] as const;
