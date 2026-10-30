import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { assessmentListQuery } from '@/lib/api/assessments';
import { SUBJECTS } from '@/lib/assessments/rules';
export function AssessmentSummary() {
 const q=useQuery(assessmentListQuery());
 return <section className="border-y border-border py-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl">Verified skill proficiency</h2><Link to="/me/assessments" className="text-sm text-primary hover:underline">Assessments →</Link></div>
  {q.error?<p role="alert" className="text-sm text-gap">Unable to load verified scores.</p>:q.isPending?<p className="text-sm text-muted-foreground">Loading verified scores…</p>:q.data.latest.length?<ul className="grid gap-4 sm:grid-cols-3">{q.data.latest.map(s=><li key={s.skill} className="border-l-2 border-primary pl-4"><p className="text-sm">{SUBJECTS.find(x=>x.id===s.skill)?.label}</p><p className="num text-2xl">{s.percentage}% <span className="text-xs text-muted-foreground">{s.proficiency}</span></p></li>)}</ul>:<p className="text-sm text-muted-foreground">No verified assessments yet.</p>}
  <p className="mt-3 text-xs text-muted-foreground">Assessment evidence is separate from self-reported skills and career fit.</p>
  {q.data?.attempts.length ? <p className="mt-2 text-xs text-muted-foreground">{q.data.attempts.filter(a=>a.status==='finalized').length} completed assessments · full history in Assessments</p>:null}
 </section>;
}
