import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ToggleRow } from "@/features/settings/components/ToggleRow";
import {
  useMyNotificationPreferences,
  useUpdateMyNotificationPreferences,
} from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { NotificationPreferencesDto } from "@/features/users/users.dto";
import { useTranslation } from "@/i18n/useTranslation";

type ToggleField = keyof Omit<
  NotificationPreferencesDto,
  "id" | "userId" | "updatedAt"
>;

export const NotificationsSection = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();
  const { data: prefs } = useMyNotificationPreferences();
  const updatePrefsMutation = useUpdateMyNotificationPreferences();

  const toggle = (field: ToggleField, value: boolean) =>
    runWithToast(() => updatePrefsMutation.mutateAsync({ [field]: value }), {
      error: t("notif2.failed"),
    });

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="notifications"
    >
      <SectionHead
        eyebrow={t("notif2.eyebrow")}
        help={t("notif2.help")}
        title={
          <em
            className="font-serif italic text-brand-700"
            style={EMPHASIS_STYLE}
          >
            {t("notif2.title")}
          </em>
        }
      />
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("notif2.activity")}
      </p>
      {/* No border/bg on this or the next two toggle-row groups below —
          each already has its own uppercase label; a bordered/backgrounded
          box around each one, nested inside this section's own bordered
          card, was doubled framing (same fix as PreferencesSection.tsx). */}
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc={t("notif2.appUpdatesDesc")}
          on={prefs?.applicationUpdates ?? true}
          title={t("notif2.appUpdates")}
          onChange={(v) => toggle("applicationUpdates", v)}
        />
        <ToggleRow
          desc={t("notif2.messagesDesc")}
          on={prefs?.employerMessages ?? true}
          title={t("notif2.messages")}
          onChange={(v) => toggle("employerMessages", v)}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("notif2.matches")}
      </p>
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc={t("notif2.digestDesc")}
          on={prefs?.weeklyDigest ?? true}
          title={
            <>
              {t("notif2.digest")}{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                {t("notif2.digestWhen")}
              </span>
            </>
          }
          onChange={(v) => toggle("weeklyDigest", v)}
        />
        <ToggleRow
          desc={t("notif2.instantDesc")}
          on={prefs?.instantMatchAlerts ?? true}
          title={t("notif2.instant")}
          onChange={(v) => toggle("instantMatchAlerts", v)}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("notif2.fromUs")}
      </p>
      <div className="divide-y divide-neutral-50">
        <ToggleRow
          desc={t("notif2.newsDesc")}
          on={prefs?.productNews ?? false}
          title={t("notif2.news")}
          onChange={(v) => toggle("productNews", v)}
        />
        <ToggleRow
          desc={t("notif2.tipsDesc")}
          on={prefs?.tipsAndResources ?? true}
          title={t("notif2.tips")}
          onChange={(v) => toggle("tipsAndResources", v)}
        />
        <ToggleRow
          disabled
          desc={t("notif2.pushDesc")}
          on={false}
          title={t("notif2.push")}
          onChange={(v) => toggle("browserPush", v)}
        />
      </div>
    </section>
  );
};
