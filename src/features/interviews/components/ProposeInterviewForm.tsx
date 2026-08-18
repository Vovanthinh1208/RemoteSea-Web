import { useState, type FormEvent } from "react";
import { useProposeInterview } from "@/features/interviews/interview.queries";
import {
  DURATION_OPTIONS,
  MAX_SLOTS,
  toLocalInputValue,
} from "@/features/interviews/interview.utils";
import { FieldLabel } from "@/features/interviews/components/FieldLabel";
import { Button } from "@/components/ui/button";
import {
  TEXT_INPUT_CLASS,
  SELECT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { Interview } from "@/types/interview";

export const ProposeInterviewForm = ({
  applicationId,
  existing,
}: {
  applicationId: string;
  existing: Interview | null;
}) => {
  const proposeMutation = useProposeInterview(applicationId);
  const runWithToast = useToastMutation();
  const [duration, setDuration] = useState(existing?.durationMinutes ?? 30);
  const [slots, setSlots] = useState<string[]>(
    existing ? existing.proposedSlots.map(toLocalInputValue) : [""]
  );
  const [meetingUrl, setMeetingUrl] = useState(existing?.meetingUrl ?? "");

  const updateSlot = (index: number, value: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const filled = slots.filter(Boolean);
    if (filled.length === 0) return;
    await runWithToast(
      () =>
        proposeMutation.mutateAsync({
          durationMinutes: duration,
          proposedSlots: filled.map((s) => new Date(s).toISOString()),
          meetingUrl: meetingUrl.trim() || undefined,
        }),
      {
        success: existing
          ? "Interview times updated"
          : "Interview times proposed",
        error: "Couldn't propose interview times",
      }
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <FieldLabel htmlFor="interview-duration">Duration</FieldLabel>
        <select
          className={SELECT_INPUT_CLASS}
          id="interview-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {DURATION_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} minutes
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="block text-[12.5px] font-medium text-neutral-700">
          Proposed times (1–2)
        </span>
        {slots.map((slot, i) => (
          <input
            className={TEXT_INPUT_CLASS}
            key={i}
            type="datetime-local"
            value={slot}
            onChange={(e) => updateSlot(i, e.target.value)}
          />
        ))}
        {slots.length < MAX_SLOTS && (
          <button
            className="text-[12.5px] font-medium text-brand-600 transition-colors hover:text-brand-700"
            type="button"
            onClick={() => setSlots((prev) => [...prev, ""])}
          >
            + Add another option
          </button>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="interview-meeting-url">
          Meeting link (optional)
        </FieldLabel>
        <input
          className={TEXT_INPUT_CLASS}
          id="interview-meeting-url"
          placeholder="https://meet.google.com/..."
          type="url"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />
      </div>

      <Button
        disabled={
          slots.filter(Boolean).length === 0 || proposeMutation.isPending
        }
        isLoading={proposeMutation.isPending}
        type="submit"
      >
        {existing ? "Update times" : "Send invitation"}
      </Button>
    </form>
  );
};
