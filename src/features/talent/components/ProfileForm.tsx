import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowUpRight, Eye } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { SkillTagEditor } from "@/components/shared/SkillTagEditor";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useUpdateMyTalentProfile } from "@/features/talent/talent.queries";
import { useUpdateMyName } from "@/features/users/users.queries";
import { useSkills } from "@/features/taxonomy/taxonomy.queries";
import { ApiError } from "@/core/errors/api-error";
import { applyServerErrors } from "@/utils/form-errors";
import { reportError } from "@/services/monitoring";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ProfileFormNav } from "@/features/talent/components/profile-form/ProfileFormNav";
import { BasicsSection } from "@/features/talent/components/profile-form/BasicsSection";
import { AboutSection } from "@/features/talent/components/profile-form/AboutSection";
import { ExperienceSection } from "@/features/talent/components/profile-form/ExperienceSection";
import { PreferencesSection } from "@/features/talent/components/profile-form/PreferencesSection";
import { LinksSection } from "@/features/talent/components/profile-form/LinksSection";
import { HighlightsSection } from "@/features/talent/components/profile-form/HighlightsSection";
import { VisibilitySection } from "@/features/talent/components/profile-form/VisibilitySection";
import {
  LABEL_TO_LEVEL,
  LEVEL_TO_LABEL,
  NOTICE_PERIOD_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
  RIGHT_TO_WORK_OPTIONS,
  TIMEZONE_OPTIONS,
  bucketToYears,
  normalizeUrl,
  yearsToBucket,
} from "@/features/talent/talent.constants";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/talent/talent.schemas";
import { ROUTES } from "@/constants/routes";
import type {
  EmploymentType,
  TalentProfile,
  TimezoneOverlap,
} from "@/types/talent";

interface ProfileFormProps {
  profile: TalentProfile | null;
}

// Single source for the profile → form-values mapping, used both to seed
// `defaultValues` and to `reset()` when a fresh/normalized profile arrives from
// the cache. It was previously written out twice (14 fields each) and had already
// drifted — one copy fell back to "MID"/`true`, the other to "Mid"/nothing —
// which only stayed harmless because the reset copy runs under an `if (profile)`
// guard. The null-safe form here is a strict superset of both.
const profileToFormValues = (
  profile: TalentProfile | null
): ProfileFormValues => ({
  name: profile?.user?.name ?? "",
  headline: profile?.headline ?? "",
  location: profile?.location ?? "",
  timezone: profile?.timezone ?? TIMEZONE_OPTIONS[0],
  bio: profile?.bio ?? "",
  seniority: LEVEL_TO_LABEL[profile?.level ?? "MID"],
  yearsBucket: yearsToBucket(profile?.yearsExperience ?? null),
  desiredSalaryMin: profile?.desiredSalaryMin ?? 1000,
  desiredSalaryMax: profile?.desiredSalaryMax ?? 3000,
  isOpenToWork: profile?.isOpenToWork ?? true,
  visibility: profile?.visibility ?? "PUBLIC",
  primaryRole: profile?.primaryRole ?? PRIMARY_ROLE_OPTIONS[0],
  rightToWork: profile?.rightToWork ?? RIGHT_TO_WORK_OPTIONS[0],
  noticePeriod: profile?.noticePeriod ?? NOTICE_PERIOD_OPTIONS[0],
  resumeUrl: profile?.resumeUrl ?? "",
  githubUrl: profile?.githubUrl ?? "",
  linkedinUrl: profile?.linkedinUrl ?? "",
  portfolioUrl: profile?.portfolioUrl ?? "",
});

