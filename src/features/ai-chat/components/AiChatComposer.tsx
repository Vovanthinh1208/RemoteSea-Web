import { type RefObject, useLayoutEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { cn } from "@/utils/cn";

const COMPOSE_MAX_HEIGHT_PX = 120;
export const DRAFT_MAX_LENGTH = 2000;
const DRAFT_WARN_LENGTH = 1800;

export interface AiChatComposerProps {
  draft: string;
  setDraft: (value: string) => void;
  onSend: () => void;
  isPending: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export const AiChatComposer = ({
  draft,
  setDraft,
  onSend,
  isPending,
  textareaRef,
}: AiChatComposerProps) => {
  const draftLength = draft.length;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSE_MAX_HEIGHT_PX)}px`;
  }, [draft, textareaRef]);

  return (
    <>
      <div className="flex-shrink-0 px-4 pb-1 sm:px-5">
        {draftLength > DRAFT_WARN_LENGTH && (
          <p
            className={cn(
              "pb-1 text-right text-[11px] tabular-nums",
              draftLength >= DRAFT_MAX_LENGTH
                ? "font-medium text-red-500"
                : "text-neutral-400"
            )}
          >
            {draftLength}/{DRAFT_MAX_LENGTH}
          </p>
        )}
      </div>

      <form
        className="mx-4 mb-4 mt-0 flex flex-shrink-0 items-end gap-2 rounded-24 border border-neutral-200 bg-white py-2 pl-[18px] pr-2 shadow-chip transition-all focus-within:border-brand-600 focus-within:shadow-focus sm:mx-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <textarea
          aria-label="Message"
          className={cn(
            TEXTAREA_INPUT_CLASS,
            "min-h-[26px] resize-none border-none bg-transparent p-0 py-1.5 text-[14.5px] leading-relaxed shadow-none focus:border-none focus:shadow-none"
          )}
          maxLength={DRAFT_MAX_LENGTH}
          placeholder="Ask the RemoteSea assistant…"
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button
          aria-label="Send message"
          className="h-10 w-10 flex-shrink-0 rounded-full border-none bg-gradient-to-br from-brand-500 to-brand-700 p-0 shadow-chip transition-transform enabled:hover:scale-105 enabled:hover:from-brand-500 enabled:hover:to-brand-700 disabled:from-neutral-300 disabled:to-neutral-300"
          disabled={!draft.trim() || isPending}
          isLoading={isPending}
          type="submit"
        >
          <Send size={16} />
        </Button>
      </form>
    </>
  );
};
