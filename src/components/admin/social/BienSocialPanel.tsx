import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { btn } from "@/components/admin/styles";
import { StatCard, SectionTitle } from "@/components/admin/charts";
import { useSocialData } from "@/hooks/useSocial";
import { fromOrigin, GROUPE_TYPES, LANGUES, PUB_STATUTS, RESEAUX, type Publication } from "@/lib/social/model";
import { unusedGroupsFor } from "@/lib/social/stats";
import { formatDate, nf, pubTrackedUrl } from "@/lib/social/format";
import PublicationsTable from "./PublicationsTable";
import { PublicationForm } from "./SocialForms";
import { CopyLinkButton, SOCIAL_BASE, SetupNotice } from "./SocialUI";

/** Onglet « Réseaux sociaux » de la fiche d'un bien. */
export default function BienSocialPanel({ bienId }: { bienId: string }) {
  const { data, isLoading } = useSocialData();
  const [form, setForm] = useState<{ open: boolean; pub: Publication | null }>({ open: false, pub: null });

  const view = useMemo(() => {
    if (!data || data.missing) return null;
    const pubs = data.pubs.filter((p) => p.bien_id === bienId);
    const ids = new Set(pubs.map((p) => p.id));
    const groupes = new Map(data.groupes.map((g) => [g.id, g]));
    const touched = [...new Set(pubs.map((p) => p.groupe_id).filter(Boolean))] as string[];
    return {
      pubs,
      groupes,
      biens: new Map(data.biens.map((b) => [b.id, b])),
      touched: touched.length,
      portee: touched.reduce((sum, id) => sum + (groupes.get(id)?.membres ?? 0), 0),
      clics: data.clics.filter((c) => ids.has(c.publication_id)).length,
      clients: data.leads.filter((l) => (l.origine_publication_id && ids.has(l.origine_publication_id)) || (l.bien_id === bienId && fromOrigin(l))).length,
      visites: data.visites.filter((v) => v.property_v2_id === bienId && fromOrigin(v)).length,
      unused: unusedGroupsFor(bienId, data.groupes, data.pubs),
      timeline: [...pubs].sort((a, b) => a.publie_le.localeCompare(b.publie_le)),
    };
  }, [data, bienId]);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Chargement…</p>;
  if (!data) return null;
  if (data.missing || !view) return <div className="p-4 lg:p-6"><SetupNotice /></div>;

  const latest = view.pubs[0];
  const latestUrl = latest ? pubTrackedUrl(latest, view.biens, view.groupes) : null;

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-5 lg:px-6">
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={() => setForm({ open: true, pub: null })} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter une publication</button>
        {latestUrl && <CopyLinkButton url={latestUrl} />}
        <Link to={`${SOCIAL_BASE}/journal?bien=${bienId}`} className={btn.outline}>Voir dans le journal</Link>
      </div>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatCard label="Publications" value={view.pubs.length} />
        <StatCard label="Groupes touchés" value={view.touched} />
        <StatCard label="Portée" value={nf(view.portee)} sub="membres cumulés" />
        <StatCard label="Clics vers le site" value={view.clics} />
        <StatCard label="Clients" value={view.clients} />
        <StatCard label="Visites" value={view.visites} />
      </section>

      {view.timeline.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
          <SectionTitle>Frise de diffusion</SectionTitle>
          <ol className="m-0 flex list-none flex-col gap-0 border-l-2 border-[hsl(38_30%_86%)] p-0 pl-4">
            {view.timeline.map((p) => (
              <li key={p.id} className="relative pb-3 last:pb-0">
                <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-card" style={{ background: p.statut === "en-ligne" ? "hsl(100 32% 36%)" : p.statut === "en-attente" ? "hsl(39 68% 45%)" : "hsl(2 17% 59%)" }} aria-hidden="true" />
                <span className="text-[13px] font-semibold">{formatDate(p.publie_le)}</span>
                <span className="text-[13px] text-muted-foreground"> · {p.groupe_id ? view.groupes.get(p.groupe_id)?.nom ?? "Groupe" : RESEAUX[p.reseau].label} · {LANGUES[p.langue]} · {PUB_STATUTS[p.statut]}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle>Publications</SectionTitle>
        <PublicationsTable pubs={view.pubs} biens={view.biens} groupes={view.groupes} clics={data.clics} leads={data.leads} hideBien
          onEdit={(pub) => setForm({ open: true, pub })} emptyText="Ce bien n’a pas encore été publié sur les réseaux." />
      </section>

      <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
        <SectionTitle>Groupes pas encore utilisés</SectionTitle>
        <p className="m-0 text-xs text-muted-foreground">Groupes actifs ou en réserve qui acceptent les agences et l’immobilier.</p>
        {view.unused.length === 0 ? <p className="m-0 text-sm text-muted-foreground">Tous les groupes compatibles ont déjà reçu ce bien.</p> : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {view.unused.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link to={`${SOCIAL_BASE}/groupes/${g.id}`} className="font-semibold text-primary hover:underline">{g.nom}</Link>
                <span className="text-[13px] text-muted-foreground">{GROUPE_TYPES[g.type]} · {LANGUES[g.langue]}{g.membres ? ` · ${nf(g.membres)} membres` : ""}{g.approbation_obligatoire ? " · approbation" : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PublicationForm open={form.open} onClose={() => setForm({ open: false, pub: null })} publication={form.pub} defaultBienId={bienId} biens={data.biens} groupes={data.groupes} pubs={data.pubs} />
    </div>
  );
}
