import type { UseFormRegister } from "react-hook-form";
import { Briefcase, Code2, Globe, User } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { TEXT_INPUT_CLASS } from "@/components/shared/input-styles";
import type { ProfileFormValues } from "@/features/talent/talent.schemas";
import { useTranslation } from "@/i18n/useTranslation";

const LINK_FIELDS = [
  {
    icon: Code2,
    labelKey: "links.github",
    field: "githubUrl" as const,
    placeholder: "github.com/you",
  },
  {
    icon: User,
    labelKey: "links.linkedin",
    field: "linkedinUrl" as const,
    placeholder: "linkedin.com/in/you",
  },
  {
    icon: Globe,
    labelKey: "links.portfolio",
    field: "portfolioUrl" as const,
    placeholder: "https://",
  },
];

interface LinksSectionProps {
  register: UseFormRegister<ProfileFormValues>;
  resumeUrl: string;
  onResumeUploaded: (url: string) => void;
}

export const LinksSection = ({
  register,
  resumeUrl,
  onResumeUploaded,
}: LinksSectionProps) => {
  const { t } = useTranslation("talent");
  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="links"
    >
      <SectionHead
        eyebrow={t("links.eyebrow")}
        help={t("links.help")}
        title={
          <>
            {t("links.title")}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              {t("links.titleEm")}
            </em>
          </>
        }
      />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Briefcase size={15} />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <label className="block text-[12px] font-medium text-neutral-700">
              {t("links.cv")}
            </label>
            <FileUpload
              accept="application/pdf"
              label={t("links.uploadCv")}
              type="resume"
              value={resumeUrl}
              onUploaded={onResumeUploaded}
            />
          </div>
        </div>

        {LINK_FIELDS.map(({ icon: Icon, labelKey, field, placeholder }) => (
          <div className="flex items-center gap-3" key={field}>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <label
                className="block text-[12px] font-medium text-neutral-700"
                htmlFor={`p-${field}`}
              >
                {t(labelKey)}
              </label>
              <input
                className={TEXT_INPUT_CLASS}
                id={`p-${field}`}
                placeholder={placeholder}
                {...register(field)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
