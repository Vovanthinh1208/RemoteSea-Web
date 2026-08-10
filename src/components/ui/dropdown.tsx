import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  "aria-label"?: string;
  /** Overrides the trigger's own label — e.g. to render "Sort by: Most recent". */
  renderValue?: (option: DropdownOption | undefined) => React.ReactNode;
  className?: string;
  panelClassName?: string;
}

/**
 * A listbox-pattern replacement for native <select> for the few spots where
 * the OS-rendered option panel (unstyleable, inconsistent across
 * browsers/platforms) would visibly clash with the rest of the design system
 * — e.g. a compact toolbar control sitting next to custom buttons/badges.
 * Native <select>s elsewhere in the app (long option lists, real form
 * fields) intentionally keep the browser picker for its accessibility and
 * mobile ergonomics; reach for this only where that OS chrome is the
 * problem, not as a blanket <select> replacement.
 */
export const Dropdown = ({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  renderValue,
  className,
  panelClassName,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
    // Only on open — activeIndex changes afterward come from keyboard nav,
    // which already keeps itself in view via the browser's default scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const openDropdown = () => {
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((o) => o.value === value)
      )
    );
    setOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      openDropdown();
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(activeIndex);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-block", className)} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-10 border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 outline-none transition-all hover:border-neutral-300 focus:border-brand-600 focus:shadow-focus",
          open && "border-brand-600 shadow-focus"
        )}
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={onTriggerKeyDown}
      >
        {renderValue ? renderValue(selected) : (selected?.label ?? "")}
        <ChevronDown
          className={cn(
            "text-neutral-400 transition-transform duration-150",
            open && "rotate-180"
          )}
          size={14}
          strokeWidth={2.25}
        />
      </button>

      {open && (
        <ul
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          aria-label={ariaLabel}
          autoFocus
          className={cn(
            "absolute right-0 top-[calc(100%+6px)] z-30 min-w-[180px] animate-fade-up rounded-12 border border-neutral-200 bg-white p-1 shadow-card-lg",
            panelClassName
          )}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                aria-selected={isSelected}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-8 px-2.5 py-1.5 text-[13px] transition-colors",
                  isSelected
                    ? "font-medium text-brand-700"
                    : "text-neutral-700",
                  isActive && "bg-neutral-50"
                )}
                data-index={index}
                id={`${listboxId}-${index}`}
                key={option.value}
                role="option"
                onClick={() => commit(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option.label}
                {isSelected && (
                  <Check
                    className="text-brand-600"
                    size={14}
                    strokeWidth={2.5}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
