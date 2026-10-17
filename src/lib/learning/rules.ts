import type { LearningSnapshot } from './schema';
import { SKILLS, STRONG_THRESHOLD, SCORE_MAX } from '@/lib/skills';
import { trackByRole, CAREER_TRACKS } from '@/lib/careers';
export function baselineState(value:unknown): 'missing'|'invalid'|'valid' { return value===null || value===undefined ? 'missing' : typeof value!=='number' || !Number.isFinite(value) || value<0 || value>SCORE_MAX ? 'invalid':'valid'; }
export function weightedScore(results: {score:number;weight:number}[]):number|null { const valid=results.filter(r=>baselineState(r.score)==='valid' && r.weight>0); return valid.length ? Math.round(valid.reduce((s,r)=>s+r.score*r.weight,0)/valid.reduce((s,r)=>s+r.weight,0)*100)/100:null; }
export function learningSummary(s:LearningSnapshot, career?:string) {
 const track=trackByRole(career??s.goal)??CAREER_TRACKS.find(t=>t.domain===s.goal);
 const skills=SKILLS.map(k=>{const current=weightedScore(s.assessments.filter(a=>a.skill===k.key));const baseline=s.baseline[k.key];return {...k,baseline,state:baselineState(baseline),current,change:current!==null&&baselineState(baseline)==='valid'?current-Number(baseline):null,gap:current!==null?Math.max(0,STRONG_THRESHOLD-current):null};});
 const required=track?skills.filter(k=>track.skills.includes(k.key)):[];
 const known=required.filter(k=>k.current!==null);
 const mastery=known.length?known.reduce((a,k)=>a+(k.current??0),0)/known.length:null;
 const evidence=s.assessments.filter(a=>required.some(k=>k.key===a.skill));
 const assessment=weightedScore(evidence);
 const projects=s.progress.filter(p=>p.status==='completed'&&s.activities.some(a=>a.id===p.activity_id&&a.kind==='project'&&required.some(k=>k.key===a.skill))).length;
 const readiness=required.length&&known.length===required.length&&mastery!==null&&assessment!==null?Math.round(mastery*s.policy.mastery_weight+assessment*s.policy.assessment_weight+Math.min(1,projects/s.policy.project_target)*100*s.policy.project_weight):null;
 const completed=s.progress.filter(p=>p.status==='completed');
 const days=new Set(completed.map(p=>p.created_at.slice(0,10)));let streak=0;const today=new Date();today.setUTCHours(0,0,0,0); if(!days.has(today.toISOString().slice(0,10)))today.setUTCDate(today.getUTCDate()-1);while(days.has(today.toISOString().slice(0,10))){streak++;today.setUTCDate(today.getUTCDate()-1);}
 return {skills,required,track,mastery,readiness,projects,completed:completed.length,points:completed.reduce((a,p)=>a+p.points,0),streak,coverage:known.length,totalRequired:required.length};
}
