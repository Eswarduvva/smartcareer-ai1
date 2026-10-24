import { z } from 'zod';
export const coachMessageSchema = z.object({id:z.string(),role:z.enum(['user','assistant']),parts:z.array(z.object({type:z.literal('text'),text:z.string()}))});
export const coachHistorySchema = z.array(coachMessageSchema);
export const coachRequestSchema = z.object({requestId:z.string().uuid(),text:z.string().trim().min(1).max(2000)});
export type CoachMessage = z.infer<typeof coachMessageSchema>;
const object = (value:unknown):Record<string,unknown> => typeof value==='object' && value!==null && !Array.isArray(value) ? Object.fromEntries(Object.entries(value)) : {};
const pick = (value:unknown, keys:string[]) => { const row=object(value);return Object.fromEntries(keys.filter(k=>row[k]!=null).map(k=>[k,row[k]])); };
/** Never pass raw profile JSON, identifiers, demographics or cohort benchmarks to the model. */
export function coachProfileContext(value:unknown){
 const row=object(value);
 return {education:pick(row['student'],['degree','branch','specialization','graduation_year']),interests:pick(row['preferences'],['primary_interest','secondary_interest','preferred_industry','preferred_work_role']),goal:pick(row['goals'],['career_goal']),experience:pick(row['experience'],['project_count','internship_count','certification_count']),recordedRecommendation:pick(row['recommendation'],['recommended_career_domain','recommended_role','career_match_score','skill_gap_score'])};
}