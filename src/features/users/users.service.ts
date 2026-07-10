import { usersRepository } from "@/features/users/users.repository";
import type { ChangePasswordRequestDto, UpdatedUserDto } from "@/features/users/users.dto";

export type ChangePasswordPayload = ChangePasswordRequestDto;

export const updateMyName = async (name: string): Promise<UpdatedUserDto> =>
  usersRepository.updateMyName(name);

export const changeMyPassword = async (
  payload: ChangePasswordPayload
): Promise<{ message: string }> => usersRepository.changeMyPassword(payload);

export const deleteMyAccount = async (): Promise<{ success: boolean }> =>
  usersRepository.deleteMyAccount();
