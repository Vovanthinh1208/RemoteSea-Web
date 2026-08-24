import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";

const COMPOSE_MAX_HEIGHT_PX = 120;

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
      <div className="max-w-[80%] rounded-16 rounded-br-4 bg-brand-600 px-3.5 py-2.5 text-[13.5px] text-white">
        <p className="whitespace-pre-wrap break-words">{question}</p>
      </div>
    </div>
    <div className="flex items-start gap-2">
      <div className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        <Sparkles size={13} />
      </div>
      <div className="max-w-[80%] rounded-16 rounded-tl-4 bg-neutral-100 px-3.5 py-2.5 text-[13.5px] text-neutral-900">
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

export const AiChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  // undefined = no explicit choice made yet (resume the most recent
  // conversation, if any); null = explicitly starting a new/blank one
  // ("New chat"); a string = a real conversation id. Deriving the id to
  // actually use from this (below) instead of syncing it via a useEffect
  // avoids an extra render pass on open — no state to keep "in sync," just
  // a value computed straight from what's already in hand.
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null | undefined
  >(undefined);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const conversations = useConversations();
  // ChatService.list_conversations on the backend already orders by
  // updatedAt desc, so conversations.data[0] is the most recent.
  const activeConversationId =
    selectedConversationId === undefined
      ? (conversations.data?.[0]?.id ?? null)
      : selectedConversationId;
  const conversation = useConversation(activeConversationId);
  const sendMessage = useSendChatMessage();
  const runWithToast = useToastMutation();

  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Defined before the effects below (not after the `if (!user) return
  // null` guard) so the click-outside/Escape effect's closure always
  // resolves a real function, not a binding that's only initialized on
  // renders where a user exists.
  const requestClose = () => setClosing(true);

  useEffect(() => {
    if (!open) return;
    // setClosing directly, not the requestClose wrapper — setClosing's
    // identity is stable across renders (React's useState guarantee), so
    // this effect's dependency array can stay just [open], same pattern
    // NotificationBell uses with its own setOpen(false).
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setClosing(true);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClosing(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSE_MAX_HEIGHT_PX)}px`;
  }, [draft]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [open, conversation.data?.turns.length, pendingQuestion]);

  if (!user) return null;

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
        setSelectedConversationId(result.conversationId);
      },
      { error: "Couldn't get an answer — try again" }
    );

    setPendingQuestion(null);
    if (!ok) setDraft(question); // give the question back so it isn't lost
  };

  return (
    <div ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-card-lg transition-transform hover:scale-105 active:scale-95"
        type="button"
        onClick={() => (open ? requestClose() : setOpen(true))}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div
          className={cn(
            "fixed bottom-[92px] right-5 z-40 flex h-[min(600px,calc(100vh-7rem))] w-[380px] max-w-[calc(100vw-2.5rem)] origin-bottom-right flex-col overflow-hidden rounded-20 border border-neutral-200 bg-white shadow-card-lg",
            closing ? "animate-chat-pop-out" : "animate-chat-pop-in"
          )}
          onAnimationEnd={() => {
            if (closing) {
              setOpen(false);
              setClosing(false);
            }
          }}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div>
              <p className="text-[13.5px] font-semibold text-neutral-900">
                RemoteSea Assistant
              </p>
              <p className="text-[11.5px] text-neutral-400">
                Ask about hiring policies, or a specific application.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="rounded-8 px-2 py-1 text-[11.5px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                type="button"
                onClick={() => setSelectedConversationId(null)}
              >
                New chat
              </button>
              <button
                aria-label="Close"
                className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                type="button"
                onClick={requestClose}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {!activeConversationId && !pendingQuestion ? (
              <EmptyState
                description="Ask a question about RemoteSea's hiring policies or process to get started."
                title="Start a new conversation"
              />
            ) : conversation.isLoading && activeConversationId ? (
              <Skeleton className="h-16 w-2/3 rounded-16" />
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
            className="m-3 mt-0 flex flex-shrink-0 items-end gap-1.5 rounded-24 border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-brand-600"
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
      )}
    </div>
  );
};
