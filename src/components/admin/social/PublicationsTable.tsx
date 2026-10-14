import { useMemo, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/admin/styles";
import { ConfirmDialog, EmptyState } from "@/components/admin/ui";
import { LANGUES, PUB_STATUTS, RESEAUX, pubRef, type Groupe, type LeadOrigine, type Publication, type Clic } from "@/lib/social/model";
import { useDeletePublication, usePublicationCounts, useSetPublicationStatus, type BienRef } from "@/hooks/useSocial";
import { CopyLinkButton } from "./SocialUI";
import { formatDateTime, pubTrackedUrl } from "@/lib/social/format";

type SortKey = "date" | "statut" | "clics" | "clients";

const STATUT_STYLE: Record<Publication["statut"], string> = {
  "en-attente": "bg-warning text-warning-foreground",
  "en-ligne": "bg-success text-success-foreground",
  refusee: "bg-closed text-closed-foreground",
  supprimee: "bg-muted text-muted-foreground",
  expiree: "bg-muted text-muted-foreground",
};

/** Sélecteur de statut en un clic, coloré comme les puces de statut de l'admin. */
export function StatutSelect({ pub }: { pub: Publication }) {
  const setStatus = useSetPublicationStatus();
  return (
    <select aria-label={`Statut de la publication ${pubRef(pub)}`} value={pub.statut} disabled={setStatus.isPending}
      onChange={(e) => setStatus.mutate({ id: pub.id, statut: e.target.value as Publication["statut"] })}
      className={cn("h-9 cursor-pointer rounded-full border-0 px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/30", STATUT_STYLE[pub.statut])}>
      {Object.entries(PUB_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
}

export default function PublicationsTable({ pubs, biens, groupes, clics, leads, onEdit, hideBien, hideGroupe, emptyText = "Aucune publication pour ces filtres." }: {
  pubs: Publication[]; biens: Map<string, BienRef>; groupes: Map<string, Groupe>; clics: Clic[]; leads: LeadOrigine[];
  onEdit: (pub: Publication) => void; hideBien?: boolean; hideGroupe?: boolean; emptyText?: string;
}) {
  const [sort, setSort] = useState<SortKey>("date");
  const [toDelete, setToDelete] = useState<Publication | null>(null);
  const remove = useDeletePublication();
  const counts = usePublicationCounts(clics, leads);

  const rows = useMemo(() => {
    const order: Record<Publication["statut"], number> = { "en-attente": 0, "en-ligne": 1, refusee: 2, expiree: 3, supprimee: 4 };
    return [...pubs].sort((a, b) => {
      if (sort === "statut") return order[a.statut] - order[b.statut] || b.publie_le.localeCompare(a.publie_le);
      if (sort === "clics") return (counts.clicks.get(b.id) ?? 0) - (counts.clicks.get(a.id) ?? 0);
      if (sort === "clients") return (counts.clients.get(b.id) ?? 0) - (counts.clients.get(a.id) ?? 0);
      return b.publie_le.localeCompare(a.publie_le);
    });
  }, [pubs, sort, counts]);

  if (!pubs.length) return <EmptyState title="Rien à afficher" text={emptyText} />;

  const bienName = (p: Publication) => (p.bien_id ? biens.get(p.bien_id)?.titre ?? "Bien supprimé" : `${p.bien_hors_site} (hors site)`);
  const groupeName = (p: Publication) => (p.groupe_id ? groupes.get(p.groupe_id)?.nom ?? "Groupe supprimé" : "—");
  const head = (key: SortKey, label: string) => (
    <th scope="col" className="px-3 py-2.5 font-semibold">
      <button type="button" onClick={() => setSort(key)} className={cn("min-h-8 hover:text-foreground", sort === key && "text-foreground underline underline-offset-4")}>{label}</button>
    </th>
  );
  const actions = (p: Publication) => (
    <span className="flex gap-1.5">
      <CopyLinkButton url={pubTrackedUrl(p, biens, groupes)} compact />
      {p.lien && <a href={p.lien} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la publication" className={btn.icon}><ExternalLink size={17} aria-hidden="true" /></a>}
      <button type="button" onClick={() => onEdit(p)} aria-label="Modifier la publication" className={btn.icon}><Pencil size={17} aria-hidden="true" /></button>
      <button type="button" onClick={() => setToDelete(p)} aria-label="Supprimer la publication" className={btn.iconDanger}><Trash2 size={17} aria-hidden="true" /></button>
    </span>
  );

  return (
    <>
      {/* Mobile : cartes */}
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 lg:hidden">
        {rows.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 flex-col gap-0.5">
                {!hideBien && <span className="truncate text-[15px] font-semibold">{bienName(p)}</span>}
                {!hideGroupe && <span className="truncate text-[13px] text-muted-foreground">{groupeName(p)}</span>}
                <span className="text-xs text-muted-foreground">{formatDateTime(p.publie_le)} · {RESEAUX[p.reseau].label} · {LANGUES[p.langue]} · {pubRef(p)}</span>
              </span>
              <StatutSelect pub={p} />
            </div>
            <span className="text-xs text-muted-foreground">{counts.clicks.get(p.id) ?? 0} clic(s) · {counts.clients.get(p.id) ?? 0} client(s)</span>
            {actions(p)}
          </li>
        ))}
      </ul>

      {/* Ordinateur : tableau */}
      <div className="hidden overflow-x-auto rounded-[10px] border border-border bg-card lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-[13px] text-muted-foreground">
            <tr>
              {head("date", "Date")}
              {!hideBien && <th scope="col" className="px-3 py-2.5 font-semibold">Bien</th>}
              {!hideGroupe && <th scope="col" className="px-3 py-2.5 font-semibold">Groupe</th>}
              <th scope="col" className="px-3 py-2.5 font-semibold">Réseau</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Langue</th>
              {head("statut", "Statut")}
              {head("clics", "Clics")}
              {head("clients", "Clients")}
              <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border align-middle">
                <td className="whitespace-nowrap px-3 py-2"><span className="flex flex-col"><span>{formatDateTime(p.publie_le)}</span><span className="text-xs text-muted-foreground">{pubRef(p)}</span></span></td>
                {!hideBien && <td className="max-w-[220px] truncate px-3 py-2 font-medium">{bienName(p)}</td>}
                {!hideGroupe && <td className="max-w-[220px] truncate px-3 py-2">{groupeName(p)}</td>}
                <td className="px-3 py-2">{RESEAUX[p.reseau].label}</td>
                <td className="px-3 py-2">{LANGUES[p.langue]}</td>
                <td className="px-3 py-2"><StatutSelect pub={p} /></td>
                <td className="px-3 py-2 font-semibold">{counts.clicks.get(p.id) ?? 0}</td>
                <td className="px-3 py-2 font-semibold">{counts.clients.get(p.id) ?? 0}</td>
                <td className="px-3 py-2">{actions(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Supprimer cette publication ?"
        description="Elle disparaîtra du journal et des statistiques. Pour garder l’historique, passez plutôt son statut à « Supprimée »."
        onConfirm={() => { if (toDelete) remove.mutate(toDelete.id); setToDelete(null); }} />
    </>
  );
}
