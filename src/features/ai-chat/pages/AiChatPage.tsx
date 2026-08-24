import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import {
  useConversation,
  useConversations,
  useSendChatMessage,
} from "@/features/ai-chat/ai-chat.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";

const COMPOSE_MAX_HEIGHT_PX = 160;

const ConversationListItem = ({
  title,
  updatedAt,
  isActive,
  onClick,
}: {
  title: string;
  updatedAt: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    className={cn(
      "w-full rounded-12 px-3 py-2.5 text-left transition-colors",
      isActive ? "bg-brand-50 text-brand-700" : "hover:bg-neutral-100"
    )}
    type="button"
    onClick={onClick}
  >
    <p className="truncate text-[13px] font-medium text-neutral-900">{title}</p>
    <p className="mt-0.5 text-[11px] text-neutral-400">
      {timeAgoLong(updatedAt)}
    </p>
  </button>
);

const AnswerBubble = ({
  question,
  answer,
  sources,
  pending,
}: {
  question: string;
  answer?: string;
  sources?: string[];
  pending?: boolean;
}) => (
  <div className="mt-4 space-y-2">
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-16 rounded-br-4 bg-brand-600 px-3.5 py-2.5 text-[13.5px] text-white">
        <p className="whitespace-pre-wrap break-words">{question}</p>
      </div>
    </div>
    <div className="flex items-start gap-2">
      <div className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        <Sparkles size={13} />
      </div>
      <div className="max-w-[75%] rounded-16 rounded-tl-4 bg-neutral-100 px-3.5 py-2.5 text-[13.5px] text-neutral-900">
        {pending ? (
          <div className="flex items-center gap-1.5 py-1 text-neutral-400">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words">{answer}</p>
            {!!sources?.length && (
              <p className="mt-2 border-t border-neutral-200 pt-2 text-[11px] text-neutral-500">
                Sources: {sources.join(" · ")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

export const AiChatPage = () => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const conversations = useConversations();
  const conversation = useConversation(activeConversationId);
  const sendMessage = useSendChatMessage();
  const runWithToast = useToastMutation();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSE_MAX_HEIGHT_PX)}px`;
  }, [draft]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.data?.turns.length, pendingQuestion]);

  const handleSend = async () => {
    const question = draft.trim();
    if (!question || sendMessage.isPending) return;
    setDraft("");
    setPendingQuestion(question);

    const ok = await runWithToast(
      async () => {
        const result = await sendMessage.mutateAsync({
          question,
          conversationId: activeConversationId ?? undefined,
        });
        setActiveConversationId(result.conversationId);
      },
      { error: "Couldn't get an answer — try again" }
    );

    setPendingQuestion(null);
    if (!ok) setDraft(question); // give the question back so it isn't lost
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1000px] gap-5 px-6 py-6">
      <aside className="w-[220px] flex-shrink-0 overflow-y-auto">
        <Button
          className="mb-3 w-full justify-start gap-2"
          size="sm"
          variant="outline"
          onClick={() => setActiveConversationId(null)}
        >
          <Sparkles size={14} />
          New chat
        </Button>

        {conversations.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-12" />
            <Skeleton className="h-12 w-full rounded-12" />
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.data?.map((c) => (
              <ConversationListItem
                isActive={c.id === activeConversationId}
                key={c.id}
                title={c.title}
                updatedAt={c.updatedAt}
                onClick={() => setActiveConversationId(c.id)}
              />
            ))}
          </div>
        )}
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-neutral-900">
            RemoteSea Assistant
          </h1>
          <p className="text-sm text-neutral-500">
            Ask about hiring policies, or a specific application.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-16 border border-neutral-100 bg-white p-5">
          {!activeConversationId && !pendingQuestion ? (
            <EmptyState
              description="Ask a question about RemoteSea's hiring policies or process to get started."
              title="Start a new conversation"
            />
          ) : conversation.isLoading && activeConversationId ? (
            <Skeleton className="h-20 w-2/3 rounded-16" />
          ) : conversation.isError ? (
            <EmptyState
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => conversation.refetch()}
                >
                  Try again
                </Button>
              }
              description="Something went wrong loading this conversation."
              title="Couldn't load conversation"
            />
          ) : (
            <>
              {conversation.data?.turns.map((t) => (
                <AnswerBubble
                  answer={t.answer}
                  key={t.id}
                  question={t.question}
                  sources={t.sources}
                />
              ))}
              {pendingQuestion && (
                <AnswerBubble pending question={pendingQuestion} />
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="mt-3 flex items-end gap-1.5 rounded-24 border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-brand-600"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            className={cn(
              TEXTAREA_INPUT_CLASS,
              "min-h-[24px] resize-none border-none bg-transparent p-0 py-1.5 shadow-none focus:border-none focus:shadow-none"
            )}
            maxLength={2000}
            placeholder="Ask the RemoteSea assistant…"
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            className="h-9 w-9 flex-shrink-0 rounded-full p-0"
            disabled={!draft.trim() || sendMessage.isPending}
            isLoading={sendMessage.isPending}
            type="submit"
          >
            <Send size={15} />
          </Button>
        </form>
      </div>
    </div>
  );
};
