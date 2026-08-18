import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  MessageDto,
  SendMessageRequestDto,
  ThreadResponseDto,
} from "@/features/messages/message.dto";
import type { UserRole } from "@/types/user";

// The one place allowed to know both URL shapes — talent and employer read/
// write the same thread through different, separately-authorized routes
// (see messages.controller.ts / employer.controller.ts on the API side).
// Exported for a direct unit test — this branch is the one piece of real
// logic this feature's two-controller split hinges on.
export const threadPath = (applicationId: string, role: UserRole): string =>
  role === "EMPLOYER"
    ? `/employer/applications/${applicationId}/messages`
    : `/applications/${applicationId}/messages`;

export const messageRepository = {
  list: async (
    applicationId: string,
    role: UserRole,
    opts?: RequestOptions
  ): Promise<ThreadResponseDto> => {
    const { data } = await apiClient.get<ThreadResponseDto>(
      threadPath(applicationId, role),
      { signal: opts?.signal }
    );
    return data;
  },

  send: async (
    applicationId: string,
    role: UserRole,
    body: SendMessageRequestDto
  ): Promise<MessageDto> => {
    const { data } = await apiClient.post<MessageDto>(
      threadPath(applicationId, role),
      body
    );
    return data;
  },
};
