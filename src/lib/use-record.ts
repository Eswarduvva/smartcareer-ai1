import { getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { studentRecordQuery } from "./api/queries";
import type { StudentRecord } from "./api/types";

const parent = getRouteApi("/students/$id");

/** Record for the current /students/$id route; parent loader guarantees it exists. */
export function useRecord(): StudentRecord {
  const { id } = parent.useParams();
  const { data } = useSuspenseQuery(studentRecordQuery(id));
  return data as StudentRecord;
}
