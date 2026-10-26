// Deploy on the SmartCarrier project (hwbzxolvgiokzdrocojd) as Edge Function "smartcareer-retrieval".
// NOT part of the SmartCareer app. Read-only: selects ONLY the two owner-approved columns and
// returns aggregate, nonpersonal summaries. Required function secret: SMARTCARRIER_RAG_TOKEN
// (same value as in SmartCareer). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided by the platform
// and never leave this function.
import { createClient } from "npm:@supabase/supabase-js@2";

const APPROVED_COLUMNS = "recommended_career_domain,recommended_role"; // owner allowlist — do not extend without review
const VOCAB = new Set(["bca", "bsc", "btech", "bcom", "software developer", "data analyst", "data scientist", "ui/ux", "cloud", "devops", "python", "sql", "statistics", "machine learning", "programming", "communication", "career", "degree", "eligibility", "skills", "resource", "roadmap"]);
const GENERIC = new Set(["career", "degree", "eligibility", "skills", "resource", "roadmap"]);

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";
const clean = (v: unknown) => typeof v === "string" ? v.trim().slice(0, 80) : "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const token = Deno.env.get("SMARTCARRIER_RAG_TOKEN") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  if (!token || !safeEqual(auth, `Bearer ${token}`)) return new Response("Unauthorized", { status: 401 });

  let body: { version?: unknown; terms?: unknown; limit?: unknown };
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }
  const keys = Object.keys(body ?? {});
  if (body?.version !== 1 || !Array.isArray(body.terms) || body.terms.length > 10 || keys.some((k) => !["version", "terms", "limit"].includes(k)))
    return new Response("Bad request", { status: 400 });
  const terms = body.terms.filter((t): t is string => typeof t === "string" && VOCAB.has(t));
  if (terms.length !== body.terms.length) return new Response("Bad request", { status: 400 });
  const limit = Math.min(5, Number(body.limit) || 5);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const counts = new Map<string, { domain: string; role: string; n: number }>();
  let total = 0;
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await db.from("smartcarrier").select(APPROVED_COLUMNS).range(from, from + 999);
    if (error) return new Response("Unavailable", { status: 503 });
    for (const row of data ?? []) {
      const domain = clean((row as Record<string, unknown>).recommended_career_domain);
      const role = clean((row as Record<string, unknown>).recommended_role);
      if (!domain && !role) continue;
      total++;
      const k = `${domain}|${role}`;
      const e = counts.get(k) ?? { domain, role, n: 0 };
      e.n++; counts.set(k, e);
    }
    if (!data || data.length < 1000) break;
  }

  const specific = terms.filter((t) => !GENERIC.has(t));
  const matches = [...counts.values()]
    .filter((e) => e.n >= 5) // suppress rare combinations so no group points to individuals
    .filter((e) => !specific.length || specific.some((t) => `${e.domain} ${e.role}`.toLowerCase().includes(t.replace("ui/ux", "ui"))))
    .sort((a, b) => b.n - a.n)
    .slice(0, limit);

  const sources = matches.map((e) => ({
    reference: `knowledge:${slug(`${e.domain}-${e.role}`)}`,
    title: `Dataset pattern: ${e.role || "Unspecified role"} (${e.domain || "Unspecified domain"})`.slice(0, 160),
    kind: "career",
    text: `In the SmartCarrier dataset, ${e.n} of ${total} records were recommended the career domain "${e.domain}" with the role "${e.role}". This is an observed recommendation frequency, not an eligibility rule or skill requirement.`,
  }));
  return Response.json({ sources }, { headers: { "Cache-Control": "no-store" } });
});
