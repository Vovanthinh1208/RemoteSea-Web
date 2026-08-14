import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  InvitationDto,
  RespondInvitationRequestDto,
  RespondInvitationResponseDto,
  SendInvitationRequestDto,
} from "@/features/invitations/invitations.dto";

export const invitationsRepository = {
  send: async (payload: SendInvitationRequestDto): Promise<InvitationDto> => {
    const { data } = await apiClient.post<InvitationDto>(
      "/invitations",
      payload
    );
    return data;
  },

  listMine: async (opts?: RequestOptions): Promise<InvitationDto[]> => {
    const { data } = await apiClient.get<InvitationDto[]>("/invitations", {
      signal: opts?.signal,
    });
    return data;
  },

  respond: async (
    id: string,
    payload: RespondInvitationRequestDto
  ): Promise<RespondInvitationResponseDto> => {
    const { data } = await apiClient.patch<RespondInvitationResponseDto>(
      `/invitations/${id}`,
      payload
    );
    return data;
  },
};
