import type {
  ApplicationCommentListResponse,
  CreateApplicationCommentPayload,
} from "@/types/comment";
import type { ApplicationComment } from "@/types/comment";

export type CommentDto = ApplicationComment;
export type CommentListResponseDto = ApplicationCommentListResponse;
export type CreateCommentRequestDto = CreateApplicationCommentPayload;
