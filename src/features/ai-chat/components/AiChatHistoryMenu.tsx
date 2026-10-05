import type { RefObject } from "react";
import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { cn } from "@/utils/cn";
import { timeAgoShort } from "@/utils/time";
import type { ConversationSummaryDto } from "@/features/ai-chat/ai-chat.dto";

export interface AiChatHistoryMenuProps {
  showHistory: boolean;
  setShowHistory: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLoading: boolean;
  conversations: ConversationSummaryDto[] | undefined;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  historyRef: RefObject<HTMLDivElement | null>;
}

export const AiChatHistoryMenu = ({
  showHistory,
  setShowHistory,
  isLoading,
  conversations,
  activeConversationId,
  onSelectConversation,
  historyRef,
}: AiChatHistoryMenuProps) => {
  const hasNoConversations = conversations?.length === 0;

  return (
    <div className="relative" ref={historyRef}>
      <button
        aria-label="Conversation history"
        className={cn(
          "grid h-8 w-8 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none",
          showHistory && "bg-neutral-100 text-neutral-900"
        )}
        title="Conversation history"
        type="button"
        onClick={() => setShowHistory((v) => !v)}
      >
        <History size={16} />
      </button>
      {showHistory && (
        <div className="scrollbar-thin absolute right-0 top-10 z-10 max-h-72 w-72 origin-top-right animate-fade-up overflow-y-auto rounded-12 border border-neutral-200 bg-white p-2 shadow-card-lg">
          {isLoading ? (
            <div className="space-y-1.5 p-1.5">
              <Skeleton className="h-9 w-full rounded-8" />
              <Skeleton className="h-9 w-full rounded-8" />
            </div>
          ) : hasNoConversations ? (
            <EmptyRow className="px-2.5">
              No previous conversations yet.
            </EmptyRow>
          ) : (
            conversations?.map((c) => (
              <button
                className={cn(
                  "relative flex w-full flex-col items-start gap-0.5 rounded-8 px-3 py-2 pl-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none",
                  c.id === activeConversationId && "bg-brand-50"
                )}
                key={c.id}
                type="button"
                onClick={() => {
                  onSelectConversation(c.id);
                  setShowHistory(false);
                }}
              >
                {c.id === activeConversationId && (
                  <span className="absolute bottom-1.5 left-1 top-1.5 w-[3px] rounded-full bg-brand-500" />
                )}
                <span
                  className={cn(
                    "w-full truncate text-[13px] font-medium",
                    c.id === activeConversationId
                      ? "text-brand-700"
                      : "text-neutral-800"
                  )}
                >
                  {c.title || "Untitled conversation"}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {timeAgoShort(c.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
