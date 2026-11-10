import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEmployerJobs } from "@/features/employer/employer.queries";
import { useSendInvitation } from "./invitations.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useTranslation } from "@/i18n/useTranslation";

export const InviteTalentDialog = ({
  talentId,
  initialJobId,
  onClose,
  onSent,
}: {
  talentId: string;
  initialJobId?: string;
  onClose: () => void;
  onSent?: () => void;
}) => {
  const { t } = useTranslation("employer");
  const dialog = useRef<HTMLDialogElement>(null);
  const [jobId, setJobId] = useState(initialJobId ?? "");
  const [message, setMessage] = useState("");
  const jobs = useEmployerJobs();
  const send = useSendInvitation();
  const runWithToast = useToastMutation();
  const active = (jobs.data?.jobs ?? []).filter(
    (job) => job.status === "ACTIVE"
  );
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="invite-dialog-title"
      onCancel={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-16 border p-6 shadow-card-lg backdrop:bg-black/40"
    >
      <h2 id="invite-dialog-title" className="mb-4 text-xl font-semibold">
        {t("invite.title")}
      </h2>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (send.isPending || !active.some((job) => job.id === jobId)) return;
          const ok = await runWithToast(
            () =>
              send.mutateAsync({
                jobId,
                talentId,
                message: message.trim() || undefined,
              }),
            { success: t("search.inviteSent"), error: t("search.inviteFailed") }
          );
          if (ok) {
            onSent?.();
            onClose();
          }
        }}
      >
        {jobs.isLoading ? (
          <p role="status">{t("invite.loading")}</p>
        ) : jobs.isError ? (
          <div role="alert">
            <p>{t("invite.error")}</p>
            <Button type="button" onClick={() => void jobs.refetch()}>
              {t("common.actions.retry")}
            </Button>
          </div>
        ) : !active.length ? (
          <p>{t("invite.empty")}</p>
        ) : (
          <label className="block text-sm">
            {t("invite.job")}
            <select
              required
              className="mt-1 w-full rounded border p-2"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              <option value="">{t("invite.choose")}</option>
              {active.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm">
          {t("invite.message")}
          <textarea
            maxLength={2000}
            className="mt-1 w-full rounded border p-2"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={send.isPending}
            onClick={onClose}
          >
            {t("common.actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={send.isPending || !active.some((job) => job.id === jobId)}
            isLoading={send.isPending}
          >
            {t("invite.send")}
          </Button>
        </div>
      </form>
    </dialog>
  );
};
