import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTalentProfile } from "@/features/talent/talent.queries";
import {
  computeMatchScore,
  type MatchableJob,
  type MatchResult,
} from "@/features/matching/match.util";

// A profile with no skills yet scores almost entirely on neutral fallbacks —
// not a real match signal, so the badge stays hidden until there's something
// to actually compare against.
const MIN_SKILLS_FOR_MATCH = 1;

// Null result means "don't show a badge" (logged out, an employer viewing
// their own listings, a talent profile too sparse to score, or — for the
// detail page's still-loading job — nothing to score yet) — the caller
// doesn't need to know which.
export const useMyMatch = (
  job: MatchableJob | undefined
): MatchResult | null => {
  const { user } = useAuth();
  const { data: talent } = useMyTalentProfile();

  return useMemo(() => {
    if (!job || user?.role !== "TALENT" || !talent) return null;
    if (talent.skills.length < MIN_SKILLS_FOR_MATCH) return null;
    return computeMatchScore(job, talent);
  }, [job, user?.role, talent]);
};
