import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProposeInterview } from "@/features/interviews/interview.queries";
import { useTeamMembers } from "@/features/team/team.queries";
import {
  DURATION_OPTIONS,
  INTERVIEW_PLATFORMS,
  isPastLocalSlot,
  MAX_SLOTS,
  slotEndTime,
  toLocalInputValue,
} from "@/features/interviews/interview.utils";
import { FieldLabel } from "@/features/interviews/components/FieldLabel";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/shared/FieldError";
import {
  TEXT_INPUT_CLASS,
  SELECT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import { isHttpUrl } from "@/utils/safe-url";
import type { Interview, InterviewPlatform } from "@/types/interview";
import { useTranslation } from "@/i18n/useTranslation";

const TITLE_MAX_LENGTH = 120;

export const ProposeInterviewForm = ({
  applicationId,
  existing,
}: {
  applicationId: string;
  existing: Interview | null;
}) => {
  const { t } = useTranslation("interviews");
  const { user } = useAuth();
  const proposeMutation = useProposeInterview(applicationId);
  const { data: teamMembers } = useTeamMembers();
  const runWithToast = useToastMutation();
  // PB60 AC2: title, platform, meeting link and the company interviewer.
  const [title, setTitle] = useState(existing?.title ?? "");
  const [platform, setPlatform] = useState<InterviewPlatform>(
    existing?.platform ?? "GOOGLE_MEET"
  );
  const [interviewerId, setInterviewerId] = useState(
    existing?.interviewerId ?? user?.id ?? ""
  );
  const [duration, setDuration] = useState(existing?.durationMinutes ?? 30);
  const [slots, setSlots] = useState<string[]>(
    existing ? existing.proposedSlots.map(toLocalInputValue) : [""]
  );
  const [meetingUrl, setMeetingUrl] = useState(existing?.meetingUrl ?? "");
  const [submitted, setSubmitted] = useState(false);

  const updateSlot = (index: number, value: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeSlot = (index: number) => {
    setSlots((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const filled = slots.filter(Boolean);
  // PB60 BR2: every proposed time must be in the future.
  const hasPastSlot = filled.some(isPastLocalSlot);
  const errors = {
    title: !title.trim() ? t("propose.titleRequired") : undefined,
    meetingUrl: !isHttpUrl(meetingUrl.trim())
      ? t("propose.linkRequired")
      : undefined,
    slots:
      filled.length === 0
        ? t("propose.slotRequired")
        : hasPastSlot
          ? t("propose.slotPast")
          : undefined,
  };
  const isValid = !errors.title && !errors.meetingUrl && !errors.slots;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    await runWithToast(
      () =>
        proposeMutation.mutateAsync({
          title: title.trim(),
          platform,
          meetingUrl: meetingUrl.trim(),
          interviewerId: interviewerId || undefined,
          durationMinutes: duration,
          proposedSlots: filled.map((s) => new Date(s).toISOString()),
        }),
      {
        success: existing ? t("propose.updated") : t("propose.proposed"),
        error: t("propose.failed"),
      }
    );
  };

  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <FieldLabel htmlFor="interview-title">{t("propose.title")}</FieldLabel>
        <input
          aria-invalid={submitted && !!errors.title}
          className={TEXT_INPUT_CLASS}
          id="interview-title"
          maxLength={TITLE_MAX_LENGTH}
          placeholder={t("propose.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {submitted && <FieldError message={errors.title} />}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="interview-platform">
            {t("propose.platform")}
          </FieldLabel>
          <select
            className={SELECT_INPUT_CLASS}
            id="interview-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as InterviewPlatform)}
          >
            {INTERVIEW_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {t(`platform.${p}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="interview-interviewer">
            {t("propose.interviewer")}
          </FieldLabel>
          <select
            className={SELECT_INPUT_CLASS}
            id="interview-interviewer"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
          >
            <option value="">{t("propose.unassigned")}</option>
            {(teamMembers ?? []).map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.name ?? member.user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="interview-meeting-url">
          {t("propose.meetingLink")}
        </FieldLabel>
        <input
          aria-invalid={submitted && !!errors.meetingUrl}
          className={TEXT_INPUT_CLASS}
          id="interview-meeting-url"
          placeholder="https://meet.google.com/..."
          type="url"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />
        {submitted && <FieldError message={errors.meetingUrl} />}
      </div>

      <div>
        <FieldLabel htmlFor="interview-duration">
          {t("propose.duration")}
        </FieldLabel>
        <select
          className={SELECT_INPUT_CLASS}
          id="interview-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {DURATION_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {t("propose.minutes", { n: m })}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div>
          <span className="block text-[12.5px] font-medium text-neutral-700">
            {t("propose.times")}
          </span>
          <span className="text-[11.5px] text-neutral-400">
            {t("propose.hint")}
          </span>
        </div>
        {slots.map((slot, i) => (
          <div className="flex flex-wrap items-center gap-1.5" key={i}>
            <input
              aria-label={t("propose.slotStart", { n: i + 1 })}
              className={`${TEXT_INPUT_CLASS} min-w-0 flex-1`}
              type="datetime-local"
              value={slot}
              onChange={(e) => updateSlot(i, e.target.value)}
            />
            {slot && (
              <span className="text-[12px] text-neutral-500">
                {t("propose.endsAt", { time: slotEndTime(slot, duration) })}
              </span>
            )}
            {slots.length > 1 && (
              <button
                aria-label={t("propose.remove")}
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={() => removeSlot(i)}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {submitted && <FieldError message={errors.slots} />}
        {slots.length < MAX_SLOTS && (
          <button
            className="rounded-8 text-[12.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => setSlots((prev) => [...prev, ""])}
          >
            {t("propose.addOption")}
          </button>
        )}
      </div>

      <Button
        disabled={proposeMutation.isPending}
        isLoading={proposeMutation.isPending}
        type="submit"
      >
        {existing ? t("propose.update") : t("propose.send")}
      </Button>
    </form>
  );
};