export const ProfileForm = ({ profile }: ProfileFormProps) => {
  const { toast } = useToast();
  // Memoized so its identity only changes when `profile` itself changes (a
  // fresh save, a refetch) — not on every render — which is what lets
  // useSyncedState tell "profile changed" apart from "component re-rendered".
  const profileSkills = useMemo(
    () => profile?.skills.map((s) => s.skill.name) ?? [],
    [profile]
  );
  const [skills, setSkills] = useSyncedState<string[]>(profileSkills);
  const profileEmploymentTypes = useMemo(
    () => profile?.employmentTypes ?? [],
    [profile]
  );
  const [employmentTypes, setEmploymentTypes] = useSyncedState<
    EmploymentType[]
  >(profileEmploymentTypes);
  const profileTimezoneOverlap = useMemo(
    () => profile?.timezoneOverlap ?? [],
    [profile]
  );
  const [timezoneOverlap, setTimezoneOverlap] = useSyncedState<
    TimezoneOverlap[]
  >(profileTimezoneOverlap);
  const { data: allSkills, isError: skillsErrored } = useSkills();
  const updateProfileMutation = useUpdateMyTalentProfile();
  const updateNameMutation = useUpdateMyName();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileToFormValues(profile),
  });

  useEffect(() => {
    if (!profile) return;
    reset(profileToFormValues(profile));
    // Depend on the whole `profile` object, not just its id: a successful save
    // writes the server's (possibly normalized) response into the cache under the
    // same id, and the form should pick that up rather than keep showing the
    // un-normalized values the user originally typed. (Skills sync separately,
    // during render, via useSyncedState above.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const [
    name,
    headline,
    bio,
    salMin,
    salMax,
    isOpenToWork,
    visibility,
    resumeUrl,
  ] = watch([
    "name",
    "headline",
    "bio",
    "desiredSalaryMin",
    "desiredSalaryMax",
    "isOpenToWork",
    "visibility",
    "resumeUrl",
  ]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (skills.length > 0 && !allSkills) {
      toast({
        variant: "error",
        title: skillsErrored
          ? "Couldn't load the skills list"
          : "Still loading the skills list",
        description:
          "Your selected skills can't be saved yet — please try again in a moment.",
      });
      return;
    }
    const skillIndex = Object.fromEntries(
      (allSkills ?? []).map((s) => [s.name.toLowerCase(), s.id])
    );
    const skillPayload = skills
      .map((s) => skillIndex[s.toLowerCase()])
      .filter((id): id is string => Boolean(id))
      .map((skillId) => ({ skillId }));

    let nameUpdated = false;
    try {
      if (values.name !== (profile?.user?.name ?? "")) {
        await updateNameMutation.mutateAsync(values.name);
        nameUpdated = true;
      }
      await updateProfileMutation.mutateAsync({
        headline: values.headline || undefined,
        bio: values.bio || undefined,
        location: values.location || undefined,
        timezone: values.timezone || undefined,
        level: LABEL_TO_LEVEL[values.seniority],
        yearsExperience: bucketToYears(values.yearsBucket),
        desiredSalaryMin: values.desiredSalaryMin,
        desiredSalaryMax: values.desiredSalaryMax,
        isOpenToWork: values.isOpenToWork,
        visibility: values.visibility,
        primaryRole: values.primaryRole,
        rightToWork: values.rightToWork,
        noticePeriod: values.noticePeriod,
        employmentTypes,
        timezoneOverlap,
        resumeUrl: normalizeUrl(values.resumeUrl ?? ""),
        githubUrl: normalizeUrl(values.githubUrl ?? ""),
        linkedinUrl: normalizeUrl(values.linkedinUrl ?? ""),
        portfolioUrl: normalizeUrl(values.portfolioUrl ?? ""),
        skills: skillPayload,
      });
      toast({ variant: "success", title: "Profile saved" });
    } catch (err) {
      reportError(err);
      if (err instanceof ApiError) applyServerErrors(err, setError);
      toast({
        variant: "error",
        title: "Couldn't save profile",
        description: nameUpdated
          ? "Your name was updated, but the rest of the profile didn't save. Please try again."
          : "Please try again.",
      });
    }
  };

  const saving =
    isSubmitting ||
    updateProfileMutation.isPending ||
    updateNameMutation.isPending;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-neutral-500">
            <Link className="hover:text-neutral-700" to={ROUTES.talent}>
              ← Dashboard
            </Link>
            <span>·</span>
            <span>Profile setup</span>
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            Make sure recruiters{" "}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              see what matters.
            </em>
          </h1>
          <p className="text-[15px] text-neutral-500">
            Your profile is what gets surfaced to founders and hiring managers.
            Keep it honest, keep it short — they read dozens a day.
          </p>
          {/* ProfileFormNav (the section-jump sidebar) is hidden below lg —
              correct, a scroll-spy sidebar doesn't make sense once sections
              just stack — but "Preview as recruiter" lives nowhere else in
              the app, so hiding the whole nav also silently removed the
              only way to reach it on mobile. This is the one piece worth
              surfacing on its own down here; jumping between sections isn't
              worth the same treatment since scrolling already does that. */}
          {profile ? (
            <Link
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-600 hover:text-brand-700 lg:hidden"
              target="_blank"
              to={{
                pathname: ROUTES.talentProfile(profile.slug),
                search: "?preview=recruiter",
              }}
            >
              <Eye size={13} />
              Preview as recruiter
              <ArrowUpRight size={11} />
            </Link>
          ) : (
            <span
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-neutral-300 lg:hidden"
              title="Save your profile first"
            >
              <Eye size={13} />
              Preview as recruiter
              <ArrowUpRight size={11} />
            </span>
          )}
        </div>

        <form
          className="grid grid-cols-1 gap-8 lg:grid-cols-[180px_1fr]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <ProfileFormNav />

          {/* Sections */}
          <div className="space-y-2">
            <BasicsSection
              headlineError={errors.headline?.message}
              headlineLength={headline?.length ?? 0}
              name={name ?? ""}
              nameError={errors.name?.message}
              register={register}
            />

            <AboutSection
              bioError={errors.bio?.message}
              bioLength={bio?.length ?? 0}
              register={register}
            />

            <ExperienceSection />

            <section
              className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
              id="skills"
            >
              <SectionHead
                eyebrow="04 · What you use"
                help="5–12 specific skills. Tools and stacks, not soft skills. We match jobs based on this."
                title={
                  <em
                    className="font-serif italic text-brand-700"
                    style={EMPHASIS_STYLE}
                  >
                    Skills.
                  </em>
                }
              />
              <SkillTagEditor
                setSkills={setSkills}
                skills={skills}
                suggestions={(allSkills ?? []).map((s) => s.name)}
              />
            </section>

            <PreferencesSection
              employmentTypes={employmentTypes}
              onEmploymentTypesChange={setEmploymentTypes}
              onMaxChange={(v) => setValue("desiredSalaryMax", v)}
              onMinChange={(v) => setValue("desiredSalaryMin", v)}
              onTimezoneOverlapChange={setTimezoneOverlap}
              salMax={salMax}
              salMin={salMin}
              timezoneOverlap={timezoneOverlap}
            />

            <LinksSection
              onResumeUploaded={(url) => setValue("resumeUrl", url)}
              register={register}
              resumeUrl={resumeUrl ?? ""}
            />

            <HighlightsSection />

            <VisibilitySection
              isOpenToWork={isOpenToWork}
              onOpenToWorkChange={(v) => setValue("isOpenToWork", v)}
              onVisibilityChange={(v) => setValue("visibility", v)}
              visibility={visibility}
            />

            {/* Save bar */}
            <div className="sticky bottom-0 flex items-center justify-between rounded-20 border border-neutral-200 bg-white/90 px-5 py-3 shadow-card backdrop-blur-sm">
              <span className="flex items-center gap-2 text-[12.5px] text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                {saving ? "Saving…" : "Save your changes"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-10 border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <Link
                  className="inline-flex items-center gap-1.5 rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                  to={ROUTES.talent}
                >
                  Done <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
