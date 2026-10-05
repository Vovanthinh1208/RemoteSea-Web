import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { StickyBottomBar } from "@/components/ui/sticky-bottom-bar";

interface SettingsSaveBarProps {
  dashboardRoute: string;
}

// Nothing on this page has a single "save" action (each section persists
// independently, or doesn't persist at all) — this bar is decorative,
// matching the remotesea design reference.
export const SettingsSaveBar = ({ dashboardRoute }: SettingsSaveBarProps) => (
  <StickyBottomBar
    actions={
      <>
        <Link
          className="rounded-10 px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
          to={dashboardRoute}
        >
          Close
        </Link>
        <Link
          className="inline-flex items-center gap-1.5 rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          to={dashboardRoute}
        >
          Done <Check size={13} />
        </Link>
      </>
    }
    statusText={
      <>
        All changes saved
        <span className="font-mono text-[11.5px] text-neutral-400">
          · just now
        </span>
      </>
    }
  />
);
