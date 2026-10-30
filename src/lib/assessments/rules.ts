export const SUBJECTS = [
  { id: 'python', label: 'Python', topics: 'Collections, functions and generators' },
  { id: 'sql', label: 'SQL', topics: 'Queries, joins and window functions' },
  { id: 'java', label: 'Java', topics: 'Types, collections and streams' },
  { id: 'javascript', label: 'JavaScript', topics: 'Arrays, closures and the event loop' },
  { id: 'cpp', label: 'C++', topics: 'References, ownership and lambdas' },
  { id: 'data-analysis', label: 'Data Analysis', topics: 'Statistics, data quality and interpretation' },
] as const;
export const ASSESSMENT_MINUTES = 25;
export const SELECTION = { beginner: 8, intermediate: 8, advanced: 4 } as const;
export const MARKS = { beginner: 1, intermediate: 2, advanced: 4 } as const;
export const MAX_MARKS = 40;
export function proficiency(percentage: number) {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) throw new Error('Invalid percentage');
  return percentage >= 70 ? 'Strong' : percentage >= 40 ? 'Developing' : 'Building';
}
export function weightedScore(answers: { difficulty: keyof typeof MARKS; selected_option: number | null; correct_option: number }[]) {
  const marks = answers.reduce((total, q) => total + (q.selected_option === q.correct_option ? MARKS[q.difficulty] : 0), 0);
  return { marks, percentage: marks / MAX_MARKS * 100 };
}
export function assessmentHead(title: string, description: string) {
  return { meta: [{ title: `${title} — SmartCareer` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — SmartCareer` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] };
}
