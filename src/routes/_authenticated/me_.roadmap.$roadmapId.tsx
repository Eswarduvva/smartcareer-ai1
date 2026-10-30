import {createFileRoute} from '@tanstack/react-router';
import {AppShell} from '@/components/AppShell';
import {PersonalizedRoadmap} from '@/components/learn/PersonalizedLearning';
import {curriculumQuery} from '@/lib/api/personalized-learning';
import {learningHead} from '@/lib/personalized-learning/head';
export const Route=createFileRoute('/_authenticated/me_/roadmap/$roadmapId')({head:()=>learningHead('Personalized Python roadmap','Your saved Python learning schedule and verified topic milestones.'),loader:({context})=>context.queryClient.ensureQueryData(curriculumQuery()),component:Page});
function Page(){const {roadmapId}=Route.useParams();return <AppShell><PersonalizedRoadmap roadmapId={roadmapId}/></AppShell>;}