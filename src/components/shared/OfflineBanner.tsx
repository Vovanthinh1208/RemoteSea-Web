import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Slim banner while the browser reports no connectivity. Without it, a user on
 * flaky mobile data just sees requests silently fail (React Query pauses
 * fetches offline via its onlineManager, so the app looks frozen rather than
 * broken). aria-live makes the state change audible to screen readers.
 */
export const OfflineBanner = () => {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white"
      role="status"
    >
      <WifiOff size={13} />
      You&apos;re offline — changes and new results will load once you
      reconnect.
    </div>
  );
};
