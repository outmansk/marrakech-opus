import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Plus, Search } from "lucide-react";
import { btn, field } from "@/components/admin/styles";
import { ErrorState, PageHeader, SelectField } from "@/components/admin/ui";
import { usePublicationCounts, useSocialData } from "@/hooks/useSocial";
import { LANGUES, PUBLIE_PAR, PUB_STATUTS, RESEAUX, pubRef, type Publication } from "@/lib/social/model";
import { toCsv } from "@/lib/social/stats";
import PublicationsTable from "@/components/admin/social/PublicationsTable";
import { PublicationForm } from "@/components/admin/social/SocialForms";
import { SetupNotice, SocialNav } from "@/components/admin/social/SocialUI";
import { formatDateTime, pubTrackedUrl } from "@/lib/social/format";

export default function AdminReseauxJournal() {
  const { data, isLoading, isError, refetch } = useSocialData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Publication | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const statut = params.get("statut") ?? "";
  const reseau = params.get("reseau") ?? "";
  const groupe = params.get("groupe") ?? "";
  const bien = params.get("bien") ?? "";
  const setFilter = (key: string, value: string) => setParams((p) => { const next = new URLSearchParams(p); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });

  const maps = useMemo(() => ({
    biens: new Map((data?.biens ?? []).map((b) => [b.id, b])),
    groupes: new Map((data?.groupes ?? []).map((g) => [g.id, g])),
  }), [data]);
  const counts = usePublicationCounts(data?.clics ?? [], data?.leads ?? []);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.pubs.filter((p) => (!statut || p.statut === statut) && (!reseau || p.reseau === reseau) && (!groupe || p.groupe_id === groupe)
      && (!bien || p.bien_id === bien || (bien === "hors" && !p.bien_id))
      && (!q || [p.bien_id ? maps.biens.get(p.bien_id)?.titre : p.bien_hors_site, p.groupe_id ? maps.groupes.get(p.groupe_id)?.nom : "", p.texte_debut, p.remarque, pubRef(p)].join(" ").toLowerCase().includes(q)));
  }, [data, search, statut, reseau, groupe, bien, maps]);

  if (isLoading) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8" aria-busy="true"><div className="h-9 w-56 rounded bg-[hsl(38_30%_91%)]" /></div>;
  if (isError || !data) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8"><ErrorState title="Impossible de charger le journal" onRetry={() => refetch()} /></div>;

  const exportCsv = () => {
    const csv = toCsv([
      ["Référence", "Date (Casablanca)", "Bien", "Groupe", "Lien du groupe", "Membres", "Réseau", "Langue", "Statut", "Début du texte", "Photos", "Lien de la publication", "Lien suivi", "Publié par", "Clics site", "Clients", "Remarque"],
      ...rows.map((p) => {
        const g = p.groupe_id ? maps.groupes.get(p.groupe_id) : undefined;
        return [pubRef(p), formatDateTime(p.publie_le), p.bien_id ? maps.biens.get(p.bien_id)?.titre ?? "" : `${p.bien_hors_site} (hors site)`, g?.nom ?? "", g?.lien ?? "", g?.membres ?? "",
          RESEAUX[p.reseau].label, LANGUES[p.langue], PUB_STATUTS[p.statut], p.texte_debut, p.nb_photos, p.lien, pubTrackedUrl(p, maps.biens, maps.groupes), PUBLIE_PAR[p.publie_par],
          counts.clicks.get(p.id) ?? 0, counts.clients.get(p.id) ?? 0, p.remarque];
      }),
    ]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `publications-reseaux-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 lg:px-10 lg:py-8">
      <PageHeader title="Journal des publications" count={data.missing ? undefined : `${rows.length} publication${rows.length > 1 ? "s" : ""}`}>
        <button type="button" onClick={exportCsv} disabled={data.missing || !rows.length} className={btn.outline}><Download size={18} aria-hidden="true" />Exporter (CSV / Excel)</button>
        <button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} disabled={data.missing} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter</button>
      </PageHeader>
      <h1 className="m-0 font-serif text-[30px] font-semibold leading-tight lg:hidden">Journal</h1>
      <SocialNav />
      {data.missing ? <SetupNotice /> : (
        <>
          <section aria-label="Filtres" className="grid gap-2.5 rounded-[10px] border border-border bg-card p-3.5 sm:grid-cols-2 lg:grid-cols-5 lg:p-4">
            <label className="relative flex lg:col-span-1">
              <span className="sr-only">Rechercher</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-[14px] text-muted-foreground" aria-hidden="true" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Bien, groupe, texte, FB-12…" className={`${field.input} pl-9`} />
            </label>
            <SelectField label="Statut" value={statut} onChange={(v) => setFilter("statut", v)}><option value="">Tous les statuts</option>{Object.entries(PUB_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</SelectField>
            <SelectField label="Réseau" value={reseau} onChange={(v) => setFilter("reseau", v)}><option value="">Tous les réseaux</option>{Object.entries(RESEAUX).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</SelectField>
            <SelectField label="Groupe" value={groupe} onChange={(v) => setFilter("groupe", v)}><option value="">Tous les groupes</option>{data.groupes.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}</SelectField>
            <SelectField label="Bien" value={bien} onChange={(v) => setFilter("bien", v)}><option value="">Tous les biens</option>{data.biens.map((b) => <option key={b.id} value={b.id}>{b.titre}</option>)}<option value="hors">Biens hors site</option></SelectField>
          </section>
          <PublicationsTable pubs={rows} biens={maps.biens} groupes={maps.groupes} clics={data.clics} leads={data.leads} onEdit={(p) => { setEditing(p); setFormOpen(true); }}
            emptyText={data.pubs.length ? "Aucune publication ne correspond à ces filtres." : "Ajoutez votre première publication avec le bouton « Ajouter »."} />
          <p className="m-0 text-xs text-muted-foreground">L’export s’ouvre directement dans Excel (séparateur « ; », accents conservés).</p>
        </>
      )}
      {!data.missing && <PublicationForm open={formOpen} onClose={() => setFormOpen(false)} publication={editing} defaultBienId={bien && bien !== "hors" ? bien : null} biens={data.biens} groupes={data.groupes} pubs={data.pubs} />}
    </div>
  );
}
