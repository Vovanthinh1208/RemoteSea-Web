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

type ToggleField = keyof Omit<
  NotificationPreferencesDto,
  "id" | "userId" | "updatedAt"
>;

export const NotificationsSection = () => {
  const runWithToast = useToastMutation();
  const { data: prefs } = useMyNotificationPreferences();
  const updatePrefsMutation = useUpdateMyNotificationPreferences();

  const toggle = (field: ToggleField, value: boolean) =>
    runWithToast(() => updatePrefsMutation.mutateAsync({ [field]: value }), {
      error: "Couldn't update notification preference",
    });

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="notifications"
    >
      <SectionHead
        eyebrow="04 · What reaches you"
        help="Choose what lands in your inbox. Critical security emails are always sent."
        title={
          <em
            className="font-serif italic text-brand-700"
            style={EMPHASIS_STYLE}
          >
            Notifications.
          </em>
        }
      />
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Your activity
      </p>
      {/* No border/bg on this or the next two toggle-row groups below —
          each already has its own uppercase label; a bordered/backgrounded
          box around each one, nested inside this section's own bordered
          card, was doubled framing (same fix as PreferencesSection.tsx). */}
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc="When an employer moves one of your applications forward — shortlisted, interviewing, offered, or rejected."
          on={prefs?.applicationUpdates ?? true}
          title="Application updates"
          onChange={(v) => toggle("applicationUpdates", v)}
        />
        <ToggleRow
          desc="Direct messages and interview requests from verified hiring teams."
          on={prefs?.employerMessages ?? true}
          title="Messages from employers"
          onChange={(v) => toggle("employerMessages", v)}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Matches & digests
      </p>
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc="Top 5 matches for your saved filters, once a week."
          on={prefs?.weeklyDigest ?? true}
          title={
            <>
              Weekly digest{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · Monday 9am
              </span>
            </>
          }
          onChange={(v) => toggle("weeklyDigest", v)}
        />
        <ToggleRow
          desc="Email the moment a role scores 90%+ against your profile."
          on={prefs?.instantMatchAlerts ?? true}
          title="Instant high-match alerts"
          onChange={(v) => toggle("instantMatchAlerts", v)}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        From RemoteSEA
      </p>
      <div className="divide-y divide-neutral-50">
        <ToggleRow
          desc="Occasional updates when we ship something worth knowing about."
          on={prefs?.productNews ?? false}
          title="Product news"
          onChange={(v) => toggle("productNews", v)}
        />
        <ToggleRow
          desc="Negotiation guides, async culture notes, salary data. Twice a month, max."
          on={prefs?.tipsAndResources ?? true}
          title="Tips & resources"
          onChange={(v) => toggle("tipsAndResources", v)}
        />
        <ToggleRow
          disabled
          desc="Real-time alerts on this device, even when RemoteSEA isn't open. Not built yet — this won't do anything until it is."
          on={false}
          title="Browser push notifications"
          onChange={(v) => toggle("browserPush", v)}
        />
      </div>
    </section>
  );
};
