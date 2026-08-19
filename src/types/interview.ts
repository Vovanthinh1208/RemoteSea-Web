export type InterviewStatus = "PENDING" | "CONFIRMED";

export type Interview = {
  id: string;
  durationMinutes: number;
  proposedSlots: string[];
  confirmedSlot: string | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  createdAt: string;
};
