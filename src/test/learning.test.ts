import {describe,it,expect} from 'vitest';
import {baselineState,weightedScore,learningSummary} from '@/lib/learning/rules';
import {gradeSchema,activitySchema,snapshotSchema} from '@/lib/learning/schema';
import {CAREER_TRACKS} from '@/lib/careers';
const empty=()=>snapshotSchema.parse({user_id:'test',student_id:null,baseline:{},goal:'Data Analyst',baseline_source:'Self-reported',activities:[],resources:[],progress:[],assessments:[],history:[],sessions:[],attendance:[],policy:{version:1,mastery_weight:0.6,assessment_weight:0.25,project_weight:0.15,project_target:3}});
describe('learning evidence rules',()=>{
 it('accepts confirmed 0–100 skill boundaries',()=>{expect(baselineState(0)).toBe('valid');expect(baselineState(100)).toBe('valid');});
 it('flags negative skill values without correcting them',()=>expect(baselineState(-5)).toBe('invalid'));
 it('flags scores above the confirmed maximum',()=>expect(baselineState(101)).toBe('invalid'));
 it('keeps missing baselines unknown instead of zero',()=>{expect(baselineState(null)).toBe('missing');expect(weightedScore([])).toBeNull();expect(learningSummary(empty()).skills[0]?.change).toBeNull();});
 it('computes validated mastery from weighted assessments',()=>expect(weightedScore([{score:50,weight:1},{score:100,weight:3}])).toBe(87.5));
 it('excludes attendance from mastery and readiness',()=>{const a=empty();const before=learningSummary(a);a.attendance.push({id:'class',session_id:'session',created_at:'2026-10-17T10:00:00Z'});expect(learningSummary(a).mastery).toBe(before.mastery);expect(learningSummary(a).readiness).toBeNull();});
 it('requires evidence for every career skill before readiness',()=>{const a=empty();a.assessments.push({id:'e',progress_id:'p',skill:'python_score',score:100,weight:1,feedback:'Evidence',created_at:'2026-10-17T10:00:00Z'});expect(learningSummary(a).readiness).toBeNull();});
 it('uses transparent readiness weights without attendance or points',()=>{const a=empty();const track=CAREER_TRACKS.find(t=>t.role==='Data Analyst');if(!track)throw Error('Missing track');a.assessments=track.skills.map((skill,i)=>({id:String(i),progress_id:String(i),skill,score:80,weight:1,feedback:'Evidence',created_at:'2026-10-17T10:00:00Z'}));expect(learningSummary(a).readiness).toBe(68);});
 it('rejects invalid authorized grade input',()=>{expect(gradeSchema.safeParse({progress:'00000000-0000-4000-8000-000000000001',score:101,feedback:'Evidence'}).success).toBe(false);});
 it('requires a matching objective answer key',()=>{expect(activitySchema.safeParse({title:'Quiz',description:'Assessment',skill:'python_score',difficulty:'beginner',career:'Data Analyst',kind:'quiz',content:{questions:[{prompt:'2+2?',options:['3','4']}]},answers:[2],points:10,evidence_weight:1}).success).toBe(false);});
});
