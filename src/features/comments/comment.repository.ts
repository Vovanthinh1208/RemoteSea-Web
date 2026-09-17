import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CommentDto,
  CommentListResponseDto,
  CreateCommentRequestDto,
} from "@/features/comments/comment.dto";

// Employer-only — same reasoning as scorecardRepository: internal
// discussion is never shown to the talent, so there's no role-branching
// path the way interview.repository.ts needs.
export const commentRepository = {
  list: async (
    applicationId: string,
    opts?: RequestOptions
  ): Promise<CommentListResponseDto> => {
    const { data } = await apiClient.get<CommentListResponseDto>(
      `/employer/applications/${applicationId}/comments`,
      { signal: opts?.signal }
    );
    return data;
  },

  create: async (
    applicationId: string,
    body: CreateCommentRequestDto
  ): Promise<CommentDto> => {
    const { data } = await apiClient.post<CommentDto>(
      `/employer/applications/${applicationId}/comments`,
      body
    );
    return data;
  },
};
