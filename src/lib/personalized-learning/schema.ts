import { z } from 'zod';
import { SKILL_KEYS } from '@/lib/skills';

export const preferencesSchema = z.object({
  goal: z.string().trim().min(1).max(160),
  hours: z.number().int().min(1).max(40),
  weeks: z.number().int().min(1).max(52),
  style: z.enum(['examples', 'reading', 'practice']),
});
const resource = z.object({ title: z.string().min(1).max(200), url: z.string().url().refine(v => new URL(v).protocol === 'https:') });
export const notesSchema = z.object({
  introduction: z.string().min(1).max(6000), objectives: z.array(z.string()).min(1).max(20),
  explanation: z.string().min(1).max(16000), definitions: z.array(z.string()).min(1).max(30),
  code: z.string().min(1).max(10000), applications: z.array(z.string()).min(1).max(20),
  mistakes: z.array(z.string()).min(1).max(20), exercises: z.array(z.string()).min(1).max(20),
  takeaways: z.array(z.string()).min(1).max(20), resources: z.array(resource).min(1).max(10),
});
export const authoredQuestionSchema = z.object({ prompt: z.string().min(1).max(1000), options: z.array(z.string().min(1).max(500)).length(4), correct_option: z.number().int().min(0).max(3), explanation: z.string().min(1).max(4000) });
export const topicSchema = z.object({ id: z.string(), module_id: z.string().uuid(), title: z.string(), position: z.number(), prerequisite: z.string().nullable(), estimated_minutes: z.number() });
export const moduleSchema = z.object({ id: z.string().uuid(), slug: z.string(), title: z.string(), version: z.number(), status: z.enum(['draft','approved']) });
export const attemptSchema = z.object({ id: z.string().uuid(), topic_id: z.string(), status: z.enum(['active','finalized']), started_at: z.string(), submitted_at: z.string().nullable(), marks: z.number().nullable(), percentage: z.number().nullable(), passed: z.boolean().nullable() });
export const questionSchema = z.object({ id: z.string().uuid(), prompt: z.string(), options: z.array(z.string()).length(4), selected_option: z.number().nullable(), position: z.number(), correct_option: z.number().optional(), explanation: z.string().optional() });
export const quizSchema = z.object({ attempt: attemptSchema, questions: z.array(questionSchema).length(5) });
export const milestoneSchema = z.object({ week: z.number().int().min(1).max(52), topic_ids: z.array(z.string()).max(100), exercise: z.string().max(2000) });
export const generatedPlanSchema = z.object({ topic_ids: z.array(z.string()).max(100), milestones: z.array(milestoneSchema).max(52), guidance: z.string().max(4000) });
export const savedPlanSchema = generatedPlanSchema.omit({ milestones: true }).extend({ id: z.string().uuid(), module_id: z.string().uuid(), preferences: preferencesSchema, model: z.string(), catalog_version: z.number(), created_at: z.string() });
export const snapshotSchema = z.object({ modules: z.array(moduleSchema), topics: z.array(topicSchema), progress: z.array(z.object({ topic_id: z.string(), started_at: z.string(), completed_at: z.string().nullable(), passed_attempt: z.string().uuid().nullable() })), attempts: z.array(attemptSchema), plans: z.array(savedPlanSchema), milestones: z.array(milestoneSchema.extend({ roadmap_id: z.string().uuid() })), sessions: z.array(z.object({ topic_id: z.string(), active_seconds: z.number() })) });
export const lessonSchema = z.object({ topic: topicSchema, notes: notesSchema });
export type LearningSnapshot = z.infer<typeof snapshotSchema>;
export type LearningPreferences = z.infer<typeof preferencesSchema>;
export type Topic = z.infer<typeof topicSchema>;

export function topicState(topic: Topic, progress: LearningSnapshot['progress']) {
  const p = progress.find(p => p.topic_id === topic.id);
  if (p?.completed_at) return 'Completed';
  if (topic.prerequisite && !progress.some(p => p.topic_id === topic.prerequisite && p.completed_at)) return 'Locked';
  return p ? 'In Progress' : 'Not Started';
}
export function quizResult(correct: number) {
  if (!Number.isInteger(correct) || correct < 0 || correct > 5) throw new Error('Invalid quiz mark');
  return { percentage: correct * 20, passed: correct >= 4 };
}
export function validatePlan(value: unknown, topics: Topic[], progress: LearningSnapshot['progress'], preferences: LearningPreferences) {
  const plan = generatedPlanSchema.parse(value);
  const remaining = topics.filter(t => !progress.some(p => p.topic_id === t.id && p.completed_at)).sort((a,b) => a.position-b.position).map(t => t.id);
  if (JSON.stringify(remaining) !== JSON.stringify(plan.topic_ids)) throw new Error('Plan changed the approved prerequisite sequence');
  const scheduled = plan.milestones.flatMap(m => m.topic_ids);
  if (JSON.stringify(scheduled) !== JSON.stringify(remaining) || plan.milestones.some(m => m.week > preferences.weeks)) throw new Error('Invalid milestone coverage');
  if (new Set(plan.milestones.map(m => m.week)).size !== plan.milestones.length) throw new Error('Duplicate milestone week');
  if (plan.milestones.some((m,i)=>i>0 && m.week<=(plan.milestones[i-1]?.week??0))) throw new Error('Milestone weeks must increase');
  return plan;
}
export function plannerContext(profile:unknown,learning:unknown){
  const record=(v:unknown):Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v)?Object.fromEntries(Object.entries(v)):{};
  const root=record(profile),l=record(learning);
  const strings=(v:unknown,keys:string[])=>{const r=record(v);return Object.fromEntries(keys.flatMap(k=>typeof r[k]==='string'?[ [k,String(r[k]).slice(0,160)] ]:[]));};
  const numeric=(v:unknown)=>Object.fromEntries(Object.entries(record(v)).filter(([k,v])=>SKILL_KEYS.some(key=>key===k)&&typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100));
  return {education:strings(root['student'],['degree','branch','specialization']),interests:strings(root['preferences'],['primary_interest','secondary_interest','preferred_work_role']),goal:strings(root['goals'],['career_goal']),skills:numeric(l['baseline']),learningGoal:typeof l['goal']==='string'?l['goal'].slice(0,160):null};
}
export function standardPlan(topics: Topic[], progress: LearningSnapshot['progress'], preferences: LearningPreferences) {
  const remaining = topics.filter(t => !progress.some(p => p.topic_id===t.id && p.completed_at)).sort((a,b)=>a.position-b.position);
  const milestones: z.infer<typeof milestoneSchema>[] = [];
  remaining.forEach((t,i) => {
    const week = Math.min(preferences.weeks, Math.floor(i * preferences.weeks / Math.max(1, remaining.length)) + 1);
    let m = milestones.find(m => m.week===week);
    if (!m) { m={week,topic_ids:[],exercise:'Complete the approved topic exercises and knowledge checkpoints.'}; milestones.push(m); }
    m.topic_ids.push(t.id);
  });
  return {topic_ids:remaining.map(t=>t.id),milestones,guidance:'Approved standard sequence. Schedule estimates are not recorded learning time.'};
}