import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CommunityHeroSection } from "@/components/community/CommunityHeroSection";
import { CommunityStatsBand } from "@/components/community/CommunityStatsBand";
import { MembersSection } from "@/components/community/MembersSection";
import { ChannelsThreadsSection } from "@/components/community/ChannelsThreadsSection";
import { MeetupsSection } from "@/components/community/MeetupsSection";
import { JoinCtaSection } from "@/components/community/JoinCtaSection";

// Sections live in components/community/* (one file per section with its own
// data — same convention as components/home/*, components/salary/*, and
// employer-marketing/*).

export const CommunityPage = () => {
  useDocumentTitle("Community — RemoteSEA");
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
