import { previewAdapter } from "./preview-adapter";
import { supabaseAdapter } from "./supabase-adapter";
import type { ApiAdapter } from "./types";

/**
 * Data source is chosen at build time, never at runtime.
 * - VITE_DATA_SOURCE=preview → illustrative preview records only.
 * - otherwise, once the Cloud database is configured → real data only.
 * A real-data failure surfaces as an error state; it never falls back to preview data.
 */
const explicit = import.meta.env["VITE_DATA_SOURCE"] as string | undefined;
const cloudConfigured = Boolean(import.meta.env["VITE_SUPABASE_URL"]);
const usePreview = explicit === "preview" || (explicit !== "supabase" && !cloudConfigured);

export const api: ApiAdapter = usePreview ? previewAdapter : supabaseAdapter;
export const isPreviewData = api.kind === "preview";
