import { apiClient } from "@/core/http/http-client";
import type { ChangePasswordRequestDto, UpdatedUserDto } from "@/features/users/users.dto";

export const usersRepository = {
  updateMyName: async (name: string): Promise<UpdatedUserDto> => {
    const { data } = await apiClient.patch<UpdatedUserDto>("/users/me", { name });
    return data;
  },

  changeMyPassword: async (payload: ChangePasswordRequestDto): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/users/me/password", payload);
    return data;
  },

  deleteMyAccount: async (): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>("/users/me");
    return data;
  },
};
