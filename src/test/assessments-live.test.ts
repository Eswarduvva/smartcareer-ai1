import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { snapshotSchema } from '@/lib/assessments/schema';
describe.skipIf(process.env['ASSESSMENT_LIVE_TESTS']!=='1')('live assessment privacy and grading',()=>{
 let admin:SupabaseClient<Database>,a:SupabaseClient<Database>,b:SupabaseClient<Database>,anon:SupabaseClient<Database>;
 const users:string[]=[]; const attempts:string[]=[];
 async function start(skill:string){const r=await a.rpc('assessment_start',{p_skill:skill});expect(r.error).toBeNull();if(!r.data)throw new Error('No attempt');attempts.push(r.data);return r.data;}
 beforeAll(async()=>{
  const url=process.env['SUPABASE_URL'],key=process.env['SUPABASE_SERVICE_ROLE_KEY'],pub=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!url||!key||!pub)throw new Error('Live test configuration unavailable');
  const client=(k:string)=>createClient<Database>(url,k,{auth:{persistSession:false,autoRefreshToken:false,storageKey:crypto.randomUUID()},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(k.startsWith('sb_')&&h.get('Authorization')===`Bearer ${k}`)h.delete('Authorization');h.set('apikey',k);return fetch(input,{...init,headers:h});}}});
  admin=client(key);anon=client(pub);
  for(let i=0;i<2;i++){
   const email=`assessment-check-${crypto.randomUUID()}@example.com`,password=crypto.randomUUID()+'Aa1!';
   const r=await admin.auth.admin.createUser({email,password,email_confirm:true});if(r.error||!r.data.user)throw new Error('Cannot create test user');users.push(r.data.user.id);
   const c=client(pub);if((await c.auth.signInWithPassword({email,password})).error)throw new Error('Cannot sign in test user');if(i===0)a=c;else b=c;
  }
 },30000);
 afterAll(async()=>{for(const u of users){await admin.from('student_skill_proficiency').delete().eq('user_id',u);await admin.from('student_assessments').delete().eq('user_id',u);const r=await admin.auth.admin.deleteUser(u);if(r.error)throw new Error('Test cleanup failed');}},30000);
 it('blocks anonymous access and direct student question/key reads and writes',async()=>{
  expect((await anon.rpc('assessment_start',{p_skill:'python'})).error).not.toBeNull();
  expect((await anon.from('student_assessments').select('*')).error).not.toBeNull();
  expect((await a.from('assessment_questions').select('*')).error).not.toBeNull();
  expect((await a.from('student_assessments').insert({user_id:users[0]??'',skill:'python'})).error).not.toBeNull();
  expect((await a.from('student_skill_proficiency').select('*')).data).toEqual([]);
 });
 it('selects 8/8/4, keeps the 25-minute deadline and hides keys on refresh',async()=>{
  const id=await start('python');const one=snapshotSchema.parse((await a.rpc('assessment_snapshot',{p_attempt:id})).data);
  expect(one.questions.filter(q=>q.difficulty==='beginner')).toHaveLength(8);expect(one.questions.filter(q=>q.difficulty==='intermediate')).toHaveLength(8);expect(one.questions.filter(q=>q.difficulty==='advanced')).toHaveLength(4);
  expect(Date.parse(one.attempt.expires_at)-Date.parse(one.attempt.started_at)).toBe(25*60*1000);
  expect(one.questions.every(q=>q.correct_option===undefined&&q.explanation===undefined)).toBe(true);
  expect((await a.rpc('assessment_start',{p_skill:'python'})).data).toBe(id);
  const q=one.questions[0];if(!q)throw new Error('No question');
  expect((await a.rpc('assessment_save',{p_attempt:id,p_question:q.id,p_option:2})).error).toBeNull();
  const two=snapshotSchema.parse((await a.rpc('assessment_snapshot',{p_attempt:id})).data);
  expect(two.attempt.expires_at).toBe(one.attempt.expires_at);expect(two.questions[0]?.selected_option).toBe(2);
 });
 it('denies another account reads, saves, submissions and result access',async()=>{
  const id=attempts[0];if(!id)throw new Error('Missing attempt');
  expect((await b.from('student_assessments').select('*').eq('id',id)).data).toEqual([]);
  expect((await b.from('assessment_answers').select('*').eq('attempt_id',id)).data).toEqual([]);
  expect((await b.rpc('assessment_snapshot',{p_attempt:id})).error).not.toBeNull();
  expect((await b.rpc('assessment_submit',{p_attempt:id})).error).not.toBeNull();
  expect((await b.rpc('assessment_save',{p_attempt:id,p_question:crypto.randomUUID(),p_option:0})).error).not.toBeNull();
 });
 it('grades 40 marks to 100% on server, finalizes once and exposes explanations only afterward',async()=>{
  const id=attempts[0];if(!id)throw new Error('Missing attempt');
  const answers=await admin.from('assessment_answers').select('question_id').eq('attempt_id',id);
  for(const answer of answers.data??[]){const key=await admin.from('assessment_questions').select('correct_option').eq('id',answer.question_id).single();if(!key.data)throw new Error('No key');expect((await a.rpc('assessment_save',{p_attempt:id,p_question:answer.question_id,p_option:key.data.correct_option})).error).toBeNull();}
  const concurrent=await Promise.all([a.rpc('assessment_submit',{p_attempt:id}),a.rpc('assessment_submit',{p_attempt:id})]);
  for(const r of concurrent){expect(r.error).toBeNull();const s=snapshotSchema.parse(r.data);expect(s.attempt.marks).toBe(40);expect(s.attempt.percentage).toBe(100);expect(s.questions.every(q=>q.correct_option!==undefined&&!!q.explanation)).toBe(true);}
  expect(snapshotSchema.parse(concurrent[0]?.data).attempt.submitted_at).toBe(snapshotSchema.parse(concurrent[1]?.data).attempt.submitted_at);
  expect((await a.from('student_skill_proficiency').select('*').eq('skill','python')).data).toHaveLength(1);
  expect((await b.from('student_skill_proficiency').select('*')).data).toEqual([]);
 },30000);
 it('rejects invalid and foreign question answers',async()=>{
  const id=await start('java');
  expect((await a.rpc('assessment_save',{p_attempt:id,p_question:crypto.randomUUID(),p_option:1})).error).not.toBeNull();
  expect((await a.rpc('assessment_save',{p_attempt:id,p_question:crypto.randomUUID(),p_option:4})).error).not.toBeNull();
  expect((await a.rpc('assessment_snapshot',{p_attempt:crypto.randomUUID()})).error).not.toBeNull();
 });
 it('automatically finalizes overdue attempts without accepting a late answer',async()=>{
  const id=await start('sql');const original=snapshotSchema.parse((await a.rpc('assessment_snapshot',{p_attempt:id})).data);const q=original.questions[0];if(!q)throw new Error('No question');
  expect((await admin.from('student_assessments').update({expires_at:new Date(Date.now()-1000).toISOString()}).eq('id',id)).error).toBeNull();
  const r=await a.rpc('assessment_save',{p_attempt:id,p_question:q.id,p_option:0});expect(r.error).toBeNull();
  const s=snapshotSchema.parse(r.data);expect(s.attempt.status).toBe('finalized');expect(s.attempt.marks).toBe(0);expect(s.questions[0]?.selected_option).toBeNull();
 });
});