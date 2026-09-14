import { cn } from "@/utils/cn";

interface EmptyRowProps {
  children: React.ReactNode;
  /** Horizontal inset only — each list's empty row typically needs to match
   *  its own sibling rows' side padding (a notification panel's px-4 vs. a
   *  wider table's px-5, say), which genuinely varies by container. The
   *  vertical rhythm/centering/size below are the part that shouldn't. */
  className?: string;
}

export const EmptyRow = ({ children, className }: EmptyRowProps) => (
  <p className={cn("py-8 text-center text-[13px] text-neutral-400", className)}>
    {children}
  </p>
);
