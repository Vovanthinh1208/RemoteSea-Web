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

const VIS_CARDS: Array<{
  id: VisibilityCard;
  icon: typeof Globe;
  title: string;
  desc: string;
}> = [
  {
    id: "open",
    icon: Globe,
    title: "Open to everyone",
    desc: "Any signed-in employer on RemoteSEA can find you. Fastest, most matches.",
  },
  {
    id: "verified",
    icon: ShieldCheck,
    title: "Verified employers only",
    desc: "Recommended. Only employers we've manually verified. No recruiter spam.",
  },
  {
    id: "invited",
    icon: Mail,
    title: "Invited only",
    desc: "Only employers you apply to can see you. Slower, but private.",
  },
  {
    id: "off",
    icon: Eye,
    title: "Paused",
    desc: "Profile hidden. You can still browse jobs and save. Resume anytime.",
  },
];

export const VisibilitySection = ({
  isOpenToWork,
  visibility,
  onOpenToWorkChange,
  onVisibilityChange,
}: VisibilitySectionProps) => {
  // "Invited only" has no backing state — selecting it doesn't touch either
  // real field — so its selection can't be derived from (isOpenToWork,
  // visibility) the way "open"/"verified"/"off" can. A synced local copy lets
  // it stay selected locally while still snapping back to the derived value
  // whenever the profile reloads (a fresh fetch, a save from elsewhere).
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
    // "invited" is UI-only — no API field to change yet.
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="visibility"
    >
      <SectionHead
        eyebrow="07 · Who sees you"
        help="Control who can find your profile and reach out. Change anytime."
        title={
          <em
            className="font-serif italic text-brand-700"
            style={EMPHASIS_STYLE}
          >
            Visibility.
          </em>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {VIS_CARDS.map(({ id, icon: Icon, title, desc }) => (
          <button
            className={cn(
              "rounded-16 border p-4 text-left transition-all",
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
                  selected === id
                    ? "text-brand-600"
                    : "text-neutral-500"
                }
                size={14}
              />
              {title}
              {selected === id && (
                <Check className="ml-auto text-brand-600" size={11} />
              )}
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-500">
              {desc}
            </p>
          </button>
        ))}
      </div>
      <div className="divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc="Verified employers see your range. Helps filter out lowball outreach."
          on={showSalary}
          title="Show my salary expectation"
          onChange={() => setShowSalary((v) => !v)}
        />
        <ToggleRow
          desc="We'll block this domain from seeing your profile or activity. They'll never know."
          on={true}
          title={
            <>
              Hide profile from my current employer{" "}
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
