import { Moon, Palette, Sun, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PALETTES, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeSelector({ className }: { className?: string }) {
  const t = useTheme();
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        aria-label={t.dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => t.setDark(!t.dark)}
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        {t.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <Popover>
        <PopoverTrigger
          aria-label="Choose theme"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <Palette className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="glass w-72 rounded-2xl p-3">
          <p className="eyebrow mb-3 px-1">Theme</p>
          <ul className="space-y-1.5">
            {PALETTES.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => t.setPalette(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2 text-left text-sm transition-colors",
                    t.palette === p.id ? "border-gold/60 bg-accent/40" : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <span className="flex h-8 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                    {p.swatch.map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  {t.palette === p.id && <Check className="h-4 w-4 text-gold" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex rounded-xl border border-border p-1 text-xs">
            {[false, true].map((d) => (
              <button
                key={String(d)}
                onClick={() => t.setDark(d)}
                className={cn("flex-1 rounded-lg py-1.5 transition-colors", t.dark === d ? "bg-foreground text-background" : "text-muted-foreground")}
              >
                {d ? "Dark" : "Light"}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
