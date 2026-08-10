export type ProfileHighlightType = "PORTFOLIO" | "EDUCATION" | "LANGUAGE";

export type ProfileHighlight = {
  id: string;
  talentId: string;
  type: ProfileHighlightType;
  // PORTFOLIO: project title / EDUCATION: school name / LANGUAGE: language name
  title: string;
  // PORTFOLIO: role · duration / EDUCATION: degree · field / LANGUAGE: proficiency level
  subtitle: string | null;
  // PORTFOLIO only
  description: string | null;
  // PORTFOLIO only
  tag: string | null;
  // PORTFOLIO only
  url: string | null;
  // EDUCATION only
  startYear: number | null;
  // EDUCATION only; null = ongoing
  endYear: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProfileHighlightPayload =
  | {
      type: "PORTFOLIO";
      title: string;
      subtitle?: string;
      description?: string;
      tag?: string;
      url?: string;
    }
  | {
      type: "EDUCATION";
      title: string;
      subtitle?: string;
      startYear: number;
      endYear?: number;
    }
  | {
      type: "LANGUAGE";
      title: string;
      subtitle?: string;
    };

export type UpdateProfileHighlightPayload = Partial<{
  title: string;
  subtitle: string | null;
  description: string | null;
  tag: string | null;
  url: string | null;
  startYear: number;
  endYear: number | null;
}>;
