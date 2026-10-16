import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/useTranslation";

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
    "h-11 min-w-0 flex-1 rounded-12 border border-neutral-200 bg-white px-4 text-sm outline-none transition-all focus:border-brand-600 focus:shadow-focus",
  compact:
    "h-10 w-full rounded-10 border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-600",
  wide: "h-11 flex-1 rounded-12 border border-neutral-200 bg-white px-4 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-600 sm:max-w-xs",
};

export const NewsletterForm = ({
  variant = "inline",
  placeholder,
}: NewsletterFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("common.newsletter.soonTitle"),
      description: t("common.newsletter.soonDesc"),
    });
  };

  return (
    <form className={FORM_CLASS[variant]} onSubmit={handleSubmit}>
      <input
        aria-label={t("common.newsletter.emailLabel")}
        className={INPUT_CLASS[variant]}
        placeholder={placeholder ?? t("common.newsletter.emailPlaceholder")}
        type="email"
      />
      {variant === "compact" && (
        <Button className="w-full rounded-10" size="md">
          {t("common.newsletter.subscribe")}
        </Button>
      )}
      {variant === "wide" && (
        <Button className="rounded-12 px-6" size="lg">
          {t("common.newsletter.subscribe")} <ArrowRight size={14} />
        </Button>
      )}
      {variant === "inline" && (
        <Button className="shrink-0 rounded-12 px-5" size="lg">
          {t("common.newsletter.subscribe")}
        </Button>
      )}
    </form>
  );
};
