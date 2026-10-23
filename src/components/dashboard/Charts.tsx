import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const f2 = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? "—" : v.toFixed(2));

const axis = { fill: "var(--color-muted-foreground)", fontSize: 11 };
const tip = {
  contentStyle: { background: "var(--color-popover)", color: "var(--color-popover-foreground)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 },
  cursor: { fill: "var(--color-muted)", opacity: 0.5 },
  formatter: (v: number | string) => (typeof v === "number" && !Number.isInteger(v) ? v.toFixed(2) : v),
};

export function KpiCard({ label, value, hint, tone = "primary" }: { label: string; value: string; hint?: string; tone?: "primary" | "strength" | "gap" | "neutral" }) {
  const c = { primary: "text-primary", strength: "text-strength", gap: "text-gap", neutral: "text-foreground" }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="eyebrow">{label}</p>
      <p className={`num mt-2 text-3xl font-medium ${c}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ChartCard({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-medium">{title}</h2>
      {desc && <p className="mb-4 mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

const Empty = () => <p className="py-10 text-center text-sm text-muted-foreground">No data for this selection.</p>;

export function HBarChart({ data, dataKey = "count", name = "Students", color = "var(--color-chart-1)", domain }: { data: object[]; dataKey?: string; name?: string; color?: string; domain?: [number, number] }) {
  if (!data.length) return <Empty />;
  return (
    <div style={{ height: data.length * 30 + 30 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--color-border)" />
          <XAxis type="number" tick={axis} axisLine={false} tickLine={false} allowDecimals={false} {...(domain ? { domain } : {})} />
          <YAxis type="category" dataKey="label" tick={axis} axisLine={false} tickLine={false} width={150} />
          <Tooltip {...tip} />
          <Bar dataKey={dataKey} name={name} fill={color} barSize={14} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ColumnChart({ data, bars, domain }: { data: object[]; bars: { key: string; name: string; color: string }[]; domain?: [number, number] }) {
  if (!data.length) return <Empty />;
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -12, right: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={axis} axisLine={false} tickLine={false} {...(domain ? { domain } : {})} />
          <Tooltip {...tip} />
          {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {bars.map((b) => <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[4, 4, 0, 0]} maxBarSize={44} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FilterSelect({ label, value, options, onChange }: { label: string; value?: string | undefined; options: string[]; onChange: (v?: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="min-w-44 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary">
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
