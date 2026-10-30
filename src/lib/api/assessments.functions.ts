import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { attemptSchema, skillSchema, snapshotSchema } from '@/lib/assessments/schema';
const idSchema = z.object({ attempt: z.string().uuid() });
export const startAssessment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ skill: skillSchema }).parse(d)).handler(async ({ data, context }) => {
  const r = await context.supabase.rpc('assessment_start', { p_skill: data.skill });
  if (r.error) throw new Error('Unable to start assessment. The question bank may not be ready.');
  return z.string().uuid().parse(r.data);
});
export const getAssessment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(d => idSchema.parse(d)).handler(async ({ data, context }) => {
  const r = await context.supabase.rpc('assessment_snapshot', { p_attempt: data.attempt });
  if (r.error) throw new Error('Unable to load your assessment.');
  return snapshotSchema.parse(r.data);
});
export const saveAssessmentAnswer = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(d => idSchema.extend({ question: z.string().uuid(), option: z.number().int().min(0).max(3) }).parse(d)).handler(async ({ data, context }) => {
  const r = await context.supabase.rpc('assessment_save', { p_attempt: data.attempt, p_question: data.question, p_option: data.option });
  if (r.error) throw new Error('Your answer was not saved. Please retry before continuing.');
  return snapshotSchema.parse(r.data);
});
export const submitAssessment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(d => idSchema.parse(d)).handler(async ({ data, context }) => {
  const r = await context.supabase.rpc('assessment_submit', { p_attempt: data.attempt });
  if (r.error) throw new Error('Submission could not be saved. Please retry.');
  return snapshotSchema.parse(r.data);
});
export const listAssessments = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  // Snapshot overdue attempts before listing, so returning users see finalized results.
  const active = await context.supabase.from('student_assessments').select('id,expires_at').eq('user_id',context.userId).eq('status','active');
  if (active.error) throw new Error('Unable to load assessment history.');
  for (const attempt of active.data) {
    if (Date.parse(attempt.expires_at) <= Date.now()) {
      const r = await context.supabase.rpc('assessment_snapshot', { p_attempt: attempt.id });
      if (r.error) throw new Error('Unable to finalize your expired assessment.');
    }
  }
  const [attempts, latest] = await Promise.all([
    context.supabase.from('student_assessments').select('*').eq('user_id',context.userId).order('started_at',{ascending:false}),
    context.supabase.from('student_skill_proficiency').select('*').eq('user_id',context.userId),
  ]);
  if (attempts.error || latest.error) throw new Error('Unable to load assessment history.');
  return { attempts: z.array(attemptSchema).parse(attempts.data), latest: latest.data };
});
