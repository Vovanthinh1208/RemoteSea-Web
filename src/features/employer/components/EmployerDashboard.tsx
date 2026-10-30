import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  CalendarClock,
  Clock,
  Plus,
  Search,
  Star,
  Timer,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerDashboard } from "@/features/employer/employer.queries";
import { useMyCompanyRole } from "@/features/team/team.queries";
import { useToast } from "@/components/ui/toast";
import { StatCard } from "@/components/ui/stat-card";
import { ListingsPanel } from "@/features/employer/components/employer-dashboard/ListingsPanel";
import { ApplicantsPanel } from "@/features/employer/components/employer-dashboard/ApplicantsPanel";
import { CompanyCard } from "@/features/employer/components/employer-dashboard/CompanyCard";
import { VerifyCompanyBanner } from "@/features/employer/components/employer-dashboard/VerifyCompanyBanner";
import { FunnelPanel } from "@/features/employer/components/employer-dashboard/FunnelPanel";
import { EmployerDashboardSkeleton } from "@/features/employer/components/employer-dashboard/EmployerDashboardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { GradientInitial } from "@/components/ui/gradient-initial";
import { ROUTES } from "@/constants/routes";
import { VerifiedInline } from "@/components/shared/VerifiedInline";
import { formatResponseTime } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";

const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 18;

export const EmployerDashboard = () => {
  const { t, formatNumber } = useTranslation("employer");
  const { user } = useAuth();
  const memberRole = useMyCompanyRole();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutCancelled = searchParams.get("checkout") === "cancelled";

  // Stripe's cancel_url (PB43): say the job is still an unpaid draft, once,
  // then drop the flag so a refresh doesn't repeat it.
  useEffect(() => {
    if (!checkoutCancelled) return;
    toast({
      variant: "info",
      title: t("listings.payCancelledTitle"),
      description: t("listings.payCancelledDesc"),
    });
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkout");
        return next;
      },
      { replace: true }
    );
  }, [checkoutCancelled, setSearchParams, t, toast]);

  const {
    profile,
    jobs: jobsData,
    applications,
    byJobId,
    funnel,
    isLoading,
    isError,
    refetch,
  } = useEmployerDashboard();

  if (isLoading) {
    return <EmployerDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-[1240px] px-6 py-8">
          <EmptyState
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
              >
                {t("common.actions.retry")}
              </Button>
            }
            description={t("dash.errorDesc")}
            title={t("dash.errorTitle")}
          />
        </div>
      </div>
    );
  }

  const jobs = jobsData?.jobs ?? [];
  const stats = jobsData?.stats ?? {
    totalApps: 0,
    shortlisted: 0,
    avgTimeToHireInDays: 0,
    avgFirstResponseHours: 0,
  };
  const activeListings = jobs.filter((j) => j.status === "ACTIVE").length;
  const inReview = jobs.filter((j) => j.status === "PENDING_REVIEW").length;

  const hour = new Date().getHours();
  const greeting =
    hour < MORNING_END_HOUR
      ? t("dash.greetMorning")
      : hour < AFTERNOON_END_HOUR
        ? t("dash.greetAfternoon")
        : t("dash.greetEvening");
  const firstName =
    (user?.name ?? t("dash.there")).split(" ").slice(-1)[0] ??
    user?.name ??
    t("dash.there");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1240px] px-6 py-8">
        {!profile && (
          <div className="mb-6 flex items-start gap-4 rounded-20 border border-amber-200 bg-amber-50 p-5">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
                {t("dash.setupTitle")}
              </h3>
              <p className="text-[13px] text-neutral-600">
                {t("dash.setupDesc")}
              </p>
            </div>
            <Link
              className={buttonVariants({ size: "sm" })}
              to={ROUTES.postJob}
            >
              {t("dash.getStarted")}
            </Link>
          </div>
        )}

        {profile && !profile.isVerified && (
          <VerifyCompanyBanner
            verificationEmail={profile.verificationEmail}
            verificationStatus={profile.verificationStatus}
          />
        )}

        {/* Greeting */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
              {t("dash.eyebrow")}
            </div>
            <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
              {greeting},{" "}
              <em className="font-serif-italic text-brand-700">{firstName}.</em>
            </h1>
            <p className="text-[15px] text-neutral-500">
              {t("dash.summary", {
                applicants: t("dash.applicants", { count: stats.totalApps }),
                count: formatNumber(activeListings),
                roles: t("dash.role", { count: activeListings }),
              })}
            </p>
          </div>
          {profile && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-neutral-700">
                <GradientInitial className="h-5 w-5 rounded-full text-[10px]">
                  {profile.companyName.charAt(0).toUpperCase()}
                </GradientInitial>
                {profile.companyName}
                {profile.isVerified && <VerifiedInline />}
              </div>
              <Link
                className={buttonVariants({ variant: "outline" })}
                to={ROUTES.talentSearch}
              >
                <Search size={13} /> {t("dash.findTalent")}
              </Link>
              <Link className={buttonVariants()} to={ROUTES.postJob}>
                <Plus size={13} /> {t("dash.postJob")}
              </Link>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={Briefcase}
            label={t("dash.kpi.active")}
            size="lg"
            sub={t("dash.kpi.inReview", { count: inReview })}
            value={activeListings}
          />
          <StatCard
            icon={Users}
            label={t("dash.kpi.total")}
            size="lg"
            sub={t("dash.kpi.allListings")}
            value={stats.totalApps}
          />
          <StatCard
            icon={Star}
            label={t("dash.kpi.shortlisted")}
            size="lg"
            sub={t("dash.kpi.acrossRoles")}
            value={stats.shortlisted}
          />
          <StatCard
            icon={Clock}
            label={t("dash.kpi.timeToHire")}
            size="lg"
            sub={t("dash.kpi.applyToOffer")}
            value={
              stats.avgTimeToHireInDays
                ? t("common.format.days", { n: stats.avgTimeToHireInDays })
                : "—"
            }
          />
          <StatCard
            icon={Timer}
            label={t("dash.kpi.firstResponse")}
            size="lg"
            sub={t("dash.kpi.sla")}
            value={formatResponseTime(stats.avgFirstResponseHours)}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ListingsPanel
              applicationsByJob={byJobId}
              jobs={jobs}
              memberRole={memberRole}
            />
            <ApplicantsPanel applicants={applications} />
          </div>

          <div className="space-y-4">
            {profile && <CompanyCard company={profile} />}
            <Link
              className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 bg-white py-2.5 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.interviewSchedule}
            >
              <CalendarClock size={13} /> {t("dash.schedule")}
            </Link>
            <Link
              className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 bg-white py-2.5 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.team}
            >
              <Users size={13} /> {t("dash.team")}
            </Link>
            <FunnelPanel data={funnel} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
