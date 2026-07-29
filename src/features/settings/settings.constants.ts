import { AlertTriangle, Bell, Lock, Share2, ShieldCheck, User } from "lucide-react";

export const SET_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "connected", label: "Connected", icon: Share2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Privacy & data", icon: ShieldCheck },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
] as const;
