import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useUpdateApplicationStatus } from "@/features/employer/employer.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";

interface CandidateNotesCardProps {
  applicant: ApplicantWithJob;
}

// Application.notes has always been writable (via PATCH /employer/applications/:id
// alongside a status change, through ConfirmAction's notePlaceholder) but was
// never fetched back or shown anywhere — this is the first UI that lets an
// employer see and edit it independent of a status change, by echoing the
// applicant's current status back on save (see EmployerService.updateApplication's
// notes-only guard: status === expectedStatus skips both the audit event and
// the talent-facing notification).
export const CandidateNotesCard = ({ applicant }: CandidateNotesCardProps) => {
  const [notes, setNotes] = useState(applicant.notes ?? "");
  const [dirty, setDirty] = useState(false);
  const updateStatus = useUpdateApplicationStatus();
  const runWithToast = useToastMutation();

  const handleSave = async (): Promise<void> => {
    const ok = await runWithToast(
      () =>
        updateStatus.mutateAsync({
          id: applicant.id,
          jobId: applicant.jobId,
          status: applicant.status,
          notes,
        }),
      {
        success: "Note saved.",
        error: "Couldn't save the note. Please try again.",
      }
    );
    if (ok) setDirty(false);
  };

  return (
    <div className="space-y-2 rounded-16 border border-neutral-100 bg-white p-4">
      <h3 className="text-[13.5px] font-medium text-neutral-900">
        Private notes
      </h3>
      <p className="text-[12px] text-neutral-400">
        Visible only to your team — never shown to the candidate.
      </p>
      <textarea
        className={TEXTAREA_INPUT_CLASS}
        placeholder="Add a note about this candidate…"
        rows={4}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setDirty(true);
        }}
      />
      {dirty && (
        <div className="flex justify-end">
          <Button
            disabled={updateStatus.isPending}
            isLoading={updateStatus.isPending}
            size="sm"
            type="button"
            onClick={handleSave}
          >
            Save note
          </Button>
        </div>
      )}
    </div>
  );
};
