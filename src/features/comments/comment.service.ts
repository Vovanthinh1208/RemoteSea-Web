import type { RequestOptions } from "@/core/http/request-config";
import { commentRepository } from "@/features/comments/comment.repository";
import {
  toComment,
  toCommentListResponse,
} from "@/features/comments/comment.mapper";
import type {
  ApplicationComment,
  ApplicationCommentListResponse,
  CreateApplicationCommentPayload,
} from "@/types/comment";

export const getComments = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<ApplicationCommentListResponse> =>
  toCommentListResponse(await commentRepository.list(applicationId, opts));

export const createComment = async (
  applicationId: string,
  payload: CreateApplicationCommentPayload
): Promise<ApplicationComment> =>
  toComment(await commentRepository.create(applicationId, payload));
