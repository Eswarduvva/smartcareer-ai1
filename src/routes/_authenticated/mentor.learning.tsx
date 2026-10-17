import {createFileRoute} from '@tanstack/react-router';
import {LearningManagement} from '@/components/learn/LearningManagement';
export const Route=createFileRoute('/_authenticated/mentor/learning')({head:()=>({meta:[{title:'Learning reviews — SmartCareer'},{name:'description',content:'Review evidence for assigned students.'},{property:'og:title',content:'Learning reviews — SmartCareer'},{property:'og:description',content:'Assigned-student learning evidence and rubric reviews.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:LearningManagement});
