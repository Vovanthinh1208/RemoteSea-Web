import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/utils/cn";
import { SectionHead, EMPHASIS_STYLE } from "@/features/talent/components/profile-form/SectionHead";
import { useMyConnections, useDisconnectMyConnection } from "@/features/users/users.queries";
import { getOAuthLinkUrl } from "@/features/auth/auth.service";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/core/errors/api-error";
import { usersKeys } from "@/core/query/query-keys";

const PROVIDERS = [
  { id: "google", name: "Google", bg: "#4285F4", initial: "G" },
  { id: "github", name: "GitHub", bg: "#24292F", initial: "GH" },
  { id: "linkedin", name: "LinkedIn", bg: "#0A66C2", initial: "in" },
] as const;

const CONNECTION_ERROR_REASONS: Record<string, string> = {
  already_linked: "That account is already connected to a different RemoteSEA account.",
  unknown: "Something went wrong. Please try again.",
};

// Pulled out of the component: the React Compiler's immutability check
// otherwise flags `window.location.href = url` as "modifying a variable
// defined outside a component" wherever it's assigned directly inside one
// (see PostJobWizard's Stripe-checkout redirect for the same pattern, which
// predates this lint rule catching it).
const navigateTo = (url: string) => {
  window.location.href = url;
};

export const ConnectedAccountsSection = () => {
  const runWithToast = useToastMutation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: connections } = useMyConnections();
  const disconnectMutation = useDisconnectMyConnection();

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
      toast({ variant: "success", title: `${connected} connected` });
      void queryClient.invalidateQueries({ queryKey: usersKeys.connections() });
    } else if (connectionError) {
      const reason = searchParams.get("reason") ?? "unknown";
      toast({
        variant: "error",
        title: `Couldn't connect ${connectionError}`,
        description: CONNECTION_ERROR_REASONS[reason] ?? CONNECTION_ERROR_REASONS.unknown,
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
      error: "Couldn't disconnect",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

  const connect = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    try {
      const { url } = await getOAuthLinkUrl(provider);
      navigateTo(url);
    } catch (err) {
      toast({
        variant: "error",
        title: `Couldn't start connecting ${provider}`,
        description: err instanceof ApiError ? err.message : undefined,
      });
    }
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="connected"
    >
      <SectionHead
        eyebrow="03 · Sign-in methods"
        help="Providers linked for one-tap sign-in. You can sign in with any connected account."
        title={
          <>
            <em className="font-serif italic text-brand-700" style={EMPHASIS_STYLE}>
              Connected
            </em>{" "}
            accounts.
          </>
        }
      />
      <div className="divide-y divide-neutral-50 overflow-hidden rounded-16 border border-neutral-100">
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
                <p className="text-[13.5px] font-medium text-neutral-900">{name}</p>
                <p
                  className={cn(
                    "truncate text-[12px]",
                    connection ? "font-mono text-neutral-500" : "text-neutral-400"
                  )}
                >
                  {connection ? connection.providerAccountId : "Not connected"}
                </p>
              </div>
              {connection ? (
                <button
                  className="flex-shrink-0 rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 disabled:opacity-60"
                  disabled={disconnectMutation.isPending}
                  type="button"
                  onClick={() => disconnect(id)}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  className="flex-shrink-0 rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300"
                  type="button"
                  onClick={() => void connect(id)}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
