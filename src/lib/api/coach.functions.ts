import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { coachHistorySchema } from './coach-schema';
export const getCoachHistory=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.from('coach_conversations').select('messages').eq('user_id',context.userId).maybeSingle();
 if(error)throw new Error('Unable to load your private conversation.');
 return coachHistorySchema.parse(data?.messages??[]);
});
export const clearCoachHistory=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {error}=await context.supabase.rpc('coach_clear');if(error)throw new Error('Wait for any current response before clearing history.');return {ok:true};
});