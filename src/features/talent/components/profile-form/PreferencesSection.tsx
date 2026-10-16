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
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t, formatNumber } = useTranslation("talent");
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
  const updateNotificationPrefsMutation = useUpdateMyNotificationPreferences();
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
        error: t("prefs.notifFailed"),
      }
    );

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="prefs"
    >
      <SectionHead
        eyebrow={t("prefs.eyebrow")}
        help={t("prefs.help")}
        title={
          <>
            {t("prefs.title")}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              {t("prefs.titleEm")}
            </em>
          </>
        }
      />

      <div className="mb-6 rounded-16 border border-neutral-100 bg-neutral-50 p-5">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[13px] font-medium text-neutral-700">
            {t("prefs.salary")}
          </label>
          <span className="text-[11.5px] text-neutral-400">
            {t("prefs.salaryVisible")}
          </span>
        </div>
        <p className="mb-3 text-[24px] font-semibold tracking-tight text-neutral-900">
          {formatSalaryRange(salMin, salMax)}
          <span className="ml-1 text-[14px] font-normal text-neutral-400">
            {t("prefs.usdMonth")}
          </span>
        </p>
        <p className="mb-4 text-[12.5px] text-neutral-500">
          {t("prefs.median", {
            median: `$${formatNumber(2800)} / ${t("prefs.perMonthShort")}`,
            pct: "+30%",
          })}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] text-neutral-400">
              {t("prefs.minimum")}
            </p>
            <input
              aria-label={t("prefs.minSalaryAria")}
              className="w-full accent-brand-600"
              max={SALARY_MAX}
              min={SALARY_MIN}
              step={SALARY_STEP}
              type="range"
              value={salMin}
              onChange={(e) =>
                onMinChange(
                  Math.min(Number(e.target.value), salMax - SALARY_GAP)
                )
              }
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-neutral-400">
              {t("prefs.maximum")}
            </p>
            <input
              aria-label={t("prefs.maxSalaryAria")}
              className="w-full accent-brand-600"
              max={SALARY_MAX}
              min={SALARY_MIN}
              step={SALARY_STEP}
              type="range"
              value={salMax}
              onChange={(e) =>
                onMaxChange(
                  Math.max(Number(e.target.value), salMin + SALARY_GAP)
                )
              }
            />
          </div>
        </div>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("prefs.employmentType")}
      </p>
      {/* No border/bg wrapper here — the uppercase label above each group
          already separates it from its neighbors; a bordered/backgrounded
          box around each one, nested inside this section's own bordered
          card, was doubled framing with no extra information. */}
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc={t("prefs.ftDesc")}
          on={employmentTypes.includes("FULL_TIME")}
          title={t("prefs.ft")}
          onChange={() => toggleEmploymentType("FULL_TIME")}
        />
        <ToggleRow
          desc={t("prefs.contractDesc")}
          on={employmentTypes.includes("CONTRACT")}
          title={t("prefs.contract")}
          onChange={() => toggleEmploymentType("CONTRACT")}
        />
        <ToggleRow
          desc={t("prefs.ptDesc")}
          on={employmentTypes.includes("PART_TIME")}
          title={t("prefs.pt")}
          onChange={() => toggleEmploymentType("PART_TIME")}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("prefs.tzOverlap")}
      </p>
      {/* No border/bg wrapper here — the uppercase label above each group
          already separates it from its neighbors; a bordered/backgrounded
          box around each one, nested inside this section's own bordered
          card, was doubled framing with no extra information. */}
      <div className="mb-6 divide-y divide-neutral-50">
        <ToggleRow
          desc={t("prefs.sgDesc")}
          on={timezoneOverlap.includes("SG_HOURS")}
          title={
            <>
              {t("prefs.sg")}{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · UTC+8
              </span>
            </>
          }
          onChange={() => toggleTimezoneOverlap("SG_HOURS")}
        />
        <ToggleRow
          desc={t("prefs.auDesc")}
          on={timezoneOverlap.includes("AU_HOURS")}
          title={
            <>
              {t("prefs.au")}{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · UTC+10
              </span>
            </>
          }
          onChange={() => toggleTimezoneOverlap("AU_HOURS")}
        />
        <ToggleRow
          desc={t("prefs.asyncDesc")}
          on={timezoneOverlap.includes("ASYNC_ONLY")}
          title={t("prefs.async")}
          onChange={() => toggleTimezoneOverlap("ASYNC_ONLY")}
        />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {t("prefs.notifications")}
      </p>
      <div className="divide-y divide-neutral-50">
        <ToggleRow
          desc={t("prefs.digestDesc")}
          on={notificationPrefs?.weeklyDigest ?? true}
          title={
            <>
              {t("prefs.digest")}{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                {t("prefs.digestWhen")}
              </span>
            </>
          }
          onChange={(v) => toggleNotification("weeklyDigest", v)}
        />
        <ToggleRow
          desc={t("prefs.instantDesc")}
          on={notificationPrefs?.instantMatchAlerts ?? true}
          title={t("prefs.instant")}
          onChange={(v) => toggleNotification("instantMatchAlerts", v)}
        />
      </div>
    </section>
  );
};
