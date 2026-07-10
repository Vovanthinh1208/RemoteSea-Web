// Compat shim — the implementation now lives in users.service.ts.
export { updateMyName, changeMyPassword, deleteMyAccount } from "@/features/users/users.service";
export type { ChangePasswordPayload } from "@/features/users/users.service";
