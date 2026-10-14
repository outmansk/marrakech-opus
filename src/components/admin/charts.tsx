import { Link } from "react-router-dom";
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

/* Briques visuelles partagées par le tableau de bord et la section Réseaux sociaux. */

export const OLIVE = "hsl(70 19% 34%)";
export const BROWN = "hsl(25 20% 45%)";
const FONT = "Montserrat, sans-serif";
const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid hsl(35 30% 86%)", fontFamily: FONT, fontSize: 13 };

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className="m-0 font-serif text-[22px] font-semibold leading-tight">{children}</h2>;
}

/** Barres horizontales (une série). `unit` sert à l'infobulle : « 3 biens ». */
export function HBarChart({ data, color, label, unit = ["bien", "biens"], empty = "Aucun bien pour l’instant." }: {
  data: { name: string; value: number }[]; color: string; label: string; unit?: [string, string]; empty?: string;
}) {
  if (!data.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <figure className="m-0" aria-label={label}>
      <ResponsiveContainer width="100%" height={data.length * 34 + 8}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={132} tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: "hsl(40 10% 12%)", fontFamily: FONT }} />
          <Tooltip cursor={{ fill: "hsl(39 47% 94%)" }} formatter={(value: number) => [`${value} ${value > 1 ? unit[1] : unit[0]}`, ""]} separator="" contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" style={{ fontSize: 13, fontWeight: 600, fill: "hsl(40 10% 12%)", fontFamily: FONT }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{data.map((row) => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Barres horizontales à deux séries (publications en olive, clients en brun). */
export function HBarPair({ data, label, keys = ["publications", "clients"], names = ["Publications", "Clients"], empty = "Pas encore de données.", nameWidth = 132 }: {
  data: Record<string, string | number>[]; label: string; keys?: [string, string]; names?: [string, string]; empty?: string; nameWidth?: number;
}) {
  if (!data.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <figure className="m-0" aria-label={label}>
      <ResponsiveContainer width="100%" height={data.length * 44 + 36}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={8} barGap={2}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={nameWidth} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(40 10% 12%)", fontFamily: FONT }} />
          <Tooltip cursor={{ fill: "hsl(39 47% 94%)" }} contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} iconSize={10} />
          <Bar dataKey={keys[0]} name={names[0]} fill={OLIVE} radius={[0, 4, 4, 0]} barSize={10} isAnimationActive={false}>
            <LabelList dataKey={keys[0]} position="right" style={{ fontSize: 12, fontWeight: 600, fill: "hsl(40 10% 12%)", fontFamily: FONT }} />
          </Bar>
          <Bar dataKey={keys[1]} name={names[1]} fill={BROWN} radius={[0, 4, 4, 0]} barSize={10} isAnimationActive={false}>
            <LabelList dataKey={keys[1]} position="right" style={{ fontSize: 12, fontWeight: 600, fill: "hsl(40 10% 12%)", fontFamily: FONT }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Nom</th><th>{names[0]}</th><th>{names[1]}</th></tr></thead>
        <tbody>{data.map((row) => <tr key={String(row.name)}><th scope="row">{row.name}</th><td>{row[keys[0]]}</td><td>{row[keys[1]]}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Carte de chiffre du tableau de bord, avec variation facultative par rapport à la période précédente. */
export function StatCard({ label, value, sub, to, alert, delta }: { label: string; value: number | string; sub?: string; to?: string; alert?: boolean; delta?: number | null }) {
  const body = (
    <>
      <span className="text-[13px] font-medium leading-snug text-muted-foreground">{label}</span>
      <span className={cn("font-serif text-[32px] font-semibold leading-none lg:text-[36px]", alert && Number(value) > 0 ? "text-accent" : "text-foreground")}>{value}</span>
      <span className="flex flex-wrap items-center gap-1.5 text-xs leading-snug text-muted-foreground">
        {delta !== undefined && delta !== null && (
          <span className={cn("rounded px-1.5 py-0.5 font-semibold", delta > 0 ? "bg-success text-success-foreground" : delta < 0 ? "bg-closed text-closed-foreground" : "bg-muted")}>
            {delta > 0 ? "+" : ""}{delta} %
          </span>
        )}
        {sub}
      </span>
    </>
  );
  const className = "flex flex-col gap-2 rounded-[10px] border border-border bg-card p-3.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] lg:p-4";
  return to ? <Link to={to} className={cn(className, "hover:border-input")}>{body}</Link> : <div className={className}>{body}</div>;
}
