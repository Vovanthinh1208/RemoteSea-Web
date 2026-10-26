import { lazy } from "react";
import {
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { RootLayout } from "@/layouts/RootLayout";
import { GuestOnlyRoute } from "@/router/GuestOnlyRoute";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { useAnalyticsPageview } from "@/hooks/useAnalyticsPageview";
import { isSprintBoardEnabled } from "@/features/sprints/sprint-visibility";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
);
const SprintBoardPage = lazy(() =>
  import("@/features/sprints/pages/SprintBoardPage").then((m) => ({
    default: m.SprintBoardPage,
  }))
);
const SalaryPage = lazy(() =>
  import("@/pages/SalaryPage").then((m) => ({
    default: m.SalaryPage,
  }))
);
const BlogPage = lazy(() =>
  import("@/pages/BlogPage").then((m) => ({ default: m.BlogPage }))
);
const CommunityPage = lazy(() =>
  import("@/pages/CommunityPage").then((m) => ({
    default: m.CommunityPage,
  }))
);

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const AuthCallbackPage = lazy(() =>
  import("@/features/auth/pages/AuthCallbackPage").then((m) => ({
    default: m.AuthCallbackPage,
  }))
);

const JobsPage = lazy(() =>
  import("@/features/jobs/pages/JobsPage").then((m) => ({
    default: m.JobsPage,
  }))
);
const JobDetailPage = lazy(() =>
  import("@/features/jobs/pages/JobDetailPage").then((m) => ({
    default: m.JobDetailPage,
  }))
);

const ProfilePage = lazy(() =>
  import("@/features/talent/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);
const TalentDashboardPage = lazy(() =>
  import("@/features/talent/pages/TalentDashboardPage").then((m) => ({
    default: m.TalentDashboardPage,
  }))
);
const PublicTalentProfilePage = lazy(() =>
  import("@/features/talent/pages/PublicTalentProfilePage").then((m) => ({
    default: m.PublicTalentProfilePage,
  }))
);
const TalentVerifyPage = lazy(() =>
  import("@/features/talent/pages/TalentVerifyPage").then((m) => ({
    default: m.TalentVerifyPage,
  }))
);

const EmployerMarketingPage = lazy(() =>
  import("@/features/employer/pages/EmployerMarketingPage").then((m) => ({
    default: m.EmployerMarketingPage,
  }))
);
const EmployerDashboardPage = lazy(() =>
  import("@/features/employer/pages/EmployerDashboardPage").then((m) => ({
    default: m.EmployerDashboardPage,
  }))
);
const TalentSearchPage = lazy(() =>
  import("@/features/employer/pages/TalentSearchPage").then((m) => ({
    default: m.TalentSearchPage,
  }))
);
const EditJobPage = lazy(() =>
  import("@/features/employer/pages/EditJobPage").then((m) => ({
    default: m.EditJobPage,
  }))
);
const CompanySettingsPage = lazy(() =>
  import("@/features/employer/pages/CompanySettingsPage").then((m) => ({
    default: m.CompanySettingsPage,
  }))
);
const ProfileViewsPage = lazy(() =>
  import("@/features/talent/pages/ProfileViewsPage").then((m) => ({
    default: m.ProfileViewsPage,
  }))
);
const TeamSettingsPage = lazy(() =>
  import("@/features/team/pages/TeamSettingsPage").then((m) => ({
    default: m.TeamSettingsPage,
  }))
);
const ApplicationWorkspacePage = lazy(() =>
  import("@/features/employer/hiring/pages/ApplicationWorkspacePage").then(
    (m) => ({ default: m.ApplicationWorkspacePage })
  )
);
const UpcomingInterviewsPage = lazy(() =>
  import("@/features/interviews/pages/UpcomingInterviewsPage").then((m) => ({
    default: m.UpcomingInterviewsPage,
  }))
);
const TeamInvitePage = lazy(() =>
  import("@/features/team/pages/TeamInvitePage").then((m) => ({
    default: m.TeamInvitePage,
  }))
);
const EmployerVerifyPage = lazy(() =>
  import("@/features/employer/pages/EmployerVerifyPage").then((m) => ({
    default: m.EmployerVerifyPage,
  }))
);
const CompanyProfilePage = lazy(() =>
  import("@/features/employer/pages/CompanyProfilePage").then((m) => ({
    default: m.CompanyProfilePage,
  }))
);
const PostJobPage = lazy(() =>
  import("@/features/post-job/pages/PostJobPage").then((m) => ({
    default: m.PostJobPage,
  }))
);
const PostJobSuccessPage = lazy(() =>
  import("@/features/post-job/pages/PostJobSuccessPage").then((m) => ({
    default: m.PostJobSuccessPage,
  }))
);

const AlertsPage = lazy(() =>
  import("@/features/alerts/pages/AlertsPage").then((m) => ({
    default: m.AlertsPage,
  }))
);

const SavedJobsPage = lazy(() =>
  import("@/features/saved/pages/SavedJobsPage").then((m) => ({
    default: m.SavedJobsPage,
  }))
);

const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  }))
);

const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

const MessageThreadPage = lazy(() =>
  import("@/features/messages/pages/MessageThreadPage").then((m) => ({
    default: m.MessageThreadPage,
  }))
);

const InterviewPage = lazy(() =>
  import("@/features/interviews/pages/InterviewPage").then((m) => ({
    default: m.InterviewPage,
  }))
);

