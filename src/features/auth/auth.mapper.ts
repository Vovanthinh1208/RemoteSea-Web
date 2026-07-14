import type { AuthUserDto } from "@/features/auth/auth.dto";
import type { AuthUser } from "@/types/user";

// Identity today — see jobs.mapper.ts for why this seam exists even when it's a no-op.
export const toAuthUser = (dto: AuthUserDto): AuthUser => dto;
