/**
 * Display-only formatting for coach answers. Saved history keeps the raw text
 * (including [knowledge:…] references) for traceability; only the rendered view changes.
 */
export const DATASET_SOURCE_LABEL = "Source: SmartCarrier Career Dataset";

const REF = /\s*\[knowledge:([a-z0-9-]{1,80})\]/g;
const PATTERN = /\s*[—–-]?\s*\(?\*{0,2}Dataset career pattern: [^|\n)*]*\*{0,2}\)?/g;

const cells = (line: string) =>
  line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const isDivider = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

/** Markdown tables read poorly on narrow screens: render them as bulleted lists. */
function tablesToLists(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i] ?? "";
    if (head.includes("|") && isDivider(lines[i + 1] ?? "")) {
      const headers = cells(head);
      const keep = headers
        .map((h, idx) => ({ h, idx }))
        .filter(({ h }) => !/^(source|sources|rank|#)$/i.test(h));
      i += 2;
      while (i < lines.length && (lines[i] ?? "").includes("|")) {
        const row = cells(lines[i] ?? "");
        const [first, ...rest] = keep.map(({ h, idx }) => ({ h, v: row[idx] ?? "" }));
        if (first?.v) {
          const extra = rest.filter((c) => c.v).map((c) => `${c.v} ${c.h.toLowerCase()}`);
          out.push(`- **${first.v.replace(/\*/g, "")}**${extra.length ? " — " + extra.join(", ") : ""}`);
        }
        i++;
      }
      i--;
      continue;
    }
    out.push(head);
  }
  return out.join("\n");
}

export function formatCoachAnswer(text: string): { text: string; references: string[] } {
  const references: string[] = [];
  const stripped = text
    .replace(REF, (_m, ref: string) => {
      if (!references.includes(ref)) references.push(ref);
      return "";
    })
    .replace(PATTERN, "")
    .replace(/[ \t]+$/gm, "");
  return { text: tablesToLists(stripped), references };
}
