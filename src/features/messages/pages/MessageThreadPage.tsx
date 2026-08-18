import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import {
  useMessages,
  useSendMessage,
} from "@/features/messages/message.queries";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToastMutation } from "@/hooks/useToastMutation";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

const MessageBubbleSkeleton = ({ align }: { align: "left" | "right" }) => (
  <div className={cn("flex", align === "right" && "justify-end")}>
    <Skeleton className="h-14 w-[220px] rounded-16" />
  </div>
);

const MessageBubble = ({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) => (
  <div className={cn("flex", isMine && "justify-end")}>
    <div
      className={cn(
        "max-w-[75%] rounded-16 px-3.5 py-2.5 text-[13.5px]",
        isMine ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-900"
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.body}</p>
      <p
        className={cn(
          "mt-1 text-[10.5px]",
          isMine ? "text-brand-100" : "text-neutral-400"
        )}
      >
        {timeAgoLong(message.createdAt)}
      </p>
    </div>
  </div>
);

export const MessageThreadPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { user } = useAuth();
  const isEmployerViewer = user?.role === "EMPLOYER";
  const backHref = isEmployerViewer ? ROUTES.employerDashboard : ROUTES.talent;

  const { data, isLoading, isError, refetch } = useMessages(applicationId);
  const title = isEmployerViewer
    ? (data?.talentName ?? "Candidate")
    : (data?.employerName ?? "Employer");
  useDocumentTitle(data ? title : "Messages");

  const sendMessage = useSendMessage(applicationId);
  const runWithToast = useToastMutation();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.messages.length]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    // The mutation's own onError already rolls back the optimistic bubble
    // (see useSendMessage) — without this, that rollback was the only
    // signal a failed send gave: the message just silently vanished, with
    // no indication why.
    void runWithToast(() => sendMessage.mutateAsync(body), {
      error: "Couldn't send message",
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[720px] flex-col px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          aria-label="Back"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          to={backHref}
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-semibold text-neutral-900">
            {title}
          </h1>
          {data && (
            <p className="truncate text-[12.5px] text-neutral-400">
              {data.jobTitle}
            </p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-16 border border-neutral-100 bg-white p-5">
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
          data.messages.map((m) => (
            <MessageBubble
              isMine={m.senderId === user?.id}
              key={m.id}
              message={m}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          className={cn(TEXTAREA_INPUT_CLASS, "min-h-[44px]")}
          maxLength={4000}
          placeholder="Write a message…"
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
          className="shrink-0"
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
