import { cn } from "@/utils/cn";
import type { CompanyMemberRole } from "@/types/team";

const ROLE_LABELS: Record<CompanyMemberRole, string> = {
  OWNER: "Owner",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring manager",
  INTERVIEWER: "Interviewer",
};

const ROLE_CLASSES: Record<CompanyMemberRole, string> = {
  OWNER: "border-brand-200 bg-brand-50 text-brand-700",
  RECRUITER: "border-neutral-200 bg-neutral-50 text-neutral-700",
  HIRING_MANAGER: "border-neutral-200 bg-neutral-50 text-neutral-700",
  INTERVIEWER: "border-neutral-200 bg-neutral-50 text-neutral-700",
};

export const roleLabel = (role: CompanyMemberRole): string => ROLE_LABELS[role];

export const RoleBadge = ({ role }: { role: CompanyMemberRole }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium",
      ROLE_CLASSES[role]
    )}
  >
    {ROLE_LABELS[role]}
  </span>
);
