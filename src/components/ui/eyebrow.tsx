import { cn } from "@/utils/cn";

interface EyebrowProps {
  children: React.ReactNode;
  /** Margin/positioning per call site (mb-2, text-center, …); twMerge resolves overrides. */
  className?: string;
}

/**
 * The uppercase section eyebrow — the app's signature "OPERATIONS" / "EXPLORER"
 * label above headings. This exact class string was hand-typed at 20+ call
 * sites (with a few drifting to 12/13px or font-medium along the way); the
 * canonical style now lives here.
 */
export const Eyebrow = ({ children, className }: EyebrowProps) => (
  <p
    className={cn(
      "text-[11px] font-semibold uppercase tracking-widest text-neutral-400",
      className
    )}
  >
    {children}
  </p>
);
