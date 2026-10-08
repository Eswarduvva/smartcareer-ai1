import { createContext, useContext, type ReactNode } from "react";
import type { StudentRecord } from "./api/types";

/**
 * Where the recommendation on a record came from.
 * - "database": career_recommendations row, shown as-is.
 * - "rule-based": computed by src/lib/recommend.ts for a self-entered profile.
 */
export type RecommendationSource = "database" | "rule-based";

interface RecordCtx {
  record: StudentRecord;
  source: RecommendationSource;
}

const Ctx = createContext<RecordCtx | null>(null);

export function RecordProvider({ record, source, children }: RecordCtx & { children: ReactNode }) {
  return <Ctx.Provider value={{ record, source }}>{children}</Ctx.Provider>;
}

function useCtx(): RecordCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRecord must be used inside a RecordProvider");
  return c;
}

export const useRecord = (): StudentRecord => useCtx().record;
export const useRecommendationSource = (): RecommendationSource => useCtx().source;
