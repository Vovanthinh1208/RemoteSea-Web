export type CvAnalysis = {
  id: string;
  fitScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestedQuestions: string[];
  model: string;
  createdAt: string;
};
