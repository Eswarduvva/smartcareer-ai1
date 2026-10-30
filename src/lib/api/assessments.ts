import { queryOptions } from '@tanstack/react-query';
import { getAssessment, listAssessments } from './assessments.functions';
export const assessmentListQuery = () => queryOptions({ queryKey: ['assessments'], queryFn: () => listAssessments(), staleTime: 0 });
export const assessmentQuery = (attempt: string) => queryOptions({ queryKey: ['assessment', attempt], queryFn: () => getAssessment({ data: { attempt } }), staleTime: 0 });
