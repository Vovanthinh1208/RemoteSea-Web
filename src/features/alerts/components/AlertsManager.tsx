import { EmptyRow } from "@/components/shared/EmptyRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastMutation } from "@/hooks/useToastMutation";
import { AlertListItem } from "@/features/alerts/components/AlertListItem";
import { CreateAlertForm } from "@/features/alerts/components/CreateAlertForm";
import {
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  useSetAlertActive,
} from "@/features/alerts/alerts.queries";
import type { CreateAlertPayload, JobAlert } from "@/types/alert";

const ALERTS_SKELETON_COUNT = 3;

export const AlertsManager = () => {
  const runWithToast = useToastMutation();
  const { data: alerts, isLoading } = useAlerts();
  const createAlertMutation = useCreateAlert();
  const setActiveMutation = useSetAlertActive();
  const deleteAlertMutation = useDeleteAlert();

  // Returns success so the form only resets when the alert was actually
  // created — runWithToast swallows the error (into a toast) and never throws,
  // so without this the form reset unconditionally and wiped the user's input
  // even on failure.
  const handleCreate = (payload: CreateAlertPayload): Promise<boolean> =>
    runWithToast(() => createAlertMutation.mutateAsync(payload), {
      success: "Alert created",
      successDescription: "We'll email you matching jobs.",
      error: "Couldn't create alert",
    });

  const handleToggleActive = (alert: JobAlert) =>
    runWithToast(() => setActiveMutation.mutateAsync({ id: alert.id, isActive: !alert.isActive }), {
      error: "Couldn't update alert",
    });

  const handleDelete = async (alert: JobAlert): Promise<void> => {
    await runWithToast(() => deleteAlertMutation.mutateAsync(alert.id), {
      success: "Alert deleted",
      error: "Couldn't delete alert",
    });
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-[28px] font-semibold tracking-tight text-neutral-900">
          Job alerts
        </h1>
        <p className="text-[15px] text-neutral-500">
          Get notified when new jobs match your criteria. We email you on your chosen schedule.
        </p>
      </div>

      <CreateAlertForm onCreate={handleCreate} />

      <div className="space-y-3">
        {isLoading ? (
          // A skeleton instead of an EmptyRow-styled "Loading…" message —
          // otherwise this looked like a near-identical flicker of "empty"
          // state right before the real empty state, on a fast connection.
          Array.from({ length: ALERTS_SKELETON_COUNT }, (_, i) => (
            <Skeleton className="h-[72px] rounded-16" key={i} />
          ))
        ) : !alerts || alerts.length === 0 ? (
          <EmptyRow>No alerts yet. Create one above to start getting matched jobs.</EmptyRow>
        ) : (
          alerts.map((alert) => (
            <AlertListItem
              alert={alert}
              isDeleting={
                deleteAlertMutation.isPending && deleteAlertMutation.variables === alert.id
              }
              key={alert.id}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))
        )}
      </div>
    </div>
  );
};