const ApplicationDetailPage = lazy(() =>
  import("@/features/applications/pages/ApplicationDetailPage").then((m) => ({
    default: m.ApplicationDetailPage,
  }))
);

const AdminPage = lazy(() =>
  import("@/features/admin/pages/AdminPage").then((m) => ({
    default: m.AdminPage,
  }))
);

const TalentSlugRedirect = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  return <Navigate replace to={ROUTES.talentProfile(slug)} />;
};

// PB36 documents /team/invitation?token=…; the app uses /team/invitations/:token.
const TeamInvitationQueryRedirect = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  return (
    <Navigate replace to={token ? ROUTES.teamInvite(token) : ROUTES.home} />
  );
};

export const AppRouter = () => {
  useAnalyticsPageview();

  return (
    <Routes>
      <Route element={<RootLayout />} path="/">
        <Route index element={<HomePage />} />

        <Route element={<GuestOnlyRoute />}>
          <Route element={<LoginPage />} path="login" />
          <Route element={<RegisterPage />} path="register" />
          <Route element={<ForgotPasswordPage />} path="forgot-password" />
          <Route element={<ResetPasswordPage />} path="reset-password" />
        </Route>

        <Route element={<AuthCallbackPage />} path="auth/callback" />

        <Route element={<JobsPage />} path="jobs" />
        <Route element={<JobDetailPage />} path="jobs/:id" />

        {isSprintBoardEnabled() && (
          <Route element={<SprintBoardPage />} path="sprints" />
        )}
        <Route element={<SalaryPage />} path="salary" />
        <Route element={<BlogPage />} path="blog" />
        <Route element={<CommunityPage />} path="community" />

        <Route element={<EmployerMarketingPage />} path="employer" />
        <Route element={<EmployerVerifyPage />} path="employer/verify" />
        {/* Public — an invited person (possibly with no account yet, or an
            account under a different role) needs to reach this before/
            during sign-up, same reasoning as employer/verify above. */}
        <Route element={<TeamInvitePage />} path="team/invitations/:token" />
        <Route element={<PostJobSuccessPage />} path="post-job/success" />
        <Route element={<TalentVerifyPage />} path="talent/verify" />
        <Route element={<PublicTalentProfilePage />} path="talent/:slug" />
        <Route element={<CompanyProfilePage />} path="companies/:slug" />

        {/* post-job/alerts/settings are intentionally role-agnostic: creating an
            employer profile via the post-job wizard is how a user *becomes* an
            employer, and alerts/settings/notifications apply to any
            authenticated account. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PostJobPage />} path="post-job" />
          <Route element={<AlertsPage />} path="alerts" />
          <Route element={<SettingsPage />} path="settings" />
          <Route element={<SavedJobsPage />} path="saved" />
          <Route element={<NotificationsPage />} path="notifications" />
        </Route>

        <Route element={<ProtectedRoute roles={["TALENT"]} />}>
          <Route element={<ProfilePage />} path="profile" />
          <Route element={<ProfilePage />} path="talent/profile" />
          <Route element={<TalentDashboardPage />} path="talent" />
          <Route element={<ProfileViewsPage />} path="talent/profile/views" />
          <Route element={<ApplicationDetailPage />} path="applications/:id" />
        </Route>

        <Route element={<ProtectedRoute roles={["EMPLOYER"]} />}>
          <Route
            element={<EmployerDashboardPage />}
            path="employer-dashboard"
          />
          <Route
            element={<TalentSearchPage />}
            path="employer-dashboard/talent"
          />
          <Route
            element={<TeamSettingsPage />}
            path="employer-dashboard/team"
          />
          <Route
            element={<UpcomingInterviewsPage />}
            path="employer-dashboard/interviews"
          />
          <Route
            element={<ApplicationWorkspacePage />}
            path="employer-dashboard/applications/:id"
          />
          <Route element={<EditJobPage />} path="employer/jobs/:id/edit" />
          <Route
            element={<CompanySettingsPage />}
            path="employer/company/settings"
          />
        </Route>

        {/* Paths as written in the Product Backlog (PB26/28/29/30/34/35/36/
            41) → the app's actual routes, so a documented link still lands. */}
        <Route
          element={<Navigate replace to={ROUTES.talent} />}
          path="talent/dashboard"
        />
        <Route
          element={<Navigate replace to={ROUTES.talentSearch} />}
          path="talents"
        />
        <Route element={<TalentSlugRedirect />} path="talents/:slug" />
        <Route
          element={<Navigate replace to={ROUTES.employerDashboard} />}
          path="employer/dashboard"
        />
        <Route
          element={<Navigate replace to={ROUTES.team} />}
          path="employer/team"
        />
        <Route
          element={<Navigate replace to={ROUTES.postJob} />}
          path="employer/jobs/new"
        />
        <Route
          element={<Navigate replace to={ROUTES.postJob} />}
          path="employer/onboarding"
        />
        <Route
          element={<TeamInvitationQueryRedirect />}
          path="team/invitation"
        />

        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route element={<AdminPage />} path="admin" />
        </Route>

        {/* One shared thread page for both roles — the API enforces real
            authorization per-endpoint (message.repository.ts branches on
            role to pick the right one) regardless of what the frontend
            allows through here. */}
        <Route element={<ProtectedRoute roles={["TALENT", "EMPLOYER"]} />}>
          <Route
            element={<MessageThreadPage />}
            path="applications/:id/messages"
          />
          <Route
            element={<InterviewPage />}
            path="applications/:id/interview"
          />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
};
