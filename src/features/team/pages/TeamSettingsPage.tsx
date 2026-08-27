import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTeamMembers } from "@/features/team/team.queries";
import { TeamMembersSection } from "@/features/team/components/TeamMembersSection";
import { InviteMemberSection } from "@/features/team/components/InviteMemberSection";
import { ROUTES } from "@/constants/routes";

export const TeamSettingsPage = () => {
  useDocumentTitle("Team — Company Settings");
  const { user } = useAuth();
  const { data: members } = useTeamMembers();

  const isOwner =
    !!user && members?.find((m) => m.userId === user.id)?.role === "OWNER";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[820px] px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-neutral-500">
            <Link
              className="rounded-8 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.employerDashboard}
            >
              ← Dashboard
            </Link>
            <span>·</span>
            <span>Company Settings</span>
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            Team <em className="font-serif-italic text-brand-700">members.</em>
          </h1>
          <p className="text-[15px] text-neutral-500">
            Everyone on this list signs in with their own account — access is
            based on their role, never shared credentials.
          </p>
        </div>

        <div className="space-y-5">
          {user && <TeamMembersSection currentUserId={user.id} />}
          {isOwner && <InviteMemberSection />}
        </div>
      </div>
    </div>
  );
};
