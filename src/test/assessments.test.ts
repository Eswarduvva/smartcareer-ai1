import { describe, it, expect } from 'vitest';
import bank from '../../docs/assessments/question-bank.json';
import { SUBJECTS, MARKS, SELECTION, ASSESSMENT_MINUTES, weightedScore, proficiency } from '@/lib/assessments/rules';
describe('predefined assessment rules',()=>{
 it.each(SUBJECTS)('$label has 60 questions with 24/24/12 difficulties',s=>{
  const questions=bank.filter(q=>q.skill===s.id); expect(questions).toHaveLength(60);
  expect(questions.filter(q=>q.difficulty==='beginner')).toHaveLength(24);
  expect(questions.filter(q=>q.difficulty==='intermediate')).toHaveLength(24);
  expect(questions.filter(q=>q.difficulty==='advanced')).toHaveLength(12);
  expect(new Set(questions.map(q=>q.prompt)).size).toBe(60);
 });
 it('every question has exactly four distinct options and one valid key',()=>{
  expect(bank).toHaveLength(360);for(const q of bank){expect(q.options).toHaveLength(4);expect(new Set(q.options).size).toBe(4);expect(q.correct_option).toBeGreaterThanOrEqual(0);expect(q.correct_option).toBeLessThan(4);expect(q.explanation.length).toBeGreaterThan(20);}
 });
 it('selects 8 beginner, 8 intermediate and 4 advanced',()=>expect(SELECTION).toEqual({beginner:8,intermediate:8,advanced:4}));
 it('lasts exactly 25 minutes',()=>expect(ASSESSMENT_MINUTES).toBe(25));
 it('weights beginner 1, intermediate 2 and advanced 4 for 40 marks',()=>{
  expect(MARKS).toEqual({beginner:1,intermediate:2,advanced:4});
  const answers=(Object.keys(SELECTION) as (keyof typeof SELECTION)[]).flatMap(difficulty=>Array.from({length:SELECTION[difficulty]},()=>({difficulty,selected_option:0,correct_option:0})));
  expect(weightedScore(answers)).toEqual({marks:40,percentage:100});
 });
 it('unanswered questions earn zero and 1 correct advanced answer earns 10%',()=>expect(weightedScore([{difficulty:'beginner',selected_option:null,correct_option:0},{difficulty:'advanced',selected_option:2,correct_option:2}])).toEqual({marks:4,percentage:10}));
 it('uses explicit project proficiency bands',()=>{expect(proficiency(39.99)).toBe('Building');expect(proficiency(40)).toBe('Developing');expect(proficiency(69.99)).toBe('Developing');expect(proficiency(70)).toBe('Strong');expect(()=>proficiency(101)).toThrow();});
});