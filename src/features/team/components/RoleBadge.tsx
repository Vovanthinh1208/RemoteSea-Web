import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { CompanyMemberRole } from "@/types/team";

const ROLE_LABELS: Record<CompanyMemberRole, string> = {
  OWNER: "Owner",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring manager",
  INTERVIEWER: "Interviewer",
};

// OWNER reads as the "elevated" role (same brand-tinted treatment as
// Badge's other positive/verified states); every other role is a plain
// member-level role, so it gets the neutral chip rather than its own
// hand-rolled bordered variant.
const ROLE_BADGE_VARIANT: Record<CompanyMemberRole, BadgeVariant> = {
  OWNER: "positive",
  RECRUITER: "muted",
  HIRING_MANAGER: "muted",
  INTERVIEWER: "muted",
};

export const roleLabel = (role: CompanyMemberRole): string => ROLE_LABELS[role];

export const RoleBadge = ({ role }: { role: CompanyMemberRole }) => (
  <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
);
