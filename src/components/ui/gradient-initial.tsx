import { cn } from "@/utils/cn";

interface GradientInitialProps {
  /** The character(s) to show — callers pass an already-derived initial. */
  children: React.ReactNode;
  /** Size/shape/text-size come from the call site (h-*, w-*, rounded-*, text-*). */
  className?: string;
}

/**
 * The brand-gradient initial tile (company/person avatar fallback) — this
 * gradient + centered white initial combo was hand-rolled in five places
 * (employer dashboard chip, company card, profile snapshot, and two marketing
 * sections) with only size/shape differing.
 */
export const GradientInitial = ({
  children,
  className,
}: GradientInitialProps) => (
  <div
    aria-hidden="true"
    className={cn(
      "grid flex-shrink-0 place-items-center bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white",
      className
    )}
  >
    {children}
  </div>
);
