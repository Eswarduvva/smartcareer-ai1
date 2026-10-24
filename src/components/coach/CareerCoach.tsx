import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, MessageCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation,ConversationContent,ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message,MessageContent,MessageResponse } from '@/components/ai-elements/message';
import { PromptInput,PromptInputTextarea,PromptInputFooter,PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { useSession } from '@/lib/auth';
import { getCoachHistory,clearCoachHistory } from '@/lib/api/coach.functions';
import { coachHistorySchema,type CoachMessage } from '@/lib/api/coach-schema';
import { supabase } from '@/integrations/supabase/client';
import emblem from '@/assets/coach-emblem.png';

export function CareerCoach(){
 const [open,setOpen]=useState(false);const session=useSession();
 return <>
  {!open&&<Button className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full border border-gold/40 shadow-xl" aria-label="Open SmartCareer AI Coach" title="SmartCareer AI Coach" onClick={()=>setOpen(true)}><MessageCircle className="size-6"/></Button>}
  {open&&<section role="dialog" aria-modal="false" aria-labelledby="career-coach-title" className="fixed bottom-3 right-3 z-50 flex h-[min(700px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-[440px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl sm:bottom-5 sm:right-5">
   <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-4"><img src={emblem} alt="" width={40} height={40} className="h-10 w-10 object-contain"/><div className="min-w-0 flex-1"><h2 id="career-coach-title" className="text-base font-semibold">SmartCareer AI Coach</h2><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="size-3"/>Private career guidance</p></div><Button variant="ghost" size="icon" aria-label="Close coach" title="Close coach" onClick={()=>setOpen(false)}><X/></Button></header>
   {session===undefined?<div className="p-6"><Shimmer>Loading your coach…</Shimmer></div>:session?<CoachConversation key={session.user.id} userId={session.user.id}/>:<div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center"><img src={emblem} width={80} height={80} alt="Career compass"/><h3 className="font-display text-2xl">Your next direction</h3><p className="text-sm leading-relaxed text-muted-foreground">Welcome! Let’s explore your career options, skills and next steps.</p><Button asChild><Link to="/auth" search={{mode:'signin',redirect:undefined}} onClick={()=>setOpen(false)}>Sign in to chat<ArrowUpRight/></Link></Button></div>}
  </section>}
 </>;
}

function CoachConversation({userId}:{userId:string}){
 const load=useServerFn(getCoachHistory);const clear=useServerFn(clearCoachHistory);const qc=useQueryClient();
 const q=useQuery({queryKey:['career-coach',userId],queryFn:()=>load(),staleTime:0});
 const [messages,setMessages]=useState<CoachMessage[]>([]);const [draft,setDraft]=useState('');const [status,setStatus]=useState<'ready'|'submitted'|'streaming'|'error'>('ready');const [error,setError]=useState('');const [clearing,setClearing]=useState(false);
 const input=useRef<HTMLTextAreaElement>(null);const abort=useRef<AbortController|null>(null);
 useEffect(()=>{if(q.data)setMessages(q.data);},[q.data]);
 useEffect(()=>{input.current?.focus();},[q.isPending,status]);
 useEffect(()=>()=>abort.current?.abort(),[]);
 const busy=status==='submitted'||status==='streaming';
 async function send(){
  if(!draft.trim()||busy)return;
  const text=draft.trim();const requestId=crypto.randomUUID();const assistantId=crypto.randomUUID();const control=new AbortController();abort.current=control;
  setMessages(m=>[...m,{id:requestId,role:'user',parts:[{type:'text',text}]}]);setStatus('submitted');setError('');setDraft('');input.current?.focus();
  let output='';let done=false;
  try{
   const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Please sign in again.');
   const response=await fetch('/api/public/career-coach',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({requestId,text}),signal:control.signal});
   if(!response.ok){const body=await response.json();throw new Error(typeof body.error==='string'?body.error:'Unable to reach your coach.');}
   const reader=response.body?.getReader();if(!reader)throw new Error('No response was received.');
   const decoder=new TextDecoder();let buffer='';
   while(true){const chunk=await reader.read();buffer+=decoder.decode(chunk.value,{stream:!chunk.done});const lines=buffer.split('\n');buffer=lines.pop()??'';
    for(const line of lines){if(!line.trim())continue;const event:unknown=JSON.parse(line);if(!event||typeof event!=='object'||!('type' in event))continue;
     if(event.type==='delta'&&'text' in event&&typeof event.text==='string'){output+=event.text;setStatus('streaming');const current=output;setMessages(m=>[...m.filter(x=>x.id!==assistantId),{id:assistantId,role:'assistant',parts:[{type:'text',text:current}]}]);}
     if(event.type==='done')done=true;
     if(event.type==='error'&&'message' in event)throw new Error(String(event.message));
    }
    if(chunk.done)break;
   }
   if(!done)throw new Error('The response stopped before completion.');
   setStatus('ready');await qc.invalidateQueries({queryKey:['career-coach',userId]});
  }catch(e){setError(control.signal.aborted?'Response stopped. Your question remains in history.':e instanceof Error?e.message:'Unable to reach your coach.');setStatus('error');if(!output)setDraft(text);}
  finally{abort.current=null;input.current?.focus();}
 }
 async function erase(){if(!window.confirm('Delete your private conversation history?'))return;setClearing(true);try{await clear();setMessages([]);setError('');setStatus('ready');await qc.invalidateQueries({queryKey:['career-coach',userId]});}catch(e){setError(e instanceof Error?e.message:'Unable to clear history.');}finally{setClearing(false);input.current?.focus();}}
 return <>
  <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2"><span className="text-xs text-muted-foreground">Your conversation</span><Button variant="ghost" size="icon-sm" title="Clear private history" aria-label="Clear private history" disabled={busy||clearing||!messages.length} onClick={erase}><Trash2/></Button></div>
  <Conversation className="min-h-0 flex-1" initial="instant" resize="instant"><ConversationContent className="gap-5 p-5">
   {q.isPending?<Shimmer>Loading private history…</Shimmer>:q.error?<div role="alert"><p className="text-sm text-destructive">Unable to load your conversation.</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>q.refetch()}>Retry</Button></div>:<>
    {!messages.length&&<div className="py-5"><img src={emblem} alt="Career compass" width={64} height={64} className="mb-5 h-16 w-16"/><h3 className="font-display text-2xl">Where would you like to go?</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Welcome! I’m your SmartCareer AI Coach. Tell me about your education, interests or career goals.</p><div className="mt-5 flex flex-col items-start gap-2">{['What are my career options after BCA?','Which skills should I develop next?','Give me a Python practice question'].map(t=><Button variant="outline" key={t} className="h-auto max-w-full whitespace-normal py-2 text-left text-xs" onClick={()=>{setDraft(t);input.current?.focus();}}>{t}<ArrowUpRight className="shrink-0"/></Button>)}</div></div>}
    {messages.map(m=><Message key={m.id} from={m.role}><MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">{m.parts.map((p,i)=><MessageResponse key={i} isAnimating={busy&&m.role==='assistant'}>{p.text}</MessageResponse>)}</MessageContent></Message>)}
    {status==='submitted'&&<Shimmer>Thinking about your next step…</Shimmer>}
   </>}
  </ConversationContent><ConversationScrollButton/></Conversation>
  <footer className="shrink-0 border-t border-border bg-card p-4">
   {error&&<p role="alert" className="mb-3 text-xs leading-relaxed text-destructive">{error}</p>}
   <PromptInput onSubmit={()=>send()}><PromptInputTextarea ref={input} aria-label="Ask SmartCareer AI Coach" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000} disabled={q.isPending||!!q.error||clearing} placeholder="Ask about your next step…" className="min-h-20 max-h-36 text-sm"/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={()=>abort.current?.abort()} disabled={!busy&&(!draft.trim()||q.isPending||!!q.error||clearing)} aria-label={busy?'Stop response':'Send question'}/></PromptInputFooter></PromptInput>
   <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">AI guidance, not a validated assessment or job guarantee.</p>
  </footer>
 </>;
}