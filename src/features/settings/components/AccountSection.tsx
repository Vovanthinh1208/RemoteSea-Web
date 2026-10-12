import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import {
  useMyAccount,
  useUpdateMyAccount,
} from "@/features/users/users.queries";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useTranslation } from "@/i18n/useTranslation";

const LANGUAGES = ["English", "Tiếng Việt"] as const;
const REGIONS = ["Vietnam", "Singapore", "Australia"] as const;
const CURRENCIES = ["USD ($)", "VND (₫)", "SGD (S$)"] as const;

export const AccountSection = () => {
  const { user } = useAuth();
  const runWithToast = useToastMutation();
  const { data: account } = useMyAccount();
  const updateAccountMutation = useUpdateMyAccount();
  const { t, setLocale } = useTranslation();

  const [phone, setPhone] = useSyncedState(account?.phone ?? "");

  const savePhone = () => {
    if (phone === (account?.phone ?? "")) return;
    void runWithToast(() => updateAccountMutation.mutateAsync({ phone }), {
      error: t("settings.account.phoneUpdateError"),
    });
  };

  const saveField = (
    field: "language" | "region" | "currencyDisplay",
    value: string
  ) => {
    if (field === "language") {
      setLocale(value === "Tiếng Việt" ? "vi" : "en");
    }
    return runWithToast(
      () => updateAccountMutation.mutateAsync({ [field]: value }),
      {
        error: t("settings.account.settingUpdateError"),
      }
    );
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="account"
    >
      <SectionHead
        eyebrow={t("settings.account.eyebrow")}
        help={t("settings.account.help")}
        title={
          <>
            {t("settings.account.title")}{" "}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              .
            </em>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-[12.5px] font-medium text-neutral-700">
            {t("settings.account.emailLabel")}{" "}
            <span className="font-normal text-neutral-400">
              {t("settings.account.emailHelp")}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              className={TEXT_INPUT_CLASS}
              readOnly
              value={user?.email ?? ""}
            />
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700">
              <ShieldCheck size={10} /> {t("settings.account.verified")}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-neutral-700">
            {t("settings.account.phoneLabel")}{" "}
            <span className="font-normal text-neutral-400">
              {t("settings.account.phoneHelp")}
            </span>
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            placeholder="+84 90 123 4567"
            value={phone}
            onBlur={savePhone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-medium text-neutral-700">
              {t("settings.account.languageLabel")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              value={account?.language ?? "English"}
              onChange={(e) => saveField("language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-medium text-neutral-700">
              {t("settings.account.regionLabel")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              value={account?.region ?? "Vietnam"}
              onChange={(e) => saveField("region", e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-medium text-neutral-700">
              {t("settings.account.currencyLabel")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              value={account?.currencyDisplay ?? "USD ($)"}
              onChange={(e) => saveField("currencyDisplay", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
