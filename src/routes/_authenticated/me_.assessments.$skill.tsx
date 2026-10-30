import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { AppShell } from '@/components/AppShell';
import { AssessmentAttempt } from '@/components/assessments/AssessmentAttempt';
import { assessmentQuery } from '@/lib/api/assessments';
import { assessmentHead } from '@/lib/assessments/rules';
export const Route=createFileRoute('/_authenticated/me_/assessments/$skill')({head:()=>assessmentHead('Take a skill assessment','Timed skill assessment with account-saved answers and a fixed deadline.'),validateSearch:(d:Record<string,unknown>)=>({attempt:z.string().uuid().optional().catch(undefined).parse(d['attempt'])}),loaderDeps:({search})=>({attempt:search.attempt}),loader:({context,deps})=>deps.attempt?context.queryClient.ensureQueryData(assessmentQuery(deps.attempt)):undefined,component:Page});
function Page(){const {skill}=Route.useParams();const {attempt}=Route.useSearch();return <AppShell>{attempt?<AssessmentAttempt attempt={attempt} skill={skill}/>:<div><h1 className="font-display text-2xl">Choose your assessment</h1><Link to="/me/assessments" className="mt-4 inline-block text-primary">Return to assessments →</Link></div>}</AppShell>;}
