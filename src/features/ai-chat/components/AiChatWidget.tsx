import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  MessageCircleQuestion,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  useConversation,
  useConversations,
  useSendChatMessage,
} from "@/features/ai-chat/ai-chat.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import { AiChatMessageBubble } from "./AiChatMessageBubble";
import { AiChatComposer } from "./AiChatComposer";
import { AiChatHistoryMenu } from "./AiChatHistoryMenu";
import { AiChatEmptyState } from "./AiChatEmptyState";

// Within this many px of the true bottom still counts as "at the bottom" —
// a user who scrolled up even slightly to re-read the last line shouldn't
// be treated as having left the conversation's end.
const NEAR_BOTTOM_THRESHOLD_PX = 80;

export const AiChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null | undefined
  >(undefined);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const conversations = useConversations();
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [hasNewMessageBelow, setHasNewMessageBelow] = useState(false);
  const hasLoadedOnce = useRef(false);

  const firstName = user?.name?.split(" ")[0];

  const requestClose = () => setClosing(true);

  useEffect(() => {
    if (!open) return;
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
      if (e.key !== "Escape") return;
      setShowHistory((wasShowingHistory) => {
        if (wasShowingHistory) return false;
        setClosing(true);
        return wasShowingHistory;
      });
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const checkNearBottom = () => {
      const near =
        el.scrollHeight - el.scrollTop - el.clientHeight <
        NEAR_BOTTOM_THRESHOLD_PX;
      isNearBottomRef.current = near;
      if (near) setHasNewMessageBelow(false);
    };
    checkNearBottom();
    el.addEventListener("scroll", checkNearBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkNearBottom);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({
        behavior: hasLoadedOnce.current ? "smooth" : "auto",
        block: "end",
      });
    } else if (hasLoadedOnce.current) {
      setHasNewMessageBelow(true);
    }
    hasLoadedOnce.current = true;
  }, [
    open,
    activeConversationId,
    conversation.data?.turns.length,
    pendingQuestion,
  ]);

  // A different conversation is a different scroll history — the "already
  // jumped once" flag from the previous one shouldn't carry over and cause
  // this one to smooth-scroll through everything on its own first render.
  useEffect(() => {
    hasLoadedOnce.current = false;
  }, [activeConversationId]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setHasNewMessageBelow(false);
  };

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

  return (
    <div ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
        // max(1.25rem, safe-area) instead of a plain bottom-5 — on a
        // notched phone in standalone/PWA mode, the fixed 20px offset sat
        // partly under the home-indicator gesture bar; this keeps the same
        // 20px on every other device (env() resolves to 0 where there's no
        // inset) while clearing the real one where it exists.
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_10px_28px_rgba(46,155,82,0.35)] focus-visible:shadow-focus focus-visible:outline-none active:scale-95"
        type="button"
        onClick={() => (open ? requestClose() : setOpen(true))}
      >
        {!open && !conversations.isLoading && hasNoConversations && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500 opacity-40" />
        )}
        <span className="relative h-[22px] w-[22px]">
          <Sparkles
            className={cn(
              "absolute inset-0 transition-all duration-200",
              open ? "rotate-45 opacity-0" : "rotate-0 opacity-100"
            )}
            size={22}
          />
          <X
            className={cn(
              "absolute inset-0 transition-all duration-200",
              open ? "rotate-0 opacity-100" : "-rotate-45 opacity-0"
            )}
            size={22}
          />
        </span>
      </button>

      {open && (
        <div
          className={cn(
            // Same env()-aware bottom offset as the launcher button — the
            // full-height mobile sheet's own bottom edge (and the composer
            // sitting near it) is exactly where a notched phone's home
            // indicator would otherwise overlap it.
            "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] top-14 z-40 flex origin-bottom flex-col overflow-hidden rounded-24 border border-brand-100/70 bg-white shadow-[0_8px_24px_rgba(26,25,23,0.10),0_2px_10px_rgba(46,155,82,0.08)]",
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
          <div className="relative flex flex-shrink-0 items-center justify-between gap-2 border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-chip ring-4 ring-brand-50">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-[15px] font-semibold text-transparent">
                    RemoteSea Assistant
                  </p>
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </span>
                </div>
                <p className="truncate text-[12.5px] text-neutral-400">
                  Ask about hiring policies, or a specific application.
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <AiChatHistoryMenu
                activeConversationId={activeConversationId}
                conversations={conversations.data}
                historyRef={historyRef}
                isLoading={conversations.isLoading}
                setShowHistory={setShowHistory}
                showHistory={showHistory}
                onSelectConversation={(id) => setSelectedConversationId(id)}
              />
              <button
                aria-label="New chat"
                className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1.5 text-[12px] font-medium text-brand-700 transition-colors hover:bg-brand-100 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={startNewChat}
              >
                <Plus size={14} />
                New chat
              </button>
              <button
                aria-label="Close"
                className="group grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={requestClose}
              >
                <X
                  className="transition-transform group-hover:rotate-90"
                  size={16}
                />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              className="scrollbar-thin h-full overflow-y-auto bg-gradient-to-b from-brand-50/40 via-white to-white px-4 py-5 sm:px-5"
              ref={scrollContainerRef}
            >
              {!activeConversationId && !pendingQuestion ? (
                <AiChatEmptyState
                  firstName={firstName}
                  isPending={sendMessage.isPending}
                  onSelectPrompt={(prompt) => void handleSend(prompt)}
                />
              ) : conversation.isLoading && activeConversationId ? (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Skeleton className="h-9 w-2/3 rounded-16 rounded-br-4" />
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Skeleton className="mt-0.5 h-7 w-7 flex-shrink-0 rounded-full" />
                    <Skeleton className="h-16 w-3/4 rounded-16 rounded-tl-4" />
                  </div>
                </div>
              ) : conversation.isError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
                    <MessageCircleQuestion size={20} />
                  </div>
                  <p className="font-medium text-neutral-900">
                    Couldn&apos;t load conversation
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
                <div aria-live="polite" role="log">
                  {conversation.data?.turns.map((t) => (
                    <AiChatMessageBubble
                      answer={t.answer}
                      key={t.id}
                      question={t.question}
                      sources={t.sources}
                    />
                  ))}
                  {pendingQuestion && (
                    <AiChatMessageBubble
                      pending
                      question={pendingQuestion}
                    />
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            {hasNewMessageBelow && (
              <button
                className="absolute bottom-3 left-1/2 flex -translate-x-1/2 animate-fade-up items-center gap-1.5 rounded-full bg-neutral-900/85 px-3.5 py-2 text-[12px] font-medium text-white shadow-card-lg backdrop-blur-sm transition-colors hover:bg-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={scrollToBottom}
              >
                <ArrowDown size={12} />
                New message
              </button>
            )}
          </div>

          <AiChatComposer
            draft={draft}
            isPending={sendMessage.isPending}
            setDraft={setDraft}
            textareaRef={textareaRef}
            onSend={() => void handleSend()}
          />
        </div>
      )}
    </div>
  );
};
