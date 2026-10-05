import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { AiMarkdown } from "@/features/ai-chat/components/AiMarkdown";

export interface AiChatMessageBubbleProps {
  question: string;
  answer?: string;
  sources?: string[];
  pending?: boolean;
}

export const AiChatMessageBubble = ({
  question,
  answer,
  sources,
  pending,
}: AiChatMessageBubbleProps) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-5 animate-fade-up space-y-3 first:mt-0">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-16 rounded-br-4 bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-3 text-[14.5px] leading-relaxed text-white shadow-chip sm:max-w-[78%]">
          <p className="whitespace-pre-wrap break-words">{question}</p>
        </div>
      </div>
      <div className="group/msg flex items-start gap-2.5">
        <div className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-chip">
          <Sparkles size={14} />
        </div>
        <div className="min-w-0 max-w-[85%] sm:max-w-[78%]">
          <div className="rounded-16 rounded-tl-4 border border-neutral-100 bg-neutral-50 px-4 py-3 text-[14.5px] leading-relaxed text-neutral-900 shadow-chip">
            {pending ? (
              <div className="flex items-center gap-1.5 py-1.5 text-brand-500">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
              </div>
            ) : (
              <>
                <AiMarkdown text={answer ?? ""} />
                {!!sources?.length && (
                  <p className="mt-2.5 border-t border-neutral-200 pt-2.5 text-[11.5px] text-neutral-500">
                    Sources: {sources.join(" · ")}
                  </p>
                )}
              </>
            )}
          </div>
          {!pending && answer && (
            <button
              className="mt-1 flex items-center gap-1 rounded-8 px-1.5 py-1 text-[11px] text-neutral-400 opacity-60 transition-opacity hover:text-brand-600 focus-visible:opacity-100 focus-visible:shadow-focus focus-visible:outline-none sm:opacity-0 sm:group-hover/msg:opacity-100"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(answer);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
