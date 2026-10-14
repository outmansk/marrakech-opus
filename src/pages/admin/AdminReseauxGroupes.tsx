import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/admin/styles";
import { Chips, ConfirmDialog, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { StatCard, SectionTitle } from "@/components/admin/charts";
import { useDeleteGroupe, useSocialData } from "@/hooks/useSocial";
import { GROUPE_STATUTS, GROUPE_TYPES, LANGUES, RESEAUX, type Groupe, type Publication } from "@/lib/social/model";
import { SCORE_LABELS, groupStats, type GroupeStats, type Score } from "@/lib/social/stats";
import PublicationsTable from "@/components/admin/social/PublicationsTable";
import { GroupeForm, PublicationForm } from "@/components/admin/social/SocialForms";
import { SOCIAL_BASE, SetupNotice, SocialNav } from "@/components/admin/social/SocialUI";
import { formatDate, nf, pct } from "@/lib/social/format";

const SCORE_TONE: Record<Score, "success" | "warning" | "closed"> = { garder: "success", surveiller: "warning", abandonner: "closed" };

function Flags({ g }: { g: Groupe }) {
  const flags = [g.approbation_obligatoire && "Approbation", g.agences_interdites && "Agences interdites", g.immobilier_interdit && "Immobilier interdit"].filter(Boolean) as string[];
  if (!flags.length) return null;
  return <span className="flex flex-wrap gap-1">{flags.map((f) => <span key={f} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{f}</span>)}</span>;
}

export default function AdminReseauxGroupes() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useSocialData();
  const [score, setScore] = useState<"tous" | Score>("tous");
  const [editing, setEditing] = useState<Groupe | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const stats = useMemo(() => (data && !data.missing ? groupStats(data.groupes, data.pubs, data.clics, data.leads) : []), [data]);

  if (isLoading) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8" aria-busy="true"><div className="h-9 w-56 rounded bg-[hsl(38_30%_91%)]" /></div>;
  if (isError || !data) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8"><ErrorState title="Impossible de charger les groupes" onRetry={() => refetch()} /></div>;

  const open = (g: Groupe | null) => { setEditing(g); setFormOpen(true); };
  const detail = id ? stats.find((s) => s.groupe.id === id) : undefined;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 lg:px-10 lg:py-8">
      {detail ? <GroupeDetail stats={detail} onEdit={() => open(detail.groupe)} /> : (
        <>
          <PageHeader title="Groupes" count={data.missing ? undefined : `${data.groupes.length} groupe${data.groupes.length > 1 ? "s" : ""}`}>
            <button type="button" onClick={() => open(null)} disabled={data.missing} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter un groupe</button>
          </PageHeader>
          <SocialNav />
          {data.missing ? <SetupNotice /> : (
            <>
              <Chips<"tous" | Score> label="Score" value={score} onChange={setScore} options={[
                { value: "tous", label: "Tous", count: stats.length },
                ...(Object.keys(SCORE_LABELS) as Score[]).map((s) => ({ value: s, label: SCORE_LABELS[s], count: stats.filter((x) => x.score === s).length })),
              ]} />
              <p className="m-0 text-xs text-muted-foreground">Score : « à garder » dès 1 client avec au moins 50 % d’approbation ; « à abandonner » après 3 publications sans client ou sous 30 % d’approbation.</p>
              <GroupesTable rows={stats.filter((s) => score === "tous" || s.score === score).sort((a, b) => b.clients - a.clients || b.publications - a.publications)} onEdit={open} />
            </>
          )}
        </>
      )}
      {!data.missing && <GroupeForm open={formOpen} onClose={() => setFormOpen(false)} groupe={editing} />}
    </div>
  );
}

