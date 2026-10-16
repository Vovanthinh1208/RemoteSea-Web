import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CommunityHeroSection } from "@/components/community/CommunityHeroSection";
import { CommunityStatsBand } from "@/components/community/CommunityStatsBand";
import { MembersSection } from "@/components/community/MembersSection";
import { ChannelsThreadsSection } from "@/components/community/ChannelsThreadsSection";
import { MeetupsSection } from "@/components/community/MeetupsSection";
import { JoinCtaSection } from "@/components/community/JoinCtaSection";
import { useTranslation } from "@/i18n/useTranslation";

// Sections live in components/community/* (one file per section with its own
// data — same convention as components/home/*, components/salary/*, and
// employer-marketing/*).

export const CommunityPage = () => {
  const { t } = useTranslation("community");
  useDocumentTitle(t("page.title"), t("page.description"));
  return (
    <>
      <CommunityHeroSection />
      <CommunityStatsBand />
      <MembersSection />
      <ChannelsThreadsSection />
      <MeetupsSection />
      <JoinCtaSection />
    </>
  );
};
