import type { ApplicationStatus } from "@/types/application";

// PB57 AC2: the pipeline columns of the applicants board. OFFER_ACCEPTED is
// the backlog's "Hired"; the other closed states (talent withdrew / declined
// the offer) sit with Rejected so no applicant ever drops off the board.
export const APPLICANT_COLUMNS = [
  { id: "applied", statuses: ["PENDING"] },
  { id: "reviewing", statuses: ["REVIEWING"] },
  { id: "shortlisted", statuses: ["SHORTLISTED"] },
  { id: "interview", statuses: ["INTERVIEW"] },
  { id: "offered", statuses: ["OFFERED"] },
  { id: "hired", statuses: ["OFFER_ACCEPTED"] },
  { id: "rejected", statuses: ["REJECTED", "WITHDRAWN", "OFFER_DECLINED"] },
] as const satisfies readonly {
  id: string;
  statuses: readonly ApplicationStatus[];
}[];

export type ApplicantColumnId = (typeof APPLICANT_COLUMNS)[number]["id"];

// The status filter (PB57 AC4) offers every real status.
export const APPLICANT_STATUS_FILTERS: readonly ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "REJECTED",
  "WITHDRAWN",
];

export const isApplicantStatusFilter = (
  value: string
): value is ApplicationStatus =>
  (APPLICANT_STATUS_FILTERS as readonly string[]).includes(value);

export const groupByColumn = <T extends { status: ApplicationStatus }>(
  applicants: readonly T[]
): Record<ApplicantColumnId, T[]> => {
  const groups = Object.fromEntries(
    APPLICANT_COLUMNS.map((column) => [column.id, [] as T[]])
  ) as Record<ApplicantColumnId, T[]>;
  for (const applicant of applicants) {
    const column = APPLICANT_COLUMNS.find((c) =>
      (c.statuses as readonly ApplicationStatus[]).includes(applicant.status)
    );
    if (column) groups[column.id].push(applicant);
  }
  return groups;
};
