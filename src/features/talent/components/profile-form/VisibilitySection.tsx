import { useState } from "react";
import { Check, Eye, Globe, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ToggleRow } from "@/features/talent/components/profile-form/ToggleRow";
import { useSyncedState } from "@/hooks/useSyncedState";
import type { TalentVisibility } from "@/types/talent";
import { useTranslation } from "@/i18n/useTranslation";

type VisibilityCard = "open" | "verified" | "invited" | "off";

interface VisibilitySectionProps {
  isOpenToWork: boolean;
  visibility: TalentVisibility;
  onOpenToWorkChange: (value: boolean) => void;
  onVisibilityChange: (value: TalentVisibility) => void;
}

const toCard = (
  isOpenToWork: boolean,
  visibility: TalentVisibility
): VisibilityCard => {
  if (!isOpenToWork) return "off";
  return visibility === "VERIFIED_EMPLOYERS" ? "verified" : "open";
};

const VIS_CARDS: Array<{ id: VisibilityCard; icon: typeof Globe }> = [
  { id: "open", icon: Globe },
  { id: "verified", icon: ShieldCheck },
  { id: "invited", icon: Mail },
  { id: "off", icon: Eye },
];

export const VisibilitySection = ({
  isOpenToWork,
  visibility,
  onOpenToWorkChange,
  onVisibilityChange,
}: VisibilitySectionProps) => {
  const { t } = useTranslation("talent");
  const [selected, setSelected] = useSyncedState<VisibilityCard>(
    toCard(isOpenToWork, visibility)
  );
  const [showSalary, setShowSalary] = useState(true);

  const selectCard = (id: VisibilityCard) => {
    setSelected(id);
    if (id === "open") {
      onOpenToWorkChange(true);
      onVisibilityChange("PUBLIC");
    } else if (id === "verified") {
      onOpenToWorkChange(true);
      onVisibilityChange("VERIFIED_EMPLOYERS");
    } else if (id === "off") {
      onOpenToWorkChange(false);
    }
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="visibility"
    >
      <SectionHead
        eyebrow={t("vis.eyebrow")}
        help={t("vis.help")}
        title={
          <em
            className="font-serif italic text-brand-700"
            style={EMPHASIS_STYLE}
          >
            {t("vis.title")}
          </em>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {VIS_CARDS.map(({ id, icon: Icon }) => (
          <button
            className={cn(
              "rounded-16 border p-4 text-left transition-all focus-visible:shadow-focus focus-visible:outline-none",
              selected === id
                ? "border-brand-600 bg-brand-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            )}
            key={id}
            type="button"
            onClick={() => selectCard(id)}
          >
            <p className="mb-1 flex items-center gap-1.5 text-[13.5px] font-semibold text-neutral-900">
              <Icon
                className={
                  selected === id ? "text-brand-600" : "text-neutral-500"
                }
                size={14}
              />
              {t(`vis.${id}.title`)}
              {selected === id && (
                <Check className="ml-auto text-brand-600" size={11} />
              )}
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-500">
              {t(`vis.${id}.desc`)}
            </p>
          </button>
        ))}
      </div>
      <div className="divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc={t("vis.showSalaryDesc")}
          on={showSalary}
          title={t("vis.showSalary")}
          onChange={() => setShowSalary((v) => !v)}
        />
        <ToggleRow
          desc={t("vis.hideEmployerDesc")}
          on={true}
          title={
            <>
              {t("vis.hideEmployer")}{" "}
              <span className="font-mono text-[12px] text-neutral-400">
                · Finch Labs
              </span>
            </>
          }
          onChange={() => {}}
        />
      </div>
    </section>
  );
};
