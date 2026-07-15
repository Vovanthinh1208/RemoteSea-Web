import { Link } from "react-router-dom";
import { Briefcase, Clock, Plus, ShieldCheck, Star, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEmployerApplicationsAggregate,
  useEmployerJobs,
  useEmployerProfile,
} from "@/features/employer/employer.queries";
import { StatCard } from "@/components/ui/stat-card";
import { ListingsPanel } from "@/features/employer/components/employer-dashboard/ListingsPanel";
import { ApplicantsPanel } from "@/features/employer/components/employer-dashboard/ApplicantsPanel";
import { CompanyCard } from "@/features/employer/components/employer-dashboard/CompanyCard";
import { FunnelPanel } from "@/features/employer/components/employer-dashboard/FunnelPanel";
import { EmployerDashboardSkeleton } from "@/features/employer/components/employer-dashboard/EmployerDashboardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";

const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 18;

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileErrored,
    refetch: refetchProfile,
  } = useEmployerProfile();
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsErrored,
    refetch: refetchJobs,
  } = useEmployerJobs();
  const {
    applications,
    byJobId,
    isLoading: applicationsLoading,
    isError: applicationsErrored,
    refetchAll: refetchApplications,
  } = useEmployerApplicationsAggregate();

  if (profileLoading || jobsLoading || applicationsLoading) {
    return <EmployerDashboardSkeleton />;
  }

  if (profileErrored || jobsErrored) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <div className="mx-auto max-w-[1240px] px-6 py-8">
          <EmptyState
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void refetchProfile();
                  void refetchJobs();
                }}
              >
                Try again
              </Button>
            }
            description="Something went wrong loading your dashboard."
            title="Couldn't load your dashboard"
          />
        </div>
      </div>
    );
  }

  const jobs = jobsData?.jobs ?? [];
  const stats = jobsData?.stats ?? { totalApps: 0, shortlisted: 0, avgTimeToHireInDays: 0 };
  const activeListings = jobs.filter((j) => j.status === "ACTIVE").length;
  const inReview = jobs.filter((j) => j.status === "PENDING_REVIEW").length;

  const hour = new Date().getHours();
  const greeting =
    hour < MORNING_END_HOUR
      ? "Good morning"
      : hour < AFTERNOON_END_HOUR
        ? "Good afternoon"
        : "Good evening";
  const firstName = (user?.name ?? "there").split(" ").slice(-1)[0] ?? user?.name ?? "there";

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto max-w-[1240px] px-6 py-8">
        {!profile && (
          <div className="rounded-20 mb-6 flex items-start gap-4 border border-amber-200 bg-amber-50 p-5">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
                Set up your company profile
              </h3>
              <p className="text-[13px] text-neutral-600">
                Create your employer profile to post jobs and receive applications.
              </p>
            </div>
            <Link className={buttonVariants({ size: "sm" })} to="/post-job">
              Get started
            </Link>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
              Employer dashboard
            </div>
            <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
              {greeting}, <em className="font-serif-italic text-brand-700">{firstName}.</em>
            </h1>
            <p className="text-[15px] text-neutral-500">
              You have <strong className="text-neutral-900">{stats.totalApps} applicants</strong>{" "}
              across <strong className="text-neutral-900">{activeListings}</strong> live
              {activeListings === 1 ? " role" : " roles"}.
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-neutral-700">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[10px] font-bold text-white">
                  {profile.companyName.charAt(0).toUpperCase()}
                </div>
                {profile.companyName}
                {profile.isVerified && (
                  <span className="flex items-center gap-0.5 text-brand-600">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <Link className={buttonVariants()} to="/post-job">
                <Plus size={13} /> Post a job
              </Link>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label="Active listings"
            size="lg"
            sub={`${inReview} in review`}
            value={activeListings}
          />
          <StatCard
            icon={Users}
            label="Total applications"
            size="lg"
            sub="all listings"
            value={stats.totalApps}
          />
          <StatCard
            icon={Star}
            label="Shortlisted"
            size="lg"
            sub="across roles"
            value={stats.shortlisted}
          />
          <StatCard
            icon={Clock}
            label="Avg. time to hire"
            size="lg"
            sub="from apply to offer"
            value={stats.avgTimeToHireInDays ? `${stats.avgTimeToHireInDays}d` : "—"}
          />
        </div>

        {applicationsErrored && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-16 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            Some applicant data couldn't load, so counts below may be incomplete.
            <Button size="sm" variant="outline" onClick={refetchApplications}>
              Retry
            </Button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ListingsPanel applicationsByJob={byJobId} jobs={jobs} />
            <ApplicantsPanel applicants={applications} />
          </div>

          <div className="space-y-4">
            {profile && <CompanyCard company={profile} />}
            <FunnelPanel applicants={applications} />
          </div>
        </div>
      </div>
    </div>
  );
};
