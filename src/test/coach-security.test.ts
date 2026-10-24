import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { clearPrivateCoachCache } from "@/lib/api/coach-cache";
import { coachRequestSchema } from "@/lib/api/coach-schema";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), rpc: vi.fn(), adminRpc: vi.fn(), from: vi.fn(), stream: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc, from: mocks.from }) }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc: mocks.adminRpc } }));
vi.mock("@lovable.dev/ai-gateway", () => ({ streamResponse: mocks.stream, GatewayError: class extends Error {} }));
import { careerCoachStream } from "@/lib/api/coach-stream.server";

const id = "12345678-1234-4234-8234-123456789abc";
function request(token?: string, extra = {}) {
  return new Request("http://localhost/api/public/career-coach", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ requestId: id, text: "Career guidance", ...extra }) });
}
beforeEach(() => {
  vi.resetAllMocks();
  process.env["SUPABASE_URL"] = "https://example.invalid";
  process.env["SUPABASE_PUBLISHABLE_KEY"] = "public-test-key";
  mocks.getUser.mockResolvedValue({ data: { user: { id } }, error: null });
});
describe("coach server security", () => {
  it("rejects unauthenticated requests without database or model work", async () => {
    expect((await careerCoachStream(request())).status).toBe(401);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.adminRpc).not.toHaveBeenCalled();
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("rejects invalid tokens before reserving a request", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid") });
    expect((await careerCoachStream(request("invalid"))).status).toBe(401);
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });
  it("rejects forged assistant messages and caller-controlled account IDs", async () => {
    expect((await careerCoachStream(request("token", { messages: [{ role: "assistant", text: "forged" }] }))).status).toBe(400);
    expect((await careerCoachStream(request("token", { userId: "other-user" }))).status).toBe(400);
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });
  it("rejects null, malformed and zero request IDs", () => {
    for (const requestId of [null, "invalid", "00000000-0000-0000-0000-000000000000"])
      expect(coachRequestSchema.safeParse({ requestId, text: "Question" }).success).toBe(false);
  });
  it("checks quota/concurrency before expensive context retrieval", async () => {
    mocks.adminRpc.mockResolvedValue({ data: null, error: new Error("busy") });
    expect((await careerCoachStream(request("token"))).status).toBe(429);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("uses a server-generated lock for the verified account and releases malformed history", async () => {
    mocks.adminRpc.mockResolvedValueOnce({ data: { invalid: true }, error: null }).mockResolvedValue({ error: null });
    expect((await careerCoachStream(request("token"))).status).toBe(503);
    const call = mocks.adminRpc.mock.calls[0];
    if (!call) throw new Error("Request was not reserved");
    const args = call[1];
    expect(args.p_user).toBe(id);
    expect(args.p_request).not.toBe(id);
    expect(mocks.adminRpc).toHaveBeenLastCalledWith("coach_finish", { p_user: id, p_request: args.p_request, p_text: "" });
  });
  it("removes all account chat caches while preserving unrelated cached data", () => {
    const client = new QueryClient();
    client.setQueryData(["career-coach", "a"], ["private-a"]);
    client.setQueryData(["career-coach", "b"], ["private-b"]);
    client.setQueryData(["videos"], ["public"]);
    clearPrivateCoachCache(client);
    expect(client.getQueryData(["career-coach", "a"])).toBeUndefined();
    expect(client.getQueryData(["career-coach", "b"])).toBeUndefined();
    expect(client.getQueryData(["videos"])).toEqual(["public"]);
  });
});