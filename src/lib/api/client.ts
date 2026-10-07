import { createHttpAdapter } from "./http-adapter";
import { previewAdapter } from "./preview-adapter";
import type { ApiAdapter } from "./types";

const baseUrl = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

/** Real API when VITE_API_BASE_URL is set; otherwise the clearly-labelled preview adapter. */
export const api: ApiAdapter = baseUrl ? createHttpAdapter(baseUrl) : previewAdapter;
export const isPreviewData = api.kind === "preview";
