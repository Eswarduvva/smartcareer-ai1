import { describe,it,expect } from 'vitest';
import { coachProfileContext,coachRequestSchema } from '@/lib/api/coach-schema';
describe('career coach privacy and input',()=>{
 it('excludes identifiers, demographics and unknown profile fields',()=>{
  const context=coachProfileContext({student:{student_id:'private-id',degree:'BCA',city:'private-city',gender:'private-gender'},preferences:{primary_interest:'Data',preferred_location:'private-place'},secret:'private-secret',benchmark:{avg_readiness:75},otherStudents:[{name:'private-person'}]});
  expect(context.education).toEqual({degree:'BCA'});expect(context.interests).toEqual({primary_interest:'Data'});expect(JSON.stringify(context)).not.toContain('private-');expect(context).not.toHaveProperty('benchmark');
 });
 it('allows questions up to 2000 characters and rejects longer or empty questions',()=>{
  const requestId='12345678-1234-4234-8234-123456789abc';
  expect(coachRequestSchema.safeParse({requestId,text:'a'.repeat(2000)}).success).toBe(true);
  expect(coachRequestSchema.safeParse({requestId,text:'a'.repeat(2001)}).success).toBe(false);
  expect(coachRequestSchema.safeParse({requestId,text:'  '}).success).toBe(false);
 });
});