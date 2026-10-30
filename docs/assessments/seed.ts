// Run explicitly after deploying the additive assessment migration. No student data is touched.
import { createClient } from '@supabase/supabase-js';
import bank from './question-bank.json';
const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
if (!url || !key) throw new Error('Server-side seed configuration unavailable');
const client = createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{
 const h=new Headers(init?.headers); if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization'); h.set('apikey',key); return fetch(input,{...init,headers:h});
}}});
// Insert only missing immutable bank keys; never overwrite questions used by existing attempts.
const r = await client.from('assessment_questions').upsert(bank,{onConflict:'bank_key',ignoreDuplicates:true});
if(r.error)throw new Error(`Question bank insert failed (${r.error.code})`);
console.log('Inserted missing predefined questions without changing existing records.');
