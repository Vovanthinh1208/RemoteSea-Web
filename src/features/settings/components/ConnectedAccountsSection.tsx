import { Code2, Mail } from "lucide-react";
import { cn } from "@/utils/cn";
import { SectionHead, EMPHASIS_STYLE } from "@/features/talent/components/profile-form/SectionHead";
import { useMyConnections, useDisconnectMyConnection } from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";

// Only Google/GitHub are real OAuth providers (see remotesea-api's auth
// strategies) — no LinkedIn strategy exists, so it's omitted rather than
// shown as a dead "Connect" button.
const PROVIDERS = [
  { id: "google", icon: Mail, name: "Google" },
  { id: "github", icon: Code2, name: "GitHub" },
];

export const ConnectedAccountsSection = () => {
  const runWithToast = useToastMutation();
  const { data: connections } = useMyConnections();
  const disconnectMutation = useDisconnectMyConnection();

  const disconnect = (provider: string) =>
    runWithToast(() => disconnectMutation.mutateAsync(provider), {
      error: "Couldn't disconnect",
      onError: (err) => (err instanceof ApiError ? err.message : undefined),
    });

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
        {PROVIDERS.map(({ id, icon: Icon, name }) => {
          const connection = connections?.find((c) => c.provider === id);
          return (
            <div className="flex items-center gap-3 px-4 py-3.5" key={id}>
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
                <Icon size={16} />
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
              {connection && (
                <button
                  className="flex-shrink-0 rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-300 disabled:opacity-60"
                  disabled={disconnectMutation.isPending}
                  type="button"
                  onClick={() => disconnect(id)}
                >
                  Disconnect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
