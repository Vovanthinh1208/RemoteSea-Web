import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
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
import { useTranslation } from "@/i18n/useTranslation";

const ALERTS_SKELETON_COUNT = 3;

export const AlertsManager = () => {
  const { t } = useTranslation("alerts");
  const runWithToast = useToastMutation();
  const { data: alerts, isLoading, isError, refetch } = useAlerts();
  const createAlertMutation = useCreateAlert();
  const setActiveMutation = useSetAlertActive();
  const deleteAlertMutation = useDeleteAlert();

  // Returns success so the form only resets when the alert was actually
  // created — runWithToast swallows the error (into a toast) and never throws,
  // so without this the form reset unconditionally and wiped the user's input
  // even on failure.
  const handleCreate = (payload: CreateAlertPayload): Promise<boolean> =>
    runWithToast(() => createAlertMutation.mutateAsync(payload), {
      success: t("page.created"),
      successDescription: t("page.createdDesc"),
      error: t("page.createFailed"),
    });

  const handleToggleActive = (alert: JobAlert) =>
    runWithToast(
      () =>
        setActiveMutation.mutateAsync({
          id: alert.id,
          isActive: !alert.isActive,
        }),
      {
        error: t("page.updateFailed"),
      }
    );

  const handleDelete = async (alert: JobAlert): Promise<void> => {
    await runWithToast(() => deleteAlertMutation.mutateAsync(alert.id), {
      success: t("page.deleted"),
      error: t("page.deleteFailed"),
    });
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
          {t("page.title")}
        </h1>
        <p className="text-[15px] text-neutral-500">{t("page.desc")}</p>
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
        ) : isError ? (
          // Without this, a failed fetch fell through to the empty state below —
          // telling the user "No alerts yet" when their alerts actually just
          // failed to load, which could prompt them to recreate duplicates.
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
            description={t("page.errorDesc")}
            title={t("page.errorTitle")}
          />
        ) : !alerts || alerts.length === 0 ? (
          <EmptyRow>{t("page.empty")}</EmptyRow>
        ) : (
          alerts.map((alert) => (
            <AlertListItem
              alert={alert}
              isDeleting={
                deleteAlertMutation.isPending &&
                deleteAlertMutation.variables === alert.id
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
