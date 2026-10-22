import { oauthUrl } from "@/features/auth/auth.service";
import { useOAuthProviders } from "@/features/auth/auth.queries";
import { useTranslation } from "@/i18n/useTranslation";

const OAUTH_PROVIDERS = [
  {
    id: "google",
    labelKey: "auth.oauth.google",
    bg: "#4285F4",
    icon: "G",
  },
  {
    id: "github",
    labelKey: "auth.oauth.github",
    bg: "#24292F",
    icon: "GH",
  },
  {
    id: "linkedin",
    labelKey: "auth.oauth.linkedin",
    bg: "#0A66C2",
    icon: "in",
  },
] as const;

export const OAuthButtons = () => {
  const { t } = useTranslation();
  const providersQuery = useOAuthProviders();
  const enabledProviders = new Set(providersQuery.data ?? []);
  const providers = OAUTH_PROVIDERS.filter((provider) =>
    enabledProviders.has(provider.id)
  );

  if (providersQuery.isPending) return null;

  if (providersQuery.isError) {
    return (
      <p className="mb-6 text-center text-sm text-neutral-500" role="status">
        {t("auth.oauth.loadFailed")}
      </p>
    );
  }

  if (providers.length === 0) {
    return (
      <p className="mb-6 text-center text-sm text-neutral-500" role="status">
        {t("auth.oauth.noneAvailable")}
      </p>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {providers.map((provider) => (
        <a
          className="flex h-11 w-full items-center gap-3 rounded-12 border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none"
          href={oauthUrl(provider.id)}
          key={provider.id}
        >
          <span
            className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-4 text-[11px] font-bold text-white"
            style={{ background: provider.bg }}
          >
            {provider.icon}
          </span>
          {t(provider.labelKey)}
        </a>
      ))}
    </div>
  );
};
