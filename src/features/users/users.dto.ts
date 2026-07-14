import type { AuthUser } from "@/types/user";

export type UpdatedUserDto = Pick<AuthUser, "id" | "name" | "email">;
export type ChangePasswordRequestDto = { currentPassword: string; newPassword: string };
