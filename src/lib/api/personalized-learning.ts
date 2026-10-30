import { queryOptions } from '@tanstack/react-query';
import { getCurriculum, getTopicLesson, getTopicQuiz, getCurriculumAdmin, getCurriculumStaff } from './personalized-learning.functions';
export const curriculumQuery = () => queryOptions({ queryKey:['personalized-learning'],queryFn:()=>getCurriculum({data:{}}),staleTime:0 });
export const lessonQuery = (topic:string) => queryOptions({queryKey:['personalized-lesson',topic],queryFn:()=>getTopicLesson({data:{topic}}),staleTime:0});
export const quizQuery = (attempt:string) => queryOptions({queryKey:['personalized-quiz',attempt],queryFn:()=>getTopicQuiz({data:{attempt}}),staleTime:0});
export const curriculumAdminQuery = () => queryOptions({queryKey:['personalized-admin'],queryFn:()=>getCurriculumAdmin(),staleTime:0});
export const curriculumStaffQuery = () => queryOptions({queryKey:['personalized-staff'],queryFn:()=>getCurriculumStaff(),staleTime:0});