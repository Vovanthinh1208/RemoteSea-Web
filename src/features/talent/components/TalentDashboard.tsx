import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  Eye,
  Search,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTalentDashboard } from "@/features/talent/talent.queries";
import { CompletionRing } from "@/features/talent/components/talent-dashboard/CompletionRing";
import { StatCard } from "@/components/ui/stat-card";
import { ApplicationsTable } from "@/features/talent/components/talent-dashboard/ApplicationsTable";
import { RecommendedJobs } from "@/features/talent/components/talent-dashboard/RecommendedJobs";
import { ProfileSnapshot } from "@/features/talent/components/talent-dashboard/ProfileSnapshot";
import { InvitationsPanel } from "@/features/talent/components/talent-dashboard/InvitationsPanel";
import { AlertsPanel } from "@/features/talent/components/talent-dashboard/AlertsPanel";
import { ActivityFeed } from "@/features/talent/components/talent-dashboard/ActivityFeed";
import { TalentDashboardSkeleton } from "@/features/talent/components/talent-dashboard/TalentDashboardSkeleton";
import { VerifyEmailBanner } from "@/features/talent/components/talent-dashboard/VerifyEmailBanner";
import {
  missingProfileFields,
  profileCompletion,
} from "@/features/talent/talent-dashboard.utils";
import { ROUTES } from "@/constants/routes";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { percent } from "@/utils/percent";

const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 18;

export const TalentDashboard = () => {
  const { user } = useAuth();
  const {
    profile,
    applications: applicationsData,
    applicationStats: stats,
    savedJobIds,
    profileViewAnalytics,
    alerts,
    invitations,
    activity,
    isLoading,
    isError,
    refetch,
  } = useTalentDashboard();
  const applications = applicationsData?.applications ?? [];
  const activeAlertsCount = alerts?.filter((a) => a.isActive).length ?? 0;

  if (isLoading) {
    return <TalentDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <EmptyState
          action={
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
          description="Something went wrong loading your dashboard."
          title="Couldn't load your dashboard"
        />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < MORNING_END_HOUR
      ? "Chào buổi sáng"
      : hour < AFTERNOON_END_HOUR
        ? "Chào buổi chiều"
        : "Chào buổi tối";
  const totalApplications = stats?.total ?? 0;
  const interviewing = stats?.byStatus.INTERVIEW ?? 0;
  const offers = stats?.byStatus.OFFERED ?? 0;
  const completion = profileCompletion(profile);
  const missing = missingProfileFields(profile);
  const interviewRate = percent(interviewing + offers, totalApplications);

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      {profile && !profile.isVerified && (
        <VerifyEmailBanner
          verificationEmail={profile.verificationEmail ?? null}
          verificationStatus={profile.verificationStatus ?? "NOT_SUBMITTED"}
        />
      )}

      {/* Greeting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
            Dashboard
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            {greeting},{" "}
            <em className="font-serif-italic text-brand-700">
              {user?.name ?? "there"}
            </em>
            .
          </h1>
          <p className="text-[14px] text-neutral-500">
            You have{" "}
            <strong className="font-semibold text-neutral-800">
              {interviewing} {interviewing === 1 ? "interview" : "interviews"}{" "}
              in progress
            </strong>{" "}
            and {offers} {offers === 1 ? "offer" : "offers"} on the table.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            )}
            to={ROUTES.alerts}
          >
            <Bell size={14} />
            Alerts
            {activeAlertsCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                {activeAlertsCount}
              </span>
            )}
          </Link>
          <Link className={buttonVariants()} to={ROUTES.jobs}>
            <Search size={14} /> Browse jobs
          </Link>
        </div>
      </div>

      {/* Profile completion banner */}
      {completion < 100 && (
        <div className="mb-6 flex flex-col items-start gap-4 rounded-20 border border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center">
          <CompletionRing pct={completion} />
          <div className="flex-1">
            <h3 className="mb-0.5 text-[14px] font-semibold text-neutral-900">
              Your profile is{" "}
              <em className="font-serif-italic text-brand-700">
                {completion}% complete
              </em>
            </h3>
            <p className="text-[13px] text-neutral-500">
              {missing.length > 0 ? (
                <>
                  Add{" "}
                  {missing.map((m, i) => (
                    <strong className="text-neutral-700" key={m}>
                      {i > 0 ? ", " : ""}
                      {m}
                    </strong>
                  ))}{" "}
                  to show up in more searches.
                </>
              ) : (
                "Nice — your profile is in good shape."
              )}
            </p>
          </div>
          <Link
            className={cn(buttonVariants(), "flex-shrink-0")}
            to={ROUTES.profile}
          >
            Complete profile <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={Briefcase}
          label="Applications sent"
          size="md"
          sub="all time"
          value={totalApplications}
        />
        <StatCard
          icon={Bookmark}
          label="Saved jobs"
          size="md"
          sub="current"
          value={savedJobIds === null ? "—" : savedJobIds.length}
        />
        <StatCard
          icon={Bell}
          label="Job alerts"
          size="md"
          sub="active"
          value={activeAlertsCount}
        />
        <StatCard
          icon={TrendingUp}
          label="Interview rate"
          size="md"
          sub="of submitted"
          value={`${interviewRate}%`}
        />
        <StatCard
          icon={Eye}
          label="Profile views"
          size="md"
          sub={
            profileViewAnalytics
              ? `${profileViewAnalytics.uniqueViewers} unique`
              : undefined
          }
          value={profileViewAnalytics ? profileViewAnalytics.totalViews : "—"}
        />
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div>
          <ApplicationsTable applications={applications} />
          <RecommendedJobs applications={applications} />
        </div>
        <div>
          <ProfileSnapshot profile={profile} />
          <InvitationsPanel
            invitations={invitations}
            isError={isError}
            refetch={refetch}
          />
          <AlertsPanel
            alerts={alerts}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
          />
          <ActivityFeed
            activity={activity}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  );
};
