import { cn } from "@/utils/cn";
import { companyColor } from "@/utils/color";

interface CompanyLogoProps {
  /** Company name — the logo derives its initial and brand color from this. */
  name: string;
  /** Overrides the name-derived color (e.g. admin's status-tinted palette). */
  color?: string;
  size?: number;
  className?: string;
}

const LARGE_LOGO_SIZE = 56;
const MEDIUM_LOGO_SIZE = 40;
const LARGE_RADIUS = 14;
const MEDIUM_RADIUS = 10;
const SMALL_RADIUS = 8;
const FONT_SIZE_RATIO = 0.4;

const getLogoRadius = (size: number): number => {
  if (size >= LARGE_LOGO_SIZE) return LARGE_RADIUS;
  if (size >= MEDIUM_LOGO_SIZE) return MEDIUM_RADIUS;
  return SMALL_RADIUS;
};

export const CompanyLogo = ({
  name,
  color,
  size = 44,
  className,
}: CompanyLogoProps) => (
  // Every usage renders the full company name as adjacent visible text, so this
  // is purely decorative — without aria-hidden, a screen reader announces a
  // stray single letter right before the real name.
  <div
    aria-hidden="true"
    className={cn(
      "grid flex-shrink-0 place-items-center font-semibold text-white",
      className
    )}
    style={{
      width: size,
      height: size,
      background: color ?? companyColor(name),
      borderRadius: getLogoRadius(size),
      fontSize: size * FONT_SIZE_RATIO,
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
      letterSpacing: "-0.02em",
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);
