import { Link } from "react-router-dom";
import { CalendarPlus, Check } from "lucide-react";
import { useTaches } from "@/hooks/useAgenda";
import { TACHE_TYPE, echeanceLabel, isLate } from "@/lib/agenda";
import { btn } from "@/components/admin/styles";
import { cn } from "@/lib/utils";

const BASE = "/manage-xk92p";

/** Relances et tâches de l'agenda liées à un client, avec un raccourci pour en planifier une. */
export default function LeadTasks({ leadId }: { leadId: string }) {
  const { data: taches = [], isError } = useTaches();
  const list = taches
    .filter((t) => t.lead_id === leadId)
    .sort((a, b) => Number(a.fait) - Number(b.fait) || (a.echeance ?? "9").localeCompare(b.echeance ?? "9"));

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 font-serif text-[22px] font-semibold">Relances & notes</h3>
        <span className="text-[13px] font-semibold text-muted-foreground">{list.filter((t) => !t.fait).length} à faire</span>
      </div>
      <Link to={`${BASE}/agenda?new=1&type=relance&lead=${leadId}`} className={cn(btn.primary, "w-full")}>
        <CalendarPlus size={18} aria-hidden="true" />Planifier une relance
      </Link>
      {isError ? null : list.length === 0 ? (
        <p className="m-0 text-sm text-muted-foreground">Aucune relance ni note pour ce client. Planifiez-en une avec la date et ce qu’il faut lui dire.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[10px] border border-border p-0">
          {list.map((t) => {
            const meta = TACHE_TYPE[t.type] ?? TACHE_TYPE.note;
            const late = isLate(t);
            return (
              <li key={t.id} className="border-b border-border bg-card last:border-0">
                <Link to={`${BASE}/agenda?edit=${t.id}`} className="flex gap-3 px-3 py-2.5 hover:bg-muted">
                  <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", t.fait ? "border-primary bg-primary text-white" : "border-input")}>
                    {t.fait && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {meta.label}{t.echeance && <> · <span className={late ? "text-destructive" : undefined}>{late ? "En retard · " : ""}{echeanceLabel(t.echeance)}</span></>}
                    </span>
                    <span className={cn("text-sm font-semibold leading-snug", t.fait && "text-muted-foreground line-through")}>{t.titre}</span>
                    {t.notes && <span className="line-clamp-2 whitespace-pre-line text-[13px] text-muted-foreground">{t.notes}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
