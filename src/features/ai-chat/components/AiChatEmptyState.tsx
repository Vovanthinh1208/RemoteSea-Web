import { ArrowRight, MessageCircleQuestion, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export interface AiChatEmptyStateProps {
  firstName?: string;
  isPending: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export const AiChatEmptyState = ({
  firstName,
  isPending,
  onSelectPrompt,
}: AiChatEmptyStateProps) => {
  const { t } = useTranslation("ai");

  const suggestedPrompts = [
    t("chat.suggested1"),
    t("chat.suggested2"),
    t("chat.suggested3"),
  ];

  return (
    <div className="flex h-full animate-fade-up flex-col items-center justify-center gap-5 py-6 text-center">
      <div className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-[-14px] -z-10 animate-pulse rounded-full bg-brand-300/30 blur-xl" />
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card ring-8 ring-brand-50">
          <Sparkles size={22} />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[16px] font-semibold text-neutral-900">
          {t("chat.greeting", { name: firstName ? `, ${firstName}` : "" })}
        </p>
        <p className="mx-auto max-w-[280px] text-[13.5px] leading-relaxed text-neutral-500">
          {t("chat.subtitle")}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {suggestedPrompts.map((prompt, i) => (
          <button
            className="group flex animate-fade-up items-center gap-2.5 rounded-12 border border-neutral-200 bg-white px-3.5 py-2.5 text-left text-[13px] text-neutral-700 shadow-chip transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-card focus-visible:shadow-focus focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
            disabled={isPending}
            key={prompt}
            style={{ animationDelay: `${i * 60 + 80}ms` }}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
          >
            <MessageCircleQuestion
              className="flex-shrink-0 text-brand-500"
              size={15}
            />
            <span className="flex-1">{prompt}</span>
            <ArrowRight
              className="flex-shrink-0 text-neutral-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500 group-hover:opacity-100"
              size={14}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
