import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ToggleRow } from "@/features/talent/components/profile-form/ToggleRow";
import {
  useMyNotificationPreferences,
  useUpdateMyNotificationPreferences,
} from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { formatSalaryRange } from "@/utils/format";
import type { EmploymentType, TimezoneOverlap } from "@/types/talent";

const SALARY_MIN = 1000;
const SALARY_MAX = 10000;
const SALARY_STEP = 100;
const SALARY_GAP = 200;

interface PreferencesSectionProps {
  salMin: number;
  salMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  employmentTypes: EmploymentType[];
  onEmploymentTypesChange: (value: EmploymentType[]) => void;
  timezoneOverlap: TimezoneOverlap[];
  onTimezoneOverlapChange: (value: TimezoneOverlap[]) => void;
}

export const PreferencesSection = ({
  salMin,
  salMax,
  onMinChange,
  onMaxChange,
  employmentTypes,
  onEmploymentTypesChange,
  timezoneOverlap,
  onTimezoneOverlapChange,
}: PreferencesSectionProps) => {
  const toggleEmploymentType = (key: EmploymentType) =>
    onEmploymentTypesChange(
      employmentTypes.includes(key)
        ? employmentTypes.filter((k) => k !== key)
        : [...employmentTypes, key]
    );
  const toggleTimezoneOverlap = (key: TimezoneOverlap) =>
    onTimezoneOverlapChange(
      timezoneOverlap.includes(key)
        ? timezoneOverlap.filter((k) => k !== key)
        : [...timezoneOverlap, key]
    );

  // Same underlying preference as Settings > Notifications — saved instantly
  // per toggle, not deferred to this page's Save button.
  const runWithToast = useToastMutation();
  const { data: notificationPrefs } = useMyNotificationPreferences();
  const updateNotificationPrefsMutation =
    useUpdateMyNotificationPreferences();
  const toggleNotification = (
    field: "weeklyDigest" | "instantMatchAlerts",
    value: boolean
  ) =>
    runWithToast(
      () =>
        updateNotificationPrefsMutation.mutateAsync({
          [field]: value,
        }),
      {
        error: "Couldn't update notification preference",
      }
    );

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="prefs"
    >
      <SectionHead
        eyebrow="05 · What you want"
        help="Used to filter and surface roles. You can update these anytime."
        title={
          <>
            Job{" "}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              preferences.
            </em>
          </>
        }
      />

      <div className="mb-6 rounded-16 border border-neutral-100 bg-neutral-50 p-5">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[13px] font-medium text-neutral-700">
            Salary expectation
          </label>
          <span className="text-[11.5px] text-neutral-400">
            Visible only to verified employers
          </span>
        </div>
        <p className="mb-3 text-[24px] font-semibold tracking-tight text-neutral-900">
          {formatSalaryRange(salMin, salMax)}
          <span className="ml-1 text-[14px] font-normal text-neutral-400">
            USD / month
          </span>
        </p>
        <p className="mb-4 text-[12.5px] text-neutral-500">
          Median for Senior Frontend in VN:{" "}
          <strong className="text-brand-700">$2,800 / mo</strong> ·
          You&apos;re asking{" "}
          <strong className="text-brand-700">+30%</strong> above
          median, in line with SG market.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] text-neutral-400">
              Minimum
            </p>
            <input
              aria-label="Minimum salary"
              className="w-full accent-brand-600"
              max={SALARY_MAX}
              min={SALARY_MIN}
              step={SALARY_STEP}
              type="range"
              value={salMin}
              onChange={(e) =>
                onMinChange(
                  Math.min(
                    Number(e.target.value),
                    salMax - SALARY_GAP
                  )
                )
              }
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-neutral-400">
              Maximum
            </p>
            <input
              aria-label="Maximum salary"
              className="w-full accent-brand-600"
              max={SALARY_MAX}
              min={SALARY_MIN}
              step={SALARY_STEP}
              type="range"
              value={salMax}
              onChange={(e) =>
                onMaxChange(
                  Math.max(
                    Number(e.target.value),
                    salMin + SALARY_GAP
                  )
                )
              }
            />
          </div>
        </div>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Employment type
      </p>
      <div className="mb-6 divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc="Standard, salaried, employment contract via EOR or direct."
          on={employmentTypes.includes("FULL_TIME")}
          title="Full-time"
          onChange={() => toggleEmploymentType("FULL_TIME")}
        />
        <ToggleRow
          desc="3–12 month engagements. Day-rate or monthly retainer."
          on={employmentTypes.includes("CONTRACT")}
          title="Contract / freelance"
          onChange={() => toggleEmploymentType("CONTRACT")}
        />
        <ToggleRow
          desc="20–30 hours / week. Useful if you're consulting on the side."
          on={employmentTypes.includes("PART_TIME")}
          title="Part-time"
          onChange={() => toggleEmploymentType("PART_TIME")}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Timezone overlap
      </p>
      <div className="mb-6 divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc="1 hour ahead of Vietnam. Most SEA startups operate here."
          on={timezoneOverlap.includes("SG_HOURS")}
          title={
            <>
              Singapore hours{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · UTC+8
              </span>
            </>
          }
          onChange={() => toggleTimezoneOverlap("SG_HOURS")}
        />
        <ToggleRow
          desc="Early mornings from VN. Canva, Atlassian, Airwallex operate here."
          on={timezoneOverlap.includes("AU_HOURS")}
          title={
            <>
              Sydney / Melbourne hours{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · UTC+10
              </span>
            </>
          }
          onChange={() => toggleTimezoneOverlap("AU_HOURS")}
        />
        <ToggleRow
          desc="No required overlap. US / EU teams that work entirely async."
          on={timezoneOverlap.includes("ASYNC_ONLY")}
          title="Async-only"
          onChange={() => toggleTimezoneOverlap("ASYNC_ONLY")}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Notifications
      </p>
      <div className="divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc="Top 5 matches for your saved filters, every Monday."
          on={notificationPrefs?.weeklyDigest ?? true}
          title={
            <>
              Weekly digest{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · Monday 9am
              </span>
            </>
          }
          onChange={(v) => toggleNotification("weeklyDigest", v)}
        />
        <ToggleRow
          desc="Email when a role scores 90%+ against your profile. Usually 1–2 a month."
          on={notificationPrefs?.instantMatchAlerts ?? true}
          title="Instant high-match alerts"
          onChange={(v) =>
            toggleNotification("instantMatchAlerts", v)
          }
        />
      </div>
    </section>
  );
};
