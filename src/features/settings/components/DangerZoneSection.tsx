import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { DeleteAccountButton } from "@/features/settings/components/DeleteAccountButton";
import {
  useMyPauseState,
  usePauseMyAccount,
  useReactivateMyAccount,
} from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";

export const DangerZoneSection = () => {
  const runWithToast = useToastMutation();
  const { data: pauseState } = useMyPauseState();
  const pauseMutation = usePauseMyAccount();
  const reactivateMutation = useReactivateMyAccount();

  const isPaused = pauseState?.isPaused ?? false;
  const isPending = pauseMutation.isPending || reactivateMutation.isPending;

  const togglePause = () =>
    runWithToast(
      () =>
        isPaused
          ? reactivateMutation.mutateAsync()
          : pauseMutation.mutateAsync(),
      {
        success: isPaused ? "Account reactivated" : "Account paused",
        error: isPaused
          ? "Couldn't reactivate account"
          : "Couldn't pause account",
      }
    );

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-red-100 bg-white p-7"
      id="danger"
    >
      <SectionHead
        eyebrow="06 · Careful now"
        help="Reversible and irreversible actions. Pausing is safe — deleting is not."
        title={
          <>
            <em
              className="font-serif italic text-red-600"
              style={EMPHASIS_STYLE}
            >
              Danger
            </em>{" "}
            zone.
          </>
        }
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-16 border border-neutral-200 px-5 py-4">
          <div>
            <p className="text-[13.5px] font-semibold text-neutral-900">
              {isPaused ? "Account paused" : "Pause my account"}
            </p>
            <p className="text-[12.5px] text-neutral-500">
              {isPaused
                ? "You can still sign in. Reactivate anytime — nothing was deleted."
                : "Marks your account as paused. You can reactivate anytime — nothing is deleted."}
            </p>
          </div>
          <button
            className="ml-6 flex-shrink-0 rounded-10 border border-amber-300 bg-amber-50 px-4 py-2 text-[13px] font-medium text-amber-800 hover:bg-amber-100 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
            disabled={isPending}
            type="button"
            onClick={togglePause}
          >
            {isPaused ? "Reactivate" : "Pause"}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-16 border border-red-200 bg-red-50/40 px-5 py-4">
          <div>
            <p className="text-[13.5px] font-semibold text-neutral-900">
              Delete account
            </p>
            <p className="text-[12.5px] text-neutral-500">
              Permanently remove your profile, applications, and message
              history. This cannot be undone.
            </p>
          </div>
          <div className="ml-6 flex-shrink-0">
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </section>
  );
};
