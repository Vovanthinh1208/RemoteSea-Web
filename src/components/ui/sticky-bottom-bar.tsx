import * as React from "react";
import { cn } from "@/utils/cn";

export interface StickyBottomBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  statusText?: React.ReactNode;
  isSaving?: boolean;
  statusDotColor?: string;
  actions?: React.ReactNode;
}

export const StickyBottomBar = React.forwardRef<
  HTMLDivElement,
  StickyBottomBarProps
>(
  (
    {
      className,
      statusText,
      isSaving = false,
      statusDotColor = "bg-brand-500",
      actions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "sticky bottom-0 z-20 flex items-center justify-between gap-4 rounded-20 border border-neutral-200 bg-white/90 px-5 py-3 shadow-card backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {statusText ? (
          <div className="flex items-center gap-2 text-[12.5px] text-neutral-500">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                statusDotColor,
                isSaving && "animate-pulse"
              )}
            />
            {statusText}
          </div>
        ) : (
          <div />
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {children}
      </div>
    );
  }
);

StickyBottomBar.displayName = "StickyBottomBar";
