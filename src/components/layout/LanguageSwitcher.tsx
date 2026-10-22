import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Check, Globe } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import type { SupportedLocale } from "@/i18n/types";

interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile" | "settings";
  className?: string;
}

const LANGUAGES: { code: SupportedLocale; label: string; sub: string }[] = [
  { code: "en", label: "English", sub: "EN" },
  { code: "vi", label: "Tiếng Việt", sub: "VI" },
];

export const LanguageSwitcher = ({
  variant = "desktop",
  className,
}: LanguageSwitcherProps) => {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Opening moves focus to the selected language, as a listbox expects.
  useEffect(() => {
    if (!isOpen) return;
    const selected = LANGUAGES.findIndex((lang) => lang.code === locale);
    optionRefs.current[Math.max(selected, 0)]?.focus();
    // Only on open; arrow keys move focus afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The account preference is updated by I18nAccountSync, which also covers a
  // language picked while signed out.
  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    close(true);
  };

  const handleListKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = optionRefs.current.filter(
      (el): el is HTMLButtonElement => el !== null
    );
    const current = options.indexOf(
      document.activeElement as HTMLButtonElement
    );
    const focusAt = (i: number) =>
      options[(i + options.length) % options.length]?.focus();
    if (e.key === "ArrowDown") focusAt(current + 1);
    else if (e.key === "ArrowUp") focusAt(current - 1);
    else if (e.key === "Home") focusAt(0);
    else if (e.key === "End") focusAt(options.length - 1);
    else if (e.key === "Tab") {
      setIsOpen(false);
      return;
    } else return;
    e.preventDefault();
  };

  const currentLang =
    LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  if (variant === "mobile") {
    return (
      <div className={cn("flex flex-col gap-1.5 py-1", className)}>
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {t("language.label")}
        </span>
        <div className="flex gap-2 px-3">
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                aria-pressed={isSelected}
                lang={lang.code}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-8 py-2 text-sm font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                  isSelected
                    ? "border border-brand-200 bg-brand-50 text-brand-700 shadow-chip"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                )}
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
              >
                {isSelected && <Check size={14} />}
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative inline-block text-left", className)}
      ref={containerRef}
    >
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("language.switchPrompt")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-8 px-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none",
          isOpen && "bg-neutral-100 text-neutral-900"
        )}
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <Globe className="text-neutral-500" size={16} />
        <span className="hidden sm:inline">{currentLang.label}</span>
        <span className="text-xs uppercase text-neutral-400 sm:hidden">
          {currentLang.sub}
        </span>
      </button>

      {isOpen && (
        <div
          aria-label={t("language.label")}
          className="animate-in fade-in zoom-in-95 shadow-popover absolute right-0 top-full z-50 mt-1.5 w-40 rounded-12 border border-neutral-200 bg-white p-1.5"
          id={listboxId}
          role="listbox"
          onKeyDown={handleListKeyDown}
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = locale === lang.code;
            return (
              <button
                aria-selected={isSelected}
                lang={lang.code}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-8 px-3 py-2 text-left text-sm transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                  isSelected
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                key={lang.code}
                role="option"
                type="button"
                onClick={() => handleSelect(lang.code)}
              >
                <span>{lang.label}</span>
                {isSelected && <Check className="text-brand-600" size={15} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
