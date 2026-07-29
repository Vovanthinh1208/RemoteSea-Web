import { z, type ZodType } from "zod";
import type { AuthUser, UserRole } from "@/types/user";

export type LoginPayload = { email: string; password: string };
export type LoginResponseDto =
  { accessToken: string } | { twoFactorRequired: true; challengeToken: string };

export type TwoFactorChallengePayload = { challengeToken: string; code: string };
export type TwoFactorChallengeResponseDto = { accessToken: string };

export type TwoFactorStatusDto = { enabled: boolean };
export type TwoFactorSetupDto = { secret: string; otpauthUrl: string; qrCodeDataUrl: string };
export type TwoFactorVerifyPayload = { token: string };
export type TwoFactorVerifyResponseDto = { backupCodes: string[] };
export type TwoFactorDisablePayload = { password: string };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "TALENT" | "EMPLOYER">;
};
export type RegisterResponseDto = { id: string; email: string; name: string; role: UserRole };

export type ResetPasswordPayload = { token: string; password: string };
export type OAuthProvider = "google" | "github" | "linkedin";

export type OAuthLinkUrlDto = { url: string };

// Wire shape of GET /auth/session — identical to AuthUser today (see auth.mapper.ts).
export type AuthUserDto = AuthUser;
export type SessionResponseDto = { user: AuthUserDto | null };

// Loose on purpose: AuthContext's whole 4-state status machine only branches on `id`
// and `role` (see AuthContext.tsx's hydrateFromSession/status derivation). zod's default
// "strip" mode already drops unrecognized keys instead of failing on them, so an
// additive backend field can never break login — this schema exists to catch the one
// failure mode that actually matters: a session response missing the fields the app
// reads to decide who's logged in and what they can do.
const authUserSchema: ZodType<AuthUserDto> = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["TALENT", "EMPLOYER", "ADMIN"]),
});

export const sessionResponseSchema: ZodType<SessionResponseDto> = z.object({
  user: authUserSchema.nullable(),
});
