import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { History, Plus, Send, Sparkles, X } from "lucide-react";
import {
  useConversation,
  useConversations,
  useSendChatMessage,
} from "@/features/ai-chat/ai-chat.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import { timeAgoShort } from "@/utils/time";

const COMPOSE_MAX_HEIGHT_PX = 120;
const DRAFT_MAX_LENGTH = 2000;
const DRAFT_WARN_LENGTH = 1800;

const SUGGESTED_PROMPTS = [
  "What's our remote hiring policy?",
  "How do I review a candidate's application?",
  "What are the steps in our hiring process?",
];

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
  <div className="mt-5 animate-fade-up space-y-3 first:mt-0">
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-16 rounded-br-4 bg-brand-600 px-4 py-3 text-[14.5px] leading-relaxed text-white shadow-chip sm:max-w-[78%]">
        <p className="whitespace-pre-wrap break-words">{question}</p>
      </div>
    </div>
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-chip">
        <Sparkles size={14} />
      </div>
      <div className="max-w-[85%] rounded-16 rounded-tl-4 bg-neutral-100 px-4 py-3 text-[14.5px] leading-relaxed text-neutral-900 sm:max-w-[78%]">
        {pending ? (
          <div className="flex items-center gap-1.5 py-1.5 text-neutral-400">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words">{answer}</p>
            {!!sources?.length && (
              <p className="mt-2.5 border-t border-neutral-200 pt-2.5 text-[11.5px] text-neutral-500">
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
  const [showHistory, setShowHistory] = useState(false);
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
  const historyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0];

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
      if (!rootRef.current?.contains(e.target as Node)) {
        setClosing(true);
        return;
      }
      if (!historyRef.current?.contains(e.target as Node)) {
        setShowHistory(false);
      }
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

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  if (!user) return null;

  const handleSend = async (text?: string) => {
    const question = (text ?? draft).trim();
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

  const startNewChat = () => {
    setSelectedConversationId(null);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const hasNoConversations = conversations.data?.length === 0;
  const draftLength = draft.length;

  return (
    <div ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card-lg transition-transform hover:scale-105 active:scale-95"
        type="button"
        onClick={() => (open ? requestClose() : setOpen(true))}
      >
        {!open && !conversations.isLoading && hasNoConversations && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500 opacity-40" />
        )}
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div
          className={cn(
            // Mobile: a near-fullscreen sheet (clears the h-16 sticky navbar,
            // small margin everywhere else) — the old fixed 380px corner
            // popup shrank to ~310px on narrow phones, far too tight to read
            // AI answers in. Desktop (sm+): back to a floating corner card,
            // just meaningfully larger than before (420–460px vs 380px) so
            // paragraphs and code/lists in answers have room to breathe.
            "fixed inset-x-3 bottom-3 top-16 z-40 flex origin-bottom flex-col overflow-hidden rounded-20 border border-neutral-200 bg-white shadow-card-lg",
            "sm:inset-x-auto sm:inset-y-auto sm:bottom-[92px] sm:right-5 sm:top-auto sm:h-[min(680px,calc(100vh-8rem))] sm:w-[420px] sm:max-w-[calc(100vw-2.5rem)] sm:origin-bottom-right",
            "lg:w-[460px]",
            closing ? "animate-chat-pop-out" : "animate-chat-pop-in"
          )}
          onAnimationEnd={() => {
            if (closing) {
              setOpen(false);
              setClosing(false);
            }
          }}
        >
          <div className="relative flex flex-shrink-0 items-center justify-between border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-chip">
                <Sparkles size={17} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[15px] font-semibold text-neutral-900">
                    RemoteSea Assistant
                  </p>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                </div>
                <p className="text-[12.5px] text-neutral-400">
                  Ask about hiring policies, or a specific application.
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <div className="relative" ref={historyRef}>
                <button
                  aria-label="Conversation history"
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
                    showHistory && "bg-neutral-100 text-neutral-900"
                  )}
                  title="Conversation history"
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                >
                  <History size={16} />
                </button>
                {showHistory && (
                  <div className="scrollbar-thin absolute right-0 top-10 z-10 max-h-72 w-72 overflow-y-auto rounded-12 border border-neutral-200 bg-white p-2 shadow-card-lg">
                    {conversations.isLoading ? (
                      <div className="space-y-1.5 p-1.5">
                        <Skeleton className="h-9 w-full rounded-8" />
                        <Skeleton className="h-9 w-full rounded-8" />
                      </div>
                    ) : hasNoConversations ? (
                      <p className="px-2.5 py-3 text-center text-[12px] text-neutral-400">
                        No previous conversations yet.
                      </p>
                    ) : (
                      conversations.data?.map((c) => (
                        <button
                          className={cn(
                            "flex w-full flex-col items-start gap-0.5 rounded-8 px-3 py-2 text-left transition-colors hover:bg-neutral-50",
                            c.id === activeConversationId && "bg-brand-50"
                          )}
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedConversationId(c.id);
                            setShowHistory(false);
                          }}
                        >
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
              <button
                aria-label="New chat"
                className="flex items-center gap-1 rounded-8 px-2.5 py-1.5 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                type="button"
                onClick={startNewChat}
              >
                <Plus size={14} />
                New chat
              </button>
              <button
                aria-label="Close"
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                type="button"
                onClick={requestClose}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            {!activeConversationId && !pendingQuestion ? (
              <div className="flex h-full animate-fade-up flex-col items-center justify-center gap-5 py-6 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="mb-1.5 text-[16px] font-semibold text-neutral-900">
                    Hi{firstName ? `, ${firstName}` : ""} — how can I help?
                  </p>
                  <p className="mx-auto max-w-[280px] text-[13.5px] leading-relaxed text-neutral-500">
                    Ask a question about RemoteSea's hiring policies or process
                    to get started.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      className="rounded-12 border border-neutral-200 px-3.5 py-2.5 text-left text-[13px] text-neutral-700 shadow-chip transition-colors hover:border-brand-300 hover:bg-brand-50"
                      disabled={sendMessage.isPending}
                      key={prompt}
                      type="button"
                      onClick={() => void handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : conversation.isLoading && activeConversationId ? (
              <Skeleton className="h-16 w-2/3 rounded-16" />
            ) : conversation.isError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="font-medium text-neutral-900">
                  Couldn't load conversation
                </p>
                <p className="text-sm text-neutral-500">
                  Something went wrong loading this conversation.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => conversation.refetch()}
                >
                  Try again
                </Button>
              </div>
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

          <div className="flex-shrink-0 px-4 pb-1 sm:px-5">
            {draftLength > DRAFT_WARN_LENGTH && (
              <p
                className={cn(
                  "pb-1 text-right text-[11px]",
                  draftLength >= DRAFT_MAX_LENGTH
                    ? "text-red-500"
                    : "text-neutral-400"
                )}
              >
                {draftLength}/{DRAFT_MAX_LENGTH}
              </p>
            )}
          </div>

          <form
            className="mx-4 mb-4 mt-0 flex flex-shrink-0 items-end gap-2 rounded-24 border border-neutral-200 bg-white py-2 pl-[18px] pr-2 shadow-chip transition-colors focus-within:border-brand-600 focus-within:shadow-focus sm:mx-5"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <textarea
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
                  void handleSend();
                }
              }}
            />
            <Button
              className="h-10 w-10 flex-shrink-0 rounded-full p-0"
              disabled={!draft.trim() || sendMessage.isPending}
              isLoading={sendMessage.isPending}
              type="submit"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
