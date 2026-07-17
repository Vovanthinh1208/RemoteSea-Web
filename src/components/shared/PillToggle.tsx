import { cn } from "@/utils/cn";

interface PillToggleProps {
  active: boolean;
  activeClassName: string;
  inactiveClassName: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

export const PillToggle = ({
  active,
  activeClassName,
  inactiveClassName,
  className,
  onClick,
  children,
}: PillToggleProps) => (
  <button
    aria-pressed={active}
    className={cn(
      "rounded-full focus-visible:shadow-focus focus-visible:outline-none",
      className,
      active ? activeClassName : inactiveClassName
    )}
    type="button"
    onClick={onClick}
  >
    {children}
  </button>
);
