import type { Application, ApplicationWithJob } from "@/types/application";

export type ApplicationDto = Application;
export type ApplicationWithJobDto = ApplicationWithJob;
export type ApplyRequestDto = { jobId: string; coverLetter?: string; resumeUrl?: string };
