import { describe, it, expect } from "vitest";
import { formatCoachAnswer } from "@/lib/api/coach-display";

describe("coach answer display", () => {
  it("removes raw knowledge references from the visible text", () => {
    const r = formatCoachAnswer("- **Cybersecurity:** 183 [knowledge:career-domain-cybersecurity]");
    expect(r.text).toBe("- **Cybersecurity:** 183");
  });
  it("keeps the original references for traceability", () => {
    const r = formatCoachAnswer("A [knowledge:a-1] B [knowledge:b-2] C [knowledge:a-1]");
    expect(r.references).toEqual(["a-1", "b-2"]);
  });
  it("reports no references for general answers", () => {
    expect(formatCoachAnswer("Learn SQL first.").references).toEqual([]);
  });
  it("turns a statistics table into a list of domain names and counts", () => {
    const t = [
      "| Rank | Domain | Records recommended | Source |",
      "|---|---|---:|---|",
      "| 1 | Cybersecurity | 183 | *Dataset career pattern: Cybersecurity* [knowledge:career-domain-cybersecurity] |",
    ].join("\n");
    const r = formatCoachAnswer(t);
    expect(r.text).toBe("- **Cybersecurity** — 183 records recommended");
    expect(r.references).toEqual(["career-domain-cybersecurity"]);
  });
});
