import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import {
  useMyConnections,
  useDisconnectMyConnection,
} from "@/features/users/users.queries";
import { getOAuthLinkUrl } from "@/features/auth/auth.service";
import { useOAuthProviders } from "@/features/auth/auth.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/core/errors/api-error";
import { usersKeys } from "@/core/query/query-keys";
import { getErrorMessage } from "@/core/errors/localize";
import { useTranslation } from "@/i18n/useTranslation";

const PROVIDERS = [
  { id: "google", name: "Google", bg: "#4285F4", initial: "G" },
  { id: "github", name: "GitHub", bg: "#24292F", initial: "GH" },
  { id: "linkedin", name: "LinkedIn", bg: "#0A66C2", initial: "in" },
] as const;

// Pulled out of the component: the React Compiler's immutability check
// otherwise flags `window.location.href = url` as "modifying a variable
// defined outside a component" wherever it's assigned directly inside one
// (see PostJobWizard's Stripe-checkout redirect for the same pattern, which
// predates this lint rule catching it).
const navigateTo = (url: string) => {
  window.location.href = url;
};

export const ConnectedAccountsSection = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: connections } = useMyConnections();
  const disconnectMutation = useDisconnectMyConnection();
  const providersQuery = useOAuthProviders();
  const enabledProviders = new Set(providersQuery.data ?? []);

  // Settings > Connected accounts "Connect" round-trips through the
  // provider's consent screen and back to GET /auth/:provider/callback,
  // which redirects here with ?connected=<provider> or
  // ?connectionError=<provider>&reason=... — surface that once, then strip
  // it from the URL so a refresh doesn't re-show the same toast.
  useEffect(() => {
    const connected = searchParams.get("connected");
    const connectionError = searchParams.get("connectionError");
    if (!connected && !connectionError) return;

    if (connected) {
      toast({
        variant: "success",
        title: t("conn2.connectedToast", { provider: connected }),
      });
      void queryClient.invalidateQueries({
        queryKey: usersKeys.connections(),
      });
    } else if (connectionError) {
      const reason = searchParams.get("reason") ?? "unknown";
      toast({
        variant: "error",
        title: t("conn2.connectFailedTitle", { provider: connectionError }),
        description:
          reason === "already_linked"
            ? t("conn2.reason.already_linked")
            : t("conn2.reason.unknown"),
      });
    }

    const next = new URLSearchParams(searchParams);
    next.delete("connected");
    next.delete("connectionError");
    next.delete("reason");
    setSearchParams(next, { replace: true });
    // Runs once per redirect-back landing — re-running on every searchParams
    // identity change would re-fire the toast after setSearchParams updates it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = (provider: string) =>
    runWithToast(() => disconnectMutation.mutateAsync(provider), {
      error: t("conn2.disconnectFailed"),
      onError: (err) =>
        err instanceof ApiError ? getErrorMessage(err) : undefined,
    });

  const connect = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    try {
      const { url } = await getOAuthLinkUrl(provider);
      navigateTo(url);
    } catch (err) {
      toast({
        variant: "error",
        title: t("conn2.startFailed", { provider }),
        description: err instanceof ApiError ? getErrorMessage(err) : undefined,
      });
    }
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="connected"
    >
      <SectionHead
        eyebrow={t("conn2.eyebrow")}
        help={t("conn2.help")}
        title={
          <>
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              {t("conn2.title1")}
            </em>
            {t("conn2.title2")}
          </>
        }
      />
      {/* No border/bg wrapper here — same reasoning as SecuritySection's
          session list and TwoFactorSection: this already sits inside the
          section's own bordered card, so a second full frame was doubled
          framing, not extra grouping. */}
      <div className="divide-y divide-neutral-50">
        {PROVIDERS.map(({ id, name, bg, initial }) => {
          const connection = connections?.find((c) => c.provider === id);
          return (
            <div className="flex items-center gap-3 px-4 py-3.5" key={id}>
              <span
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-10 text-[11px] font-bold text-white"
                style={{ background: bg }}
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-neutral-900">
                  {name}
                </p>
                <p
                  className={cn(
                    "truncate text-[12px]",
                    connection
                      ? "font-mono text-neutral-500"
                      : "text-neutral-400"
                  )}
                >
                  {connection
                    ? connection.providerAccountId
                    : t("conn2.notConnected")}
                </p>
              </div>
              {connection ? (
                <button
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
                  disabled={disconnectMutation.isPending}
                  type="button"
                  onClick={() => disconnect(id)}
                >
                  {disconnectMutation.isPending &&
                    disconnectMutation.variables === id && (
                      <Loader2 className="animate-spin" size={12} />
                    )}
                  {t("conn2.disconnect")}
                </button>
              ) : (
                <button
                  className="flex-shrink-0 rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
                  disabled={
                    providersQuery.isPending ||
                    providersQuery.isError ||
                    !enabledProviders.has(id)
                  }
                  type="button"
                  onClick={() => void connect(id)}
                >
                  {providersQuery.isPending
                    ? t("conn2.checking")
                    : providersQuery.isError
                      ? t("conn2.unavailable")
                      : enabledProviders.has(id)
                        ? t("conn2.connect")
                        : t("conn2.unavailable")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
