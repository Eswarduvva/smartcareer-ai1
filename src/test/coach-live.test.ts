import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Explicit opt-in: creates two isolated test accounts, never uses student dataset rows.
const enabled = process.env["COACH_LIVE_TESTS"] === "1";
describe.skipIf(!enabled)("live coach database security", () => {
  let admin: SupabaseClient<Database>;
  let a: SupabaseClient<Database>;
  let b: SupabaseClient<Database>;
  let anon: SupabaseClient<Database>;
  const users: string[] = [];
  const fetchWithKey = (key: string): typeof fetch => (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
  beforeAll(async () => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    const pub = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key || !pub) throw new Error("Live test configuration unavailable");
    const client = (k: string) => createClient<Database>(url, k, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: fetchWithKey(k) } });
    admin = client(key); anon = client(pub);
    for (let i = 0; i < 2; i++) {
      const email = `coach-security-${crypto.randomUUID()}@example.com`;
      const password = crypto.randomUUID() + "Aa1!";
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (created.error || !created.data.user) throw new Error("Unable to create isolated test account");
      users.push(created.data.user.id);
      const c = client(pub);
      const login = await c.auth.signInWithPassword({ email, password });
      if (login.error) throw new Error("Unable to authenticate isolated test account");
      if (i === 0) a = c; else b = c;
    }
  }, 30000);
  afterAll(async () => {
    for (const user of users) {
      await admin.from("coach_conversations").delete().eq("user_id", user);
      await admin.from("coach_request_limits").delete().eq("user_id", user);
      const deleted = await admin.auth.admin.deleteUser(user);
      if (deleted.error) throw new Error("Test account cleanup failed");
    }
  }, 30000);
  it("blocks anonymous history and begin/finish/clear", async () => {
    expect((await anon.from("coach_conversations").select("user_id")).error).not.toBeNull();
    expect((await anon.rpc("coach_begin", { p_user: users[0], p_request: crypto.randomUUID(), p_text: "test" })).error).not.toBeNull();
    expect((await anon.rpc("coach_finish", { p_user: users[0], p_request: crypto.randomUUID(), p_text: "forged" })).error).not.toBeNull();
    expect((await anon.rpc("coach_clear")).error).not.toBeNull();
  });
  it("denies student forged completion even with the valid active ID", async () => {
    const id = crypto.randomUUID();
    expect((await admin.rpc("coach_begin", { p_user: users[0], p_request: id, p_text: "test question" })).error).toBeNull();
    expect((await a.rpc("coach_finish", { p_user: users[0], p_request: id, p_text: "forged assistant" })).error).not.toBeNull();
    expect((await a.rpc("coach_finish", { p_request: id, p_text: "legacy forgery" })).error).not.toBeNull();
    const row = await admin.from("coach_conversations").select("messages,active_request").eq("user_id", users[0]).single();
    expect(row.data?.active_request).toBe(id);
    expect(JSON.stringify(row.data?.messages)).not.toContain("forgery");
    expect((await admin.rpc("coach_finish", { p_user: users[0], p_request: id, p_text: "" })).error).toBeNull();
  });
  it("serializes concurrent starts and rejects wrong-account and duplicate finishes", async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const results = await Promise.all(ids.map((id) => admin.rpc("coach_begin", { p_user: users[0], p_request: id, p_text: "concurrent test" })));
    expect(results.filter((r) => !r.error)).toHaveLength(1);
    const winner = ids[results.findIndex((r) => !r.error)];
    expect((await admin.rpc("coach_finish", { p_user: users[1], p_request: winner, p_text: "wrong account" })).error).not.toBeNull();
    expect((await admin.rpc("coach_finish", { p_user: users[0], p_request: crypto.randomUUID(), p_text: "wrong ID" })).error).not.toBeNull();
    expect((await a.rpc("coach_clear")).error).not.toBeNull();
    expect((await admin.rpc("coach_finish", { p_user: users[0], p_request: winner, p_text: "test server answer" })).error).toBeNull();
    expect((await admin.rpc("coach_finish", { p_user: users[0], p_request: winner, p_text: "duplicate" })).error).not.toBeNull();
  });
  it("isolates history between two student-only accounts and preserves own clearing", async () => {
    for (const c of [a,b]) {
      const roles = await c.from("user_roles").select("role");
      expect(roles.data?.map((r) => r.role)).toEqual(["student"]);
    }
    expect((await a.from("coach_conversations").select("user_id")).data).toEqual([{ user_id: users[0] }]);
    expect((await b.from("coach_conversations").select("messages").eq("user_id",users[0])).data).toEqual([]);
    expect((await a.from("coach_request_limits").select("user_id")).error).not.toBeNull();
    expect((await a.rpc("coach_clear")).error).toBeNull();
    expect((await a.from("coach_conversations").select("messages").single()).data?.messages).toEqual([]);
  });
  it("rejects SQL null inputs and enforces the 20-request hourly limit", async () => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Test configuration unavailable");
    const response = await fetchWithKey(key)(`${url}/rest/v1/rpc/coach_begin`, { method: "POST", headers: { "Content-Type": "application/json", ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }) }, body: JSON.stringify({ p_user: users[1], p_request: null, p_text: null }) });
    expect(response.ok).toBe(false);
    for (let i=0;i<20;i++) {
      const id = crypto.randomUUID();
      expect((await admin.rpc("coach_begin", { p_user: users[1], p_request: id, p_text: "quota test" })).error).toBeNull();
      expect((await admin.rpc("coach_finish", { p_user: users[1], p_request: id, p_text: "" })).error).toBeNull();
    }
    expect((await admin.rpc("coach_begin", { p_user: users[1], p_request: crypto.randomUUID(), p_text: "over quota" })).error).not.toBeNull();
    expect((await admin.from("coach_request_limits").select("requests").eq("user_id",users[1]).single()).data?.requests).toBe(20);
  },30000);
});