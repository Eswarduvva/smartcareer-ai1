import { useEffect, useState } from "react";

export const PALETTES = [
  { id: "sapphire", name: "Ocean Blue", swatch: ["#0d1b3d", "#2f5bd8", "#d9b56b"] },
  { id: "amethyst", name: "Royal Purple", swatch: ["#1e1033", "#8b4fd6", "#d9b56b"] },
  { id: "emerald", name: "Emerald Growth", swatch: ["#0a2622", "#14957a", "#dcbf72"] },
  { id: "champagne", name: "Warm Light", swatch: ["#f6efe2", "#b58a3c", "#2a2a3a"] },
  { id: "obsidian", name: "Midnight Dark", swatch: ["#0b0b10", "#7d7fa8", "#e2c27e"] },
] as const;
export type PaletteId = (typeof PALETTES)[number]["id"];

const PK = "sc-palette";
const MK = "sc-theme";

/** Inline script run before paint so the saved theme never flashes. */
export const THEME_BOOT = `(function(){try{var d=document.documentElement;d.dataset["palette"]=localStorage.getItem("${PK}")||"sapphire";var m=localStorage.getItem("${MK}");if(m?m==="dark":true)d.classList.add("dark")}catch(e){}})()`;

function apply(palette: PaletteId, dark: boolean) {
  const d = document.documentElement;
  d.classList.add("theme-anim");
  d.dataset["palette"] = palette;
  d.classList.toggle("dark", dark);
  localStorage.setItem(PK, palette);
  localStorage.setItem(MK, dark ? "dark" : "light");
  window.setTimeout(() => d.classList.remove("theme-anim"), 600);
  window.dispatchEvent(new Event("sc-theme"));
}

export function useTheme() {
  const [state, setState] = useState<{ palette: PaletteId; dark: boolean }>({ palette: "sapphire", dark: true });
  useEffect(() => {
    const read = () => {
      const d = document.documentElement;
      setState({ palette: (d.dataset["palette"] as PaletteId) || "sapphire", dark: d.classList.contains("dark") });
    };
    read();
    window.addEventListener("sc-theme", read);
    return () => window.removeEventListener("sc-theme", read);
  }, []);
  return {
    ...state,
    setPalette: (p: PaletteId) => apply(p, state.dark),
    setDark: (v: boolean) => apply(state.palette, v),
  };
}

/** Adds .is-in to every .reveal element as it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
}
