import { usersRepository } from "@/features/users/users.repository";
import type {
  AccountFieldsDto,
  ChangePasswordRequestDto,
  ConnectionDto,
  ExportDataDto,
  NotificationPreferencesDto,
  PauseStateDto,
  RevokeOtherSessionsResponseDto,
  SessionDto,
  UpdateAccountPayload,
  UpdateNotificationPreferencesPayload,
  UpdatedUserDto,
} from "@/features/users/users.dto";

export type ChangePasswordPayload = ChangePasswordRequestDto;

export const updateMyName = async (name: string): Promise<UpdatedUserDto> =>
  usersRepository.updateMyName(name);

export const changeMyPassword = async (
  payload: ChangePasswordPayload
): Promise<{ message: string }> => usersRepository.changeMyPassword(payload);

export const deleteMyAccount = async (): Promise<{
  success: boolean;
}> => usersRepository.deleteMyAccount();

export const getMyAccount = async (): Promise<AccountFieldsDto> =>
  usersRepository.getAccount();

export const updateMyAccount = async (
  payload: UpdateAccountPayload
): Promise<AccountFieldsDto> => usersRepository.updateAccount(payload);

export const getMyNotificationPreferences =
  async (): Promise<NotificationPreferencesDto> =>
    usersRepository.getNotificationPreferences();

export const updateMyNotificationPreferences = async (
  payload: UpdateNotificationPreferencesPayload
): Promise<NotificationPreferencesDto> =>
  usersRepository.updateNotificationPreferences(payload);

export const getMyPauseState = async (): Promise<PauseStateDto> =>
  usersRepository.getPauseState();

export const pauseMyAccount = async (): Promise<PauseStateDto> =>
  usersRepository.pauseAccount();

export const reactivateMyAccount = async (): Promise<PauseStateDto> =>
  usersRepository.reactivateAccount();

export const exportMyData = async (): Promise<ExportDataDto> =>
  usersRepository.exportData();

export const listMyConnections = async (): Promise<ConnectionDto[]> =>
  usersRepository.listConnections();

export const disconnectMyConnection = async (
  provider: string
): Promise<{ success: boolean }> =>
  usersRepository.disconnectConnection(provider);

export const listMySessions = async (): Promise<SessionDto[]> =>
  usersRepository.listSessions();

export const revokeMySession = async (
  id: string
): Promise<{ success: boolean }> => usersRepository.revokeSession(id);

export const revokeMyOtherSessions =
  async (): Promise<RevokeOtherSessionsResponseDto> =>
    usersRepository.revokeOtherSessions();
