import {createFileRoute} from '@tanstack/react-router';
import {TopicLesson} from '@/components/learn/PersonalizedLearning';
import {curriculumQuery,lessonQuery} from '@/lib/api/personalized-learning';
import {learningHead} from '@/lib/personalized-learning/head';
export const Route=createFileRoute('/_authenticated/me_/learn/$topicId/')({head:({params})=>learningHead(`Python lesson: ${params.topicId.replaceAll('-',' ')}`,'Approved Python learning notes, practical examples and knowledge checkpoints.'),loader:async({context,params})=>{await context.queryClient.ensureQueryData(lessonQuery(params.topicId));await context.queryClient.ensureQueryData(curriculumQuery());},component:Page});
function Page(){return <TopicLesson topicId={Route.useParams().topicId}/>;}