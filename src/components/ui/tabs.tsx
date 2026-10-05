import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Tabs Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  variant: "segmented" | "pills" | "line";
  size: "sm" | "md";
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "segmented",
  size: "sm",
});

export const useTabs = () => React.useContext(TabsContext);

// ---------------------------------------------------------------------------
// Tabs Root
// ---------------------------------------------------------------------------

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "segmented" | "pills" | "line";
  size?: "sm" | "md";
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = "segmented",
      size = "sm",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (val: string) => {
        if (!isControlled) setUncontrolledValue(val);
        onValueChange?.(val);
      },
      [isControlled, onValueChange]
    );

    const contextValue = React.useMemo<TabsContextValue>(
      () => ({ value, onValueChange: handleValueChange, variant, size }),
      [value, handleValueChange, variant, size]
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={cn("min-w-0", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

// ---------------------------------------------------------------------------
// TabList
// ---------------------------------------------------------------------------

const tabListVariants = cva("flex items-center", {
  variants: {
    variant: {
      segmented: "rounded-8 bg-neutral-100 p-0.5 gap-0.5",
      pills: "gap-2 overflow-x-auto pb-1 scrollbar-thin",
      line: "border-b border-neutral-100 gap-6",
    },
  },
  defaultVariants: {
    variant: "segmented",
  },
});

export interface TabListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabListVariants> {}

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ className, ...props }, ref) => {
    const { variant } = useTabs();
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(tabListVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
TabList.displayName = "TabList";

// ---------------------------------------------------------------------------
// Tab (Trigger)
// ---------------------------------------------------------------------------

export interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  count?: number | string;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, value, count, children, onClick, ...props }, ref) => {
    const { value: activeValue, onValueChange, variant, size } = useTabs();
    const isActive = activeValue === value;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onValueChange?.(value);
    };

    let style = "";
    if (variant === "segmented") {
      style = cn(
        "rounded-8 transition-all focus-visible:shadow-focus focus-visible:outline-none whitespace-nowrap",
        size === "sm" ? "px-3 py-1 text-[12px] font-medium" : "px-3.5 py-1.5 text-[13px] font-medium",
        isActive
          ? "bg-white text-neutral-900 shadow-chip"
          : "text-neutral-500 hover:text-neutral-700"
      );
    } else if (variant === "pills") {
      style = cn(
        "rounded-full transition-colors focus-visible:shadow-focus focus-visible:outline-none whitespace-nowrap flex-shrink-0 font-medium",
        size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-3.5 py-2 text-[13px]",
        isActive
          ? "bg-brand-600 text-white"
          : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
      );
    } else if (variant === "line") {
      style = cn(
        "pb-3 font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none whitespace-nowrap",
        size === "sm" ? "text-[13px]" : "text-[14px]",
        isActive
          ? "border-b-2 border-brand-600 text-neutral-900 font-semibold"
          : "text-neutral-500 hover:text-neutral-700"
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        className={cn(style, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
        {count !== undefined && (
          <span
            className={cn(
              "ml-1 tabular-nums text-[11px]",
              isActive && variant === "pills" ? "text-white/80" : "text-neutral-400"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
Tab.displayName = "Tab";

// ---------------------------------------------------------------------------
// TabPanel
// ---------------------------------------------------------------------------

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue } = useTabs();
    if (activeValue !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn("outline-none", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabPanel.displayName = "TabPanel";
