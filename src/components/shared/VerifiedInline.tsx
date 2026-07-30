import { ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";

interface VerifiedInlineProps {
  label?: string;
  iconSize?: number;
  className?: string;
}

/**
 * The inline (no-pill) verified trust mark — third of the app's verified
 * renderings alongside Badge variant="verified" (job cards) and VerifiedBadge
 * (admin pill with an unverified state). Was hand-rolled in three places and
 * had already drifted between brand-600/brand-700 and gap-0.5/gap-1.
 */
export const VerifiedInline = ({
  label = "Verified",
  iconSize = 11,
  className,
}: VerifiedInlineProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-0.5 text-brand-600",
      className
    )}
  >
    <ShieldCheck size={iconSize} /> {label}
  </span>
);
