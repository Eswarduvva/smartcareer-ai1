import type { QueryClient } from "@tanstack/react-query";

/** Cancel in-flight reads before removing private history on any session loss. */
export function clearPrivateCoachCache(queryClient: QueryClient) {
  void queryClient.cancelQueries({ queryKey: ["career-coach"] });
  queryClient.removeQueries({ queryKey: ["career-coach"] });
}