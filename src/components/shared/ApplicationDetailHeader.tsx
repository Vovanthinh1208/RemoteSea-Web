import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";

interface ApplicationDetailHeaderProps {
  backHref: string;
  title: string;
  subtitle?: string | null;
  className?: string;
}

// Shared by every per-application detail page (messages, interviews, ...) —
// same back-link/title/subtitle block, previously duplicated byte-for-byte
// between MessageThreadPage and InterviewPage.
export const ApplicationDetailHeader = ({
  backHref,
  title,
  subtitle,
  className,
}: ApplicationDetailHeaderProps) => (
  <div className={cn("flex items-center gap-3", className)}>
    <Link
      aria-label="Back"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      to={backHref}
    >
      <ArrowLeft size={17} />
    </Link>
    <div className="min-w-0">
      <h1 className="truncate text-[17px] font-semibold text-neutral-900">
        {title}
      </h1>
      {subtitle && (
        <p className="truncate text-[12.5px] text-neutral-400">{subtitle}</p>
      )}
    </div>
  </div>
);
