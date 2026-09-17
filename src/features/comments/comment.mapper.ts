import type {
  CommentDto,
  CommentListResponseDto,
} from "@/features/comments/comment.dto";
import type {
  ApplicationComment,
  ApplicationCommentListResponse,
} from "@/types/comment";

export const toComment = (dto: CommentDto): ApplicationComment => dto;

export const toCommentListResponse = (
  dto: CommentListResponseDto
): ApplicationCommentListResponse => dto;
