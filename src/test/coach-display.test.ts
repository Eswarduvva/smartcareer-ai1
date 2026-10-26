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
});
