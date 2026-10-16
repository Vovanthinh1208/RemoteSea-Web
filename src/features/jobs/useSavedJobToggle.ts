import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useIsJobSaved,
  useSaveJob,
  useUnsaveJob,
} from "@/features/saved/saved.queries";
import { ROUTES } from "@/constants/routes";
import { reportError } from "@/services/monitoring";
import { useTranslation } from "@/i18n/useTranslation";

interface UseSavedJobToggleResult {
  saved: boolean;
  statusUnknown: boolean;
  toggle: (e?: React.MouseEvent) => Promise<void>;
}

// The original app computed the initial saved state server-side before first paint,
// so the button never rendered a wrong state. This is a client-only query instead, so
// while it's resolving for a signed-in user, callers show a neutral placeholder rather
// than defaulting to "unsaved" and flashing to "Saved" once it loads.
export const useSavedJobToggle = (
  jobId: string,
  loginCallbackUrl: string
): UseSavedJobToggleResult => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation("jobs");
  const { data: isSaved, isLoading: savedStatusLoading } = useIsJobSaved(jobId);
  const saveMutation = useSaveJob();
  const unsaveMutation = useUnsaveJob();

  const statusUnknown = !!user && savedStatusLoading;
  const saved = isSaved ?? false;

  // Guards against a rapid double-click firing a second toggle before the first's
  // optimistic update/rollback has settled — without this, `prev` in the second
  // call can be read from an in-flight optimistic write rather than a stable value.
  const togglingRef = useRef(false);

  const toggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!user) {
      navigate(
        `${ROUTES.login}?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`
      );
      return;
    }
    if (togglingRef.current) return;
    togglingRef.current = true;
    const prev = saved;
    try {
      if (prev) {
        await unsaveMutation.mutateAsync(jobId);
      } else {
        await saveMutation.mutateAsync(jobId);
      }
      toast({
        variant: "success",
        title: prev ? t("save.removedToast") : t("save.savedToast"),
      });
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: t("save.failedToast"),
      });
    } finally {
      togglingRef.current = false;
    }
  };

  return { saved, statusUnknown, toggle };
};
