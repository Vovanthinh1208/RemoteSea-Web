import { useState } from "react";
import { MessagesSquare, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useComments,
  useCreateComment,
} from "@/features/comments/comment.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { timeAgoLong } from "@/utils/time";

const COMMENT_SKELETON_COUNT = 2;
const COMMENT_BODY_MAX_LENGTH = 4000;

const DiscussionThreadCardSkeleton = () => (
  <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="space-y-2.5">
      {Array.from({ length: COMMENT_SKELETON_COUNT }, (_, i) => (
        <div
          className="space-y-1.5 rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
          key={i}
        >
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const DiscussionThreadCard = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useComments(applicationId);
  const createCommentMutation = useCreateComment(applicationId);
  const runWithToast = useToastMutation();
  const [body, setBody] = useState("");

  if (isLoading) {
    return <DiscussionThreadCardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-between rounded-16 border border-neutral-100 bg-white px-4 py-3.5 text-[12.5px] text-neutral-400">
        Couldn't load the discussion thread.
        <button
          className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  const handlePost = async (): Promise<void> => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const posted = await runWithToast(
      () => createCommentMutation.mutateAsync({ body: trimmed }),
      { error: "Couldn't post your comment. Please try again." }
    );
    if (posted) setBody("");
  };

  return (
    <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <MessagesSquare className="flex-shrink-0 text-neutral-400" size={15} />
        <h3 className="text-[13.5px] font-medium text-neutral-900">
          Internal discussion
        </h3>
      </div>
      <p className="-mt-2 text-[12px] text-neutral-400">
        Only visible to your team, never to the candidate.
      </p>

      {data.comments.length > 0 && (
        <ul className="space-y-2">
          {data.comments.map((comment) => (
            <li
              className="rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
              key={comment.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-medium text-neutral-800">
                  {comment.authorId === user?.id
                    ? "You"
                    : (comment.author.name ?? "Team member")}
                </span>
                <span className="flex-shrink-0 text-[11px] text-neutral-400">
                  {timeAgoLong(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-neutral-600">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div
        className={
          data.comments.length > 0
            ? "space-y-2 border-t border-neutral-100 pt-3"
            : "space-y-2"
        }
      >
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          maxLength={COMMENT_BODY_MAX_LENGTH}
          placeholder="Leave a note for your team…"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            disabled={!body.trim() || createCommentMutation.isPending}
            isLoading={createCommentMutation.isPending}
            size="sm"
            type="button"
            onClick={handlePost}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
