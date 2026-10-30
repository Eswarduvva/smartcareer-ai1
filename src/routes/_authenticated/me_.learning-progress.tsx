import {createFileRoute} from '@tanstack/react-router';
import {AppShell} from '@/components/AppShell';
import {LearningProgress} from '@/components/learn/PersonalizedLearning';
import {curriculumQuery} from '@/lib/api/personalized-learning';
import {learningHead} from '@/lib/personalized-learning/head';
export const Route=createFileRoute('/_authenticated/me_/learning-progress')({head:()=>learningHead('Learning progress','Your verified Python topic completions, saved quiz attempts and recorded learning time.'),loader:({context})=>context.queryClient.ensureQueryData(curriculumQuery()),component:Page});
function Page(){return <AppShell><LearningProgress/></AppShell>;}