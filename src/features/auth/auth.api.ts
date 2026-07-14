// Compat shim — the implementation now lives in auth.service.ts (which composes
// auth.repository.ts + auth.mapper.ts). Kept so any existing import of
// "@/features/auth/auth.api" (AuthContext, ForgotPasswordForm, ResetPasswordForm,
// OAuthButtons) keeps working unchanged.
export {
  login,
  register,
  getSession,
  forgotPassword,
  resetPassword,
  oauthUrl,
} from "@/features/auth/auth.service";
export type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  OAuthProvider,
} from "@/features/auth/auth.service";
