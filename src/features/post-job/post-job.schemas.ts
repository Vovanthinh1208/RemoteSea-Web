import { z } from "zod";
import { m, v } from "@/i18n/zod";
import type { ExperienceLevel, JobType, PlanType } from "@/types/job";
import { PLAN_PRICES_USD } from "@/constants/plans";

export const COMPANY_SIZE_OPTIONS = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "500+",
] as const;

export const HQ_OPTIONS = [
  "🇸🇬 Singapore",
  "🇦🇺 Australia",
  "🇺🇸 United States",
  "🇬🇧 UK",
  "🇪🇺 Europe",
  "Other",
] as const;

export const hqToCountry = (hq: string): string | undefined => {
  const stripped = hq.replace(/[^a-zA-Z ]/g, "").trim();
  return stripped || undefined;
};

export const SENIORITY_OPTIONS = [
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Staff",
  "Lead",
  "Head",
] as const;

export const SENIORITY_TO_LEVEL: Record<
  (typeof SENIORITY_OPTIONS)[number],
  ExperienceLevel
> = {
  Intern: "ENTRY",
  Junior: "ENTRY",
  Mid: "MID",
  Senior: "SENIOR",
  Staff: "LEAD",
  Lead: "LEAD",
  Head: "EXECUTIVE",
};

export const JOB_TYPE_OPTIONS = [
  "full",
  "part",
  "contract",
  "freelance",
] as const;

export const JOB_TYPE_TO_ENUM: Record<
  (typeof JOB_TYPE_OPTIONS)[number],
  JobType
> = {
  full: "FULL_TIME",
  part: "PART_TIME",
  contract: "CONTRACT",
  freelance: "FREELANCE",
};

export const TIMEZONE_OPTIONS = [
  "SG hours · UTC+8",
  "AU hours · UTC+10",
  "US East · UTC-5",
  "US West · UTC-8",
  "EU hours · UTC+1",
  "Async-first",
] as const;

export const LOCATION_OPTIONS = ["remote", "hybrid", "onsite"] as const;

export const CURRENCY_OPTIONS = ["USD", "SGD", "AUD", "EUR", "GBP"] as const;

export const PERIOD_OPTIONS = ["/ month", "/ year", "/ hour"] as const;

export const BENEFIT_OPTIONS = [
  "Health insurance",
  "Equity",
  "Home-office stipend",
  "Annual learning budget",
  "Flexible hours",
  "Team retreats",
  "Equipment provided",
];

export const SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "Node.js",
  "Postgres",
  "GraphQL",
  "AWS",
  "Go",
  "Python",
  "Figma",
  "Kubernetes",
];

// Display copy (name, description, features, ribbon) lives in the "postjob"
// locale namespace under tier.<id>.*; this holds only stable plan data.
export type Tier = {
  id: "standard" | "featured" | "handson";
  planType: PlanType;
  price: number;
  featureCount: number;
  hasRibbon: boolean;
  highlight: boolean;
};

export const TIERS: Tier[] = [
  {
    id: "standard",
    planType: "STANDARD",
    price: PLAN_PRICES_USD.STANDARD,
    featureCount: 3,
    hasRibbon: false,
    highlight: false,
  },
  {
    id: "featured",
    planType: "FEATURED",
    price: PLAN_PRICES_USD.FEATURED,
    featureCount: 4,
    hasRibbon: true,
    highlight: true,
  },
  {
    id: "handson",
    planType: "HANDS_ON",
    price: PLAN_PRICES_USD.HANDS_ON,
    featureCount: 4,
    hasRibbon: false,
    highlight: false,
  },
];

