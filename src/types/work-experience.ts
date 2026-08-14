export type WorkExperience = {
  id: string;
  talentId: string;
  company: string;
  title: string;
  location: string | null;
  // null endDate = current role ("Present" in the UI).
  startDate: string;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkExperiencePayload = {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type UpdateWorkExperiencePayload = Partial<{
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
}>;
