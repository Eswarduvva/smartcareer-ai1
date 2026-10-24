import { ragResponseSchema, retrievalTerms, type RagResult } from "./coach-retrieval-schema";

const MAX_RESPONSE_BYTES = 40_000;
async function boundedJson(response: Response): Promise<unknown> {
  if (!response.body) throw new Error("Missing retrieval body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) throw new Error("Oversized retrieval body");
      text += decoder.decode(part.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

/** Internal helper: invoke only after bearer verification and successful coach_begin. */
export async function retrieveCoachKnowledge(question: string, parentSignal: AbortSignal): Promise<RagResult> {
  parentSignal.throwIfAborted();
  const endpoint = process.env["SMARTCARRIER_RAG_ENDPOINT"];
  const token = process.env["SMARTCARRIER_RAG_TOKEN"];
  // Explicit owner review gate: merely saving a credential must not activate dataset access.
  if (process.env["SMARTCARRIER_RAG_APPROVED"] !== "true" || !endpoint || !token)
    return { status: "not-configured", sources: [] };
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
      throw new Error("Invalid retrieval endpoint");
    const terms = retrievalTerms(question);
    if (!terms.length) return { status: "empty", sources: [] };
    const signal = AbortSignal.any([parentSignal, AbortSignal.timeout(8000)]);
    const response = await fetch(url, {
      method: "POST", redirect: "error", signal, cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ version: 1, terms, limit: 5 }),
    });
    if (!response.ok) throw new Error("Retrieval denied or unavailable");
    const parsed = ragResponseSchema.parse(await boundedJson(response));
    return { status: parsed.sources.length ? "found" : "empty", sources: parsed.sources };
  } catch {
    parentSignal.throwIfAborted();
    // Never log the endpoint, credentials, question or raw dataset response.
    return { status: "unavailable", sources: [] };
  }
}