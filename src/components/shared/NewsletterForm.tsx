import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type NewsletterFormVariant = "inline" | "compact" | "wide";

interface NewsletterFormProps {
  /**
   * inline — single row, home hero (max-w-sm, centered).
   * compact — stacked, full-width button, for a narrow sidebar card.
   * wide — row on sm+/stacked below, larger button with a trailing arrow,
   * for a full-width footer CTA.
   */
  variant?: NewsletterFormVariant;
  placeholder?: string;
}

const FORM_CLASS: Record<NewsletterFormVariant, string> = {
  inline: "mx-auto flex max-w-sm items-center gap-2",
  compact: "space-y-2",
  wide: "flex flex-col gap-3 sm:flex-row sm:justify-center",
};

const INPUT_CLASS: Record<NewsletterFormVariant, string> = {
  inline:
    "h-11 flex-1 rounded-12 border border-neutral-200 bg-white px-4 text-sm outline-none transition-all focus:border-brand-600 focus:shadow-focus",
  compact:
    "h-10 w-full rounded-10 border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-600",
  wide: "h-11 flex-1 rounded-12 border border-neutral-200 bg-white px-4 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-600 sm:max-w-xs",
};

export const NewsletterForm = ({
  variant = "inline",
  placeholder = "your@email.com",
}: NewsletterFormProps) => (
  <form className={FORM_CLASS[variant]} onSubmit={(e) => e.preventDefault()}>
    <input
      aria-label="Email address"
      className={INPUT_CLASS[variant]}
      placeholder={placeholder}
      type="email"
    />
    {variant === "compact" && (
      <Button className="w-full rounded-10" size="md">
        Subscribe
      </Button>
    )}
    {variant === "wide" && (
      <Button className="rounded-12 px-6" size="lg">
        Subscribe <ArrowRight size={14} />
      </Button>
    )}
    {variant === "inline" && (
      <Button className="rounded-12 px-5" size="lg">
        Subscribe
      </Button>
    )}
  </form>
);
