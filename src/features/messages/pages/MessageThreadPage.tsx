import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import {
  useMessages,
  useSendMessage,
} from "@/features/messages/message.queries";
import { groupMessagesByDay } from "@/features/messages/message.utils";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useApplicationHeaderContext } from "@/hooks/useApplicationHeaderContext";
import { useToastMutation } from "@/hooks/useToastMutation";
import { timeAgoLong } from "@/utils/time";
import { companyColor } from "@/utils/color";
import { cn } from "@/utils/cn";

const COMPOSE_MAX_HEIGHT_PX = 160;
const AVATAR_SIZE_PX = 24;

const MessageBubbleSkeleton = ({ align }: { align: "left" | "right" }) => (
  <div
    className={cn("flex items-end gap-1.5", align === "right" && "justify-end")}
  >
    {align === "left" && <div className="h-6 w-6 flex-shrink-0" />}
    <Skeleton className="h-14 w-[220px] rounded-16" />
  </div>
);

const MessageBubble = ({
  message,
  isMine,
  isFirstInGroup,
  isLastInGroup,
  otherPartyName,
}: {
  message: Message;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  otherPartyName: string;
}) => (
  <div
    className={cn(
      "flex items-end gap-1.5",
      isMine && "justify-end",
      isFirstInGroup ? "mt-3" : "mt-0.5"
    )}
  >
    {!isMine && (
      <div
        className="flex-shrink-0"
        style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX }}
      >
        {isLastInGroup && (
          <div
            aria-hidden="true"
            className="grid h-full w-full place-items-center rounded-full text-[10.5px] font-semibold text-white"
            style={{ background: companyColor(otherPartyName) }}
          >
            {otherPartyName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    )}
    <div
      className={cn(
        "max-w-[70%] rounded-16 px-3.5 py-2.5 text-[13.5px]",
        isMine ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-900",
        isMine && !isFirstInGroup && "rounded-tr-4",
        isMine && !isLastInGroup && "rounded-br-4",
        !isMine && !isFirstInGroup && "rounded-tl-4",
        !isMine && !isLastInGroup && "rounded-bl-4"
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.body}</p>
      {isLastInGroup && (
        <p
          className={cn(
            "mt-1 text-[10.5px]",
            isMine ? "text-brand-100" : "text-neutral-400"
          )}
        >
          {timeAgoLong(message.createdAt)}
        </p>
      )}
    </div>
  </div>
);

export const MessageThreadPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useMessages(applicationId);
  const { backHref, title } = useApplicationHeaderContext(data, "Messages");

  const sendMessage = useSendMessage(applicationId);
  const runWithToast = useToastMutation();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedOnce = useRef(false);
  const messageCount = data?.messages.length;

  // The very first render with data (opening the thread) jumps straight to
  // the bottom — animating a smooth scroll through the entire history on
  // every page load reads as sluggish, not "friendly." Only a message count
  // increase *after* that (sending, or a new one arriving) gets the smooth
  // scroll, so it reads as "a new message just appeared."
  useEffect(() => {
    if (messageCount === undefined) return;
    bottomRef.current?.scrollIntoView({
      behavior: hasLoadedOnce.current ? "smooth" : "auto",
      block: "end",
    });
    hasLoadedOnce.current = true;
  }, [messageCount]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSE_MAX_HEIGHT_PX)}px`;
  }, [draft]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    void runWithToast(() => sendMessage.mutateAsync(body), {
      error: "Couldn't send message",
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[720px] flex-col px-6 py-6">
      <ApplicationDetailHeader
        backHref={backHref}
        className="mb-4"
        subtitle={data?.jobTitle}
        title={title}
      />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-16 border border-neutral-100 bg-white p-5">
        {isLoading ? (
          <>
            <MessageBubbleSkeleton align="left" />
            <MessageBubbleSkeleton align="right" />
            <MessageBubbleSkeleton align="left" />
          </>
        ) : isError ? (
          <EmptyState
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
            description="Something went wrong loading this conversation."
            title="Couldn't load messages"
          />
        ) : !data || data.messages.length === 0 ? (
          <EmptyState
            description="Say hello — messages here are only visible to the two of you."
            title="No messages yet"
          />
        ) : (
          groupMessagesByDay(data.messages).map((group) => (
            <div key={group.key}>
              <div className="mb-3 flex items-center justify-center">
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
                  {group.label}
                </span>
              </div>
              <div>
                {group.messages.map((m, i) => {
                  const prev = group.messages[i - 1];
                  const next = group.messages[i + 1];
                  return (
                    <MessageBubble
                      isFirstInGroup={!prev || prev.senderId !== m.senderId}
                      isLastInGroup={!next || next.senderId !== m.senderId}
                      isMine={m.senderId === user?.id}
                      key={m.id}
                      message={m}
                      otherPartyName={title}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex items-end gap-1.5 rounded-24 border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 transition-all focus-within:border-brand-600 focus-within:shadow-focus"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          className={cn(
            TEXTAREA_INPUT_CLASS,
            "min-h-[24px] resize-none border-none bg-transparent p-0 py-1.5 shadow-none focus:border-none focus:shadow-none"
          )}
          maxLength={4000}
          placeholder="Write a message…"
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          aria-label="Send message"
          className="h-9 w-9 flex-shrink-0 rounded-full p-0"
          disabled={!draft.trim() || sendMessage.isPending}
          isLoading={sendMessage.isPending}
          type="submit"
        >
          <Send size={15} />
        </Button>
      </form>
    </div>
  );
};
