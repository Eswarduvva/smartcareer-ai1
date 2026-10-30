import { z } from "zod";
export const skillSchema = z.enum(["python", "sql", "java", "javascript", "cpp", "data-analysis"]);
export const attemptSchema = z.object({
  id: z.string().uuid(),
  skill: skillSchema,
  status: z.enum(["active", "finalized"]),
  started_at: z.string(),
  expires_at: z.string(),
  submitted_at: z.string().nullable(),
  marks: z.number().nullable(),
  percentage: z.coerce.number().nullable(),
  proficiency: z.string().nullable(),
});
export const questionSchema = z.object({
  id: z.string().uuid(),
  position: z.number(),
  prompt: z.string(),
  options: z.array(z.string()).length(4),
  topic: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  selected_option: z.number().nullable(),
  correct_option: z.number().optional(),
  explanation: z.string().optional(),
});
export const snapshotSchema = z.object({
  attempt: attemptSchema,
  server_time: z.string(),
  questions: z.array(questionSchema).length(20),
});
export type AssessmentSnapshot = z.infer<typeof snapshotSchema>;
