/**
 * Display-only formatting for coach answers. Saved history keeps the raw text
 * (including [knowledge:…] references) for traceability; only the rendered view changes.
 */
export const DATASET_SOURCE_LABEL = "Source: SmartCarrier Career Dataset";

const REF = /\s*\[knowledge:([a-z0-9-]{1,80})\]/g;

export function formatCoachAnswer(text: string): { text: string; references: string[] } {
  const references: string[] = [];
  const cleaned = text
    .replace(REF, (_m, ref: string) => {
      if (!references.includes(ref)) references.push(ref);
      return "";
    })
    // Drop now-empty "Dataset career pattern: X" citation fragments left next to removed references.
    .replace(/\s*[—–-]?\s*\(?Dataset career pattern: [^|\n)]*\)?(?=\s*(\||$))/gm, "")
    .replace(/[ \t]+$/gm, "");
  return { text: cleaned, references };
}
