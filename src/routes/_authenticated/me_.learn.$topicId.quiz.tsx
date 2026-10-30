import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {TopicQuiz} from '@/components/learn/PersonalizedLearning';
import {curriculumQuery,quizQuery} from '@/lib/api/personalized-learning';
import {learningHead} from '@/lib/personalized-learning/head';
export const Route=createFileRoute('/_authenticated/me_/learn/$topicId/quiz')({head:()=>learningHead('Python topic checkpoint','Validate your understanding with a private five-question Python checkpoint.'),validateSearch:(s)=>z.object({attempt:z.string().uuid().optional()}).parse(s),loaderDeps:({search})=>({attempt:search.attempt}),loader:async({context,deps})=>{await context.queryClient.ensureQueryData(curriculumQuery());if(deps.attempt)await context.queryClient.ensureQueryData(quizQuery(deps.attempt));},component:Page});
function Page(){return <TopicQuiz topicId={Route.useParams().topicId} attempt={Route.useSearch().attempt}/>;}