export type PostJobFormState = {
  coName: string;
  coWeb: string;
  coSize: string;
  coHq: string;
  coTag: string;
  coAbout: string;
  recName: string;
  recRole: string;
  recEmail: string;
  jobTitle: string;
  jobCategoryId: string;
  jobSeniority: (typeof SENIORITY_OPTIONS)[number];
  jobType: (typeof JOB_TYPE_OPTIONS)[number];
  jobLoc: (typeof LOCATION_OPTIONS)[number];
  jobTz: string;
  jobDesc: string;
  jobSkills: string[];
  jobNice: string[];
  salMin: number;
  salMax: number;
  salCur: (typeof CURRENCY_OPTIONS)[number];
  salPer: (typeof PERIOD_OPTIONS)[number];
  benefits: string[];
  tier: string;
};

export interface PostJobStepProps {
  form: PostJobFormState;
  set: (key: keyof PostJobFormState, value: unknown) => void;
}

export const INITIAL_FORM_STATE: PostJobFormState = {
  coName: "",
  coWeb: "",
  coSize: "11–50",
  coHq: "🇸🇬 Singapore",
  coTag: "",
  coAbout: "",
  recName: "",
  recRole: "",
  recEmail: "",
  jobTitle: "",
  jobCategoryId: "",
  jobSeniority: "Senior",
  jobType: "full",
  jobLoc: "remote",
  jobTz: "SG hours · UTC+8",
  jobDesc: "",
  jobSkills: ["React", "TypeScript"],
  jobNice: [],
  salMin: 3500,
  salMax: 5500,
  salCur: "USD",
  salPer: "/ month",
  benefits: ["Health insurance", "Home-office stipend"],
  tier: "featured",
};

export const MIN_JOB_DESCRIPTION_LENGTH = 100;

// Per-step validation so "Continue" catches an empty/garbage required field
// immediately — the wizard used to only validate at final publish, so a user
// could click through every step with blank required fields and get no error
// until the server call at the very end.
// PB30 AC2: website, headcount, HQ country and a short description are
// required alongside the name — the API rejects the profile without them.
const stepCompanySchema = z.object({
  coName: z.string().trim().min(1, m("validation.coNameRequired")),
  coWeb: z
    .string()
    .trim()
    .min(1, m("validation.coWebRequired"))
    .regex(/^https?:\/\/\S+\.\S+$/i, m("validation.coWebInvalid")),
  coSize: z.string().trim().min(1, m("validation.coSizeRequired")),
  coHq: z.string().trim().min(1, m("validation.coHqRequired")),
  coAbout: z.string().trim().min(1, m("validation.coAboutRequired")),
  recName: z.string().trim().min(1, m("validation.recNameRequired")),
  recEmail: z
    .string()
    .trim()
    .min(1, m("validation.workEmailRequired"))
    .email(m("validation.workEmailInvalid")),
});

const stepRoleSchema = z
  .object({
    jobTitle: z.string().trim().min(1, m("validation.jobTitleRequired")),
    jobCategoryId: z.string().trim().min(1, m("validation.categoryRequired")),
    jobDesc: z
      .string()
      .trim()
      .min(
        MIN_JOB_DESCRIPTION_LENGTH,
        m("validation.jobDescMin", { min: MIN_JOB_DESCRIPTION_LENGTH })
      ),
    salMin: z.number().min(1, m("validation.salMinRequired")),
    salMax: z.number(),
  })
  .refine((v) => v.salMax >= v.salMin, {
    error: v("validation.salMaxOrder"),
    path: ["salMax"],
  });

const STEP_SCHEMAS: Partial<Record<number, z.ZodType<unknown>>> = {
  1: stepCompanySchema,
  2: stepRoleSchema,
};

/**
 * Returns every validation error for the given step, or an empty array if it's
 * valid. Returning all issues (not just the first) means a user who left three
 * required fields blank sees all three at once instead of a "Continue" ->
 * fix-one -> "Continue" -> fix-the-next whack-a-mole loop.
 */
export const validateStep = (
  step: number,
  form: PostJobFormState
): string[] => {
  const schema = STEP_SCHEMAS[step];
  if (!schema) return [];
  const result = schema.safeParse(form);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
};
