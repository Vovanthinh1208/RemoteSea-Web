import { Link } from "react-router-dom";
import { Check } from "lucide-react";

interface SettingsSaveBarProps {
  dashboardRoute: string;
}

// Nothing on this page has a single "save" action (each section persists
// independently, or doesn't persist at all) — this bar is decorative,
// matching the remotesea design reference.
export const SettingsSaveBar = ({ dashboardRoute }: SettingsSaveBarProps) => (
  <div className="sticky bottom-0 flex items-center justify-between rounded-20 border border-neutral-200 bg-white/90 px-5 py-3 shadow-card backdrop-blur-sm">
    <span className="flex items-center gap-2 text-[12.5px] text-neutral-500">
      <span className="h-2 w-2 rounded-full bg-brand-500" />
      All changes saved
      <span className="font-mono text-[11.5px] text-neutral-400">
        · just now
      </span>
    </span>
    <div className="flex items-center gap-2">
      <Link
        className="rounded-10 px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-700"
        to={dashboardRoute}
      >
        Close
      </Link>
      <Link
        className="inline-flex items-center gap-1.5 rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-700"
        to={dashboardRoute}
      >
        Done <Check size={13} />
      </Link>
    </div>
  </div>
);
