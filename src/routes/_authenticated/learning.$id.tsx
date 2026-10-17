import { createFileRoute } from '@tanstack/react-router';
import { ActivityDetail } from '@/components/learn/ActivityDetail';
export const Route=createFileRoute('/_authenticated/learning/$id')({head:()=>({meta:[{title:'Learning activity — SmartCareer'},{name:'description',content:'Complete a private learning activity and review validated assessment feedback.'},{property:'og:title',content:'Learning activity — SmartCareer'},{property:'og:description',content:'Activity details and assessment evidence.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Page});
function Page(){const {id}=Route.useParams();return <ActivityDetail id={id}/>;}