function GroupesTable({ rows, onEdit }: { rows: GroupeStats[]; onEdit: (g: Groupe) => void }) {
  if (!rows.length) return <EmptyState title="Aucun groupe" text="Ajoutez les groupes et pages où vous publiez : membres, langue et règles." />;
  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 lg:hidden">
        {rows.map((s) => (
          <li key={s.groupe.id}>
            <Link to={`${SOCIAL_BASE}/groupes/${s.groupe.id}`} className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-card p-3.5">
              <span className="flex items-start justify-between gap-2"><span className="text-[15px] font-semibold">{s.groupe.nom}</span><StatusBadge tone={SCORE_TONE[s.score]}>{SCORE_LABELS[s.score]}</StatusBadge></span>
              <span className="text-xs text-muted-foreground">{RESEAUX[s.groupe.reseau].label} · {GROUPE_TYPES[s.groupe.type]} · {LANGUES[s.groupe.langue]}{s.groupe.membres ? ` · ${nf(s.groupe.membres)} membres` : ""}</span>
              <span className="text-[13px]">{s.publications} publication(s) · approbation {pct(s.approbation)} · {s.clics} clic(s) · <strong>{s.clients} client(s)</strong></span>
              <Flags g={s.groupe} />
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-[10px] border border-border bg-card lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-[13px] text-muted-foreground">
            <tr>{["Groupe", "Membres", "Type", "Langue", "Publications", "Approbation", "Clics", "Clients", "Pour 1 000", "Dernière publication", "Score", ""].map((h, i) => <th key={i} scope="col" className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.groupe.id} className="border-t border-border">
                <td className="max-w-[260px] px-3 py-2"><Link to={`${SOCIAL_BASE}/groupes/${s.groupe.id}`} className="font-semibold hover:underline">{s.groupe.nom}</Link><div className="mt-1"><Flags g={s.groupe} /></div></td>
                <td className="px-3 py-2">{s.groupe.membres ? nf(s.groupe.membres) : "—"}</td>
                <td className="px-3 py-2">{GROUPE_TYPES[s.groupe.type]}</td>
                <td className="px-3 py-2">{LANGUES[s.groupe.langue]}</td>
                <td className="px-3 py-2">{s.publications}</td>
                <td className="px-3 py-2">{pct(s.approbation)}</td>
                <td className="px-3 py-2">{s.clics}</td>
                <td className="px-3 py-2 font-semibold">{s.clients}</td>
                <td className="px-3 py-2">{s.pour1000 ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{s.dernierePublication ? formatDate(s.dernierePublication) : "—"}</td>
                <td className="px-3 py-2"><StatusBadge tone={SCORE_TONE[s.score]}>{SCORE_LABELS[s.score]}</StatusBadge>{s.groupe.statut !== "actif" && <div className="mt-1 text-xs text-muted-foreground">{GROUPE_STATUTS[s.groupe.statut]}</div>}</td>
                <td className="px-3 py-2"><button type="button" onClick={() => onEdit(s.groupe)} aria-label={`Modifier ${s.groupe.nom}`} className={btn.icon}><Pencil size={17} aria-hidden="true" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function GroupeDetail({ stats, onEdit }: { stats: GroupeStats; onEdit: () => void }) {
  const { data } = useSocialData();
  const navigate = useNavigate();
  const remove = useDeleteGroupe();
  const [confirm, setConfirm] = useState(false);
  const [pubForm, setPubForm] = useState<{ open: boolean; pub: Publication | null }>({ open: false, pub: null });
  const g = stats.groupe;
  if (!data) return null;
  const pubs = data.pubs.filter((p) => p.groupe_id === g.id);
  const ids = new Set(pubs.map((p) => p.id));
  const clients = data.leads.filter((l) => (l.origine_publication_id && ids.has(l.origine_publication_id)) || (!l.origine_publication_id && l.origine_groupe_id === g.id));
  const biens = new Map(data.biens.map((b) => [b.id, b]));

  return (
    <>
      <Link to={`${SOCIAL_BASE}/groupes`} className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-primary"><ArrowLeft size={17} aria-hidden="true" />Tous les groupes</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight lg:text-[34px]">{g.nom}</h1>
          <span className="text-sm text-muted-foreground">{RESEAUX[g.reseau].label} · {GROUPE_TYPES[g.type]} · {LANGUES[g.langue]}{g.membres ? ` · ${nf(g.membres)} membres` : ""} · {GROUPE_STATUTS[g.statut]}{g.statut_raison ? ` (${g.statut_raison})` : ""}</span>
          <Flags g={g} />
        </div>
        <div className="flex gap-2">
          {g.lien && <a href={g.lien} target="_blank" rel="noopener noreferrer" className={btn.outline}><ExternalLink size={17} aria-hidden="true" />Ouvrir</a>}
          <button type="button" onClick={onEdit} className={btn.outline}><Pencil size={17} aria-hidden="true" />Modifier</button>
          <button type="button" onClick={() => setConfirm(true)} aria-label="Supprimer le groupe" className={btn.iconDanger}><Trash2 size={17} aria-hidden="true" /></button>
        </div>
      </div>
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-5 lg:gap-3.5">
        <StatCard label="Publications" value={stats.publications} />
        <StatCard label="Approbation" value={pct(stats.approbation)} />
        <StatCard label="Clics vers le site" value={stats.clics} />
        <StatCard label="Clients obtenus" value={stats.clients} sub={stats.pour1000 !== null ? `${stats.pour1000} pour 1 000 membres` : undefined} />
        <div className={cn("flex flex-col justify-center gap-2 rounded-[10px] border border-border bg-card p-3.5 lg:p-4")}>
          <span className="text-[13px] font-medium text-muted-foreground">Score</span>
          <StatusBadge tone={SCORE_TONE[stats.score]}>{SCORE_LABELS[stats.score]}</StatusBadge>
        </div>
      </section>
      {g.regles && (
        <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
          <SectionTitle>Règles du groupe</SectionTitle>
          <p className="m-0 whitespace-pre-line text-sm leading-relaxed">{g.regles}</p>
        </section>
      )}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Historique des publications</SectionTitle>
          <button type="button" onClick={() => setPubForm({ open: true, pub: null })} className={btn.soft}><Plus size={17} aria-hidden="true" />Publication</button>
        </div>
        <PublicationsTable pubs={pubs} biens={biens} groupes={new Map(data.groupes.map((x) => [x.id, x]))} clics={data.clics} leads={data.leads} hideGroupe onEdit={(pub) => setPubForm({ open: true, pub })} emptyText="Aucune publication dans ce groupe pour l’instant." />
      </section>
      <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
        <SectionTitle>Clients obtenus</SectionTitle>
        {clients.length === 0 ? <p className="m-0 text-sm text-muted-foreground">Aucun client rattaché à ce groupe pour l’instant.</p> : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {clients.map((c) => <li key={c.id}><Link to={`/manage-xk92p/clients?edit=${c.id}`} className="text-sm font-semibold text-primary hover:underline">{c.name}</Link><span className="text-[13px] text-muted-foreground"> · {formatDate(c.created_at)}{c.bien_id && biens.get(c.bien_id) ? ` · ${biens.get(c.bien_id)!.titre}` : ""}</span></li>)}
          </ul>
        )}
      </section>
      <PublicationForm open={pubForm.open} onClose={() => setPubForm({ open: false, pub: null })} publication={pubForm.pub} biens={data.biens} groupes={data.groupes} pubs={data.pubs} />
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={`Supprimer « ${g.nom} » ?`} description="Ses publications restent dans le journal, sans groupe. Pour ne plus l’utiliser, vous pouvez plutôt passer son statut à « À éviter »."
        onConfirm={() => { remove.mutate(g.id); setConfirm(false); navigate(`${SOCIAL_BASE}/groupes`); }} />
    </>
  );
}
