import { previewAdapter } from "./preview-adapter";
import { supabaseAdapter } from "./supabase-adapter";
import type { ApiAdapter } from "./types";

/**
 * Data source is chosen at build time, never at runtime.
 * The Cloud database is still empty, so the demo build defaults to "preview".
 * After the real dataset is imported, set DEFAULT_SOURCE to "supabase"
 * (or build with VITE_DATA_SOURCE=supabase). From then on only real data is shown,
 * and a failure shows "Unable to connect to SmartCareer data" — never preview data.
 */
const DEFAULT_SOURCE = "preview" as "preview" | "supabase";

const explicit = import.meta.env["VITE_DATA_SOURCE"] as string | undefined;
const source = explicit === "preview" || explicit === "supabase" ? explicit : DEFAULT_SOURCE;
const cloudConfigured = Boolean(import.meta.env["VITE_SUPABASE_URL"]);
const usePreview = source === "preview" || !cloudConfigured;

export const api: ApiAdapter = usePreview ? previewAdapter : supabaseAdapter;
export const isPreviewData = api.kind === "preview";
