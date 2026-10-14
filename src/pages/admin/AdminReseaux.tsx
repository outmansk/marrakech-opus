import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BellPlus, Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { btn, field } from "@/components/admin/styles";
import { Chips, ErrorState, PageHeader, SelectField } from "@/components/admin/ui";
import { CountBadge } from "@/components/admin/StatusBadge";
import { BROWN, HBarChart, HBarPair, OLIVE, SectionTitle, StatCard } from "@/components/admin/charts";
import { useDeleteAlerte, useSocialData } from "@/hooks/useSocial";
import { ALERTE_TYPES, GROUPE_TYPES, RESEAUX, pubRef, type Publication } from "@/lib/social/model";
import {
  bestSlots, clientsByNetwork, customPeriod, delta, duplicates, funnel, groupStats, inPeriod, kpis, lastDays,
  offSite, pace, pendingTooLong, perDay, rentedStillOnline, splitByGroupType, splitByLangue, MAX_PER_DAY, MIN_GAP_MINUTES,
} from "@/lib/social/stats";
import { AlerteForm, PublicationForm } from "@/components/admin/social/SocialForms";
import { SOCIAL_BASE, SetupNotice, SocialNav } from "@/components/admin/social/SocialUI";
import { formatDate, formatDateTime, pct } from "@/lib/social/format";

type PeriodChoice = "7" | "30" | "90" | "custom";
const ADMIN = "/manage-xk92p";
/** Nom de groupe raccourci pour l’axe des graphiques (le nom complet reste dans l’infobulle du tableau accessible). */
const short = (name: string) => (name.length > 26 ? `${name.slice(0, 25).trimEnd()}…` : name);

export default function AdminReseaux() {
  const { data, isLoading, isError, refetch } = useSocialData();
  const removeAlerte = useDeleteAlerte();
  const [period, setPeriod] = useState<PeriodChoice>("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reseau, setReseau] = useState("");
  const [type, setType] = useState("");
  const [bien, setBien] = useState("");
  const [pubOpen, setPubOpen] = useState(false);
  const [alerteOpen, setAlerteOpen] = useState(false);

  const view = useMemo(() => {
    if (!data || data.missing) return null;
    const now = new Date();
    const periods = period === "custom" && from && to ? customPeriod(new Date(`${from}T00:00:00`), new Date(`${to}T23:59:59`)) : lastDays(Number(period === "custom" ? 30 : period), now);
    const groupes = new Map(data.groupes.map((g) => [g.id, g]));
    const biens = new Map(data.biens.map((b) => [b.id, b]));
    const allPubs = new Map(data.pubs.map((p) => [p.id, p]));
    // Filtres réseau, type de groupe et bien, appliqués aux publications puis aux clients qui en viennent.
    const keep = (p: Publication) => (!reseau || p.reseau === reseau) && (!type || (p.groupe_id && groupes.get(p.groupe_id)?.type === type)) && (!bien || p.bien_id === bien || (bien === "hors" && !p.bien_id));
    const pubs = data.pubs.filter(keep);
    const kept = new Set(pubs.map((p) => p.id));
    const filtered = !!(reseau || type || bien);
    const leads = data.leads.filter((l) => {
      if (!filtered) return true;
      const pub = l.origine_publication_id ? allPubs.get(l.origine_publication_id) : undefined;
      if (pub) return kept.has(pub.id);
      return (!reseau || l.origine_reseau === reseau) && !type && (!bien || l.bien_id === bien);
    });
    const visites = data.visites.filter((v) => !filtered || (v.origine_publication_id ? kept.has(v.origine_publication_id) : (!reseau || v.origine_reseau === reseau) && !type && (!bien || v.property_v2_id === bien)));
    const clics = data.clics.filter((c) => kept.has(c.publication_id));
    const input = { pubs, clics, leads, visites };
    const current = kpis(input, periods.current);
    const previous = kpis(input, periods.previous);
    const pubsInPeriod = pubs.filter((p) => inPeriod(p.publie_le, periods.current));
    const leadsInPeriod = leads.filter((l) => inPeriod(l.created_at, periods.current));
    const stats = groupStats(data.groupes, pubsInPeriod, clics.filter((c) => inPeriod(c.created_at, periods.current)), leadsInPeriod).filter((s) => s.publications > 0 || s.clients > 0);
    const slots = bestSlots(pubsInPeriod, leadsInPeriod);
    return {
      periods, current, previous, groupes, biens,
      daily: perDay(pubs, leads, periods.current),
      networks: clientsByNetwork(pubs, leads, periods.current),
      funnel: funnel(current),
      topClients: [...stats].sort((a, b) => b.clients - a.clients).slice(0, 10).map((s) => ({ name: short(s.groupe.nom), value: s.clients })),
      topPer1000: [...stats].filter((s) => s.pour1000 !== null).sort((a, b) => (b.pour1000 ?? 0) - (a.pour1000 ?? 0)).slice(0, 10).map((s) => ({ name: short(s.groupe.nom), value: s.pour1000 ?? 0 })),
      byType: splitByGroupType(pubsInPeriod, leadsInPeriod, groupes),
      byLangue: splitByLangue(pubsInPeriod, leadsInPeriod),
      slots,
      // À surveiller : sur toutes les publications, pas seulement la période.
      pending: pendingTooLong(data.pubs, now),
      doublons: duplicates(data.pubs),
      rythme: pace(data.pubs, now),
      loues: rentedStillOnline(data.pubs, data.biens),
      horsSite: offSite(data.pubs),
      alertes: data.alertes.slice(0, 5),
    };
  }, [data, period, from, to, reseau, type, bien]);

  if (isLoading) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8" aria-busy="true"><div className="h-9 w-56 rounded bg-[hsl(38_30%_91%)]" /></div>;
  if (isError || !data) return <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8"><ErrorState title="Impossible de charger les réseaux sociaux" onRetry={() => refetch()} /></div>;

  const header = (
    <>
      <PageHeader title="Réseaux sociaux">
        <button type="button" onClick={() => setAlerteOpen(true)} disabled={data.missing} className={btn.outline}><BellPlus size={18} aria-hidden="true" />Alerte compte</button>
        <button type="button" onClick={() => setPubOpen(true)} disabled={data.missing} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter une publication</button>
      </PageHeader>
      <SocialNav />
    </>
  );

  if (data.missing || !view) return <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 lg:px-10 lg:py-8">{header}<SetupNotice /></div>;

  const { current: k, previous: p } = view;
  const cards = [
    { label: "Publications", value: k.publications, delta: delta(k.publications, p.publications), sub: "sur la période", to: `${SOCIAL_BASE}/journal` },
    { label: "En ligne / en attente / refusées", value: `${k.enLigne} / ${k.enAttente} / ${k.refusees}`, sub: `approbation ${pct(k.approbation)}` },
    { label: "Clics vers le site", value: k.clics, delta: delta(k.clics, p.clics), sub: "via les liens suivis" },
    { label: "Clients venus des réseaux", value: k.clients, delta: delta(k.clients, p.clients), sub: "fiches clients", to: `${ADMIN}/clients` },
    { label: "Visites issues des réseaux", value: k.visites, delta: delta(k.visites, p.visites), sub: "demandes de visite", to: `${ADMIN}/visites` },
    { label: "Loués / vendus grâce aux réseaux", value: k.conclus, delta: delta(k.conclus, p.conclus), sub: "clients convertis" },
  ];

  const watch: { key: string; kind: string; title: string; detail: string; to?: string; tone?: "danger" }[] = [
    ...(view.rythme.alert ? [{
      key: "rythme", kind: "Rythme", tone: "danger" as const,
      title: `${view.rythme.today} publication(s) aujourd’hui`,
      detail: [view.rythme.tooMany && `au-delà de ${MAX_PER_DAY} par jour`, view.rythme.tooClose > 0 && `${view.rythme.tooClose} publication(s) à moins de ${MIN_GAP_MINUTES} minutes d’intervalle`].filter(Boolean).join(" · ") + ". Ralentissez pour éviter un nouveau blocage.",
    }] : []),
    ...view.loues.map(({ bien, pubs }) => ({ key: `l-${bien.id}`, kind: "Bien loué / vendu", tone: "danger" as const, title: bien.titre, detail: `${pubs.length} publication(s) encore en ligne ou en attente : à retirer.`, to: `${SOCIAL_BASE}/journal?bien=${bien.id}` })),
    ...view.pending.map((pub) => ({ key: `p-${pub.id}`, kind: "En attente", title: `${pub.bien_id ? view.biens.get(pub.bien_id)?.titre ?? "Bien" : pub.bien_hors_site} · ${pub.groupe_id ? view.groupes.get(pub.groupe_id)?.nom ?? "" : RESEAUX[pub.reseau].label}`, detail: `Publiée le ${formatDateTime(pub.publie_le)}, toujours en attente d’approbation (${pubRef(pub)}).`, to: `${SOCIAL_BASE}/journal?statut=en-attente` })),
    ...view.doublons.map(({ first, second }) => ({ key: `d-${second.id}`, kind: "Doublon", title: `${second.bien_id ? view.biens.get(second.bien_id)?.titre ?? "Bien" : second.bien_hors_site} · ${view.groupes.get(second.groupe_id ?? "")?.nom ?? ""}`, detail: `Publié le ${formatDate(first.publie_le)} puis le ${formatDate(second.publie_le)} dans le même groupe (moins de 7 jours).` })),
    ...view.horsSite.map((h) => ({ key: `h-${h.name}`, kind: "Bien hors site", title: h.name, detail: `${h.count} publication(s) liées à un bien qui n’est pas sur le site : créez le bien, puis rattachez-les.`, to: `${ADMIN}/biens?new=1` })),
  ];

  const daily = view.daily.map((d) => ({ ...d, name: d.day.slice(5).split("-").reverse().join("/") }));

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 lg:gap-6 lg:px-10 lg:py-8">
      {header}

      {/* Filtres */}
      <section aria-label="Filtres" className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-3.5 lg:p-4">
        <Chips<PeriodChoice> label="Période" value={period} onChange={setPeriod} options={[{ value: "7", label: "7 jours" }, { value: "30", label: "30 jours" }, { value: "90", label: "90 jours" }, { value: "custom", label: "Personnalisée" }]} />
        {period === "custom" && (
          <div className="grid grid-cols-2 gap-2.5 sm:max-w-md">
            <label className="flex flex-col gap-1"><span className={field.label}>Du</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field.input} /></label>
            <label className="flex flex-col gap-1"><span className={field.label}>Au</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field.input} /></label>
          </div>
        )}
        <div className="grid gap-2.5 sm:grid-cols-3">
          <SelectField label="Réseau" value={reseau} onChange={setReseau}><option value="">Tous les réseaux</option>{Object.entries(RESEAUX).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}</SelectField>
          <SelectField label="Type de groupe" value={type} onChange={setType}><option value="">Tous les types de groupe</option>{Object.entries(GROUPE_TYPES).map(([key, l]) => <option key={key} value={key}>{l}</option>)}</SelectField>
          <SelectField label="Bien" value={bien} onChange={setBien}><option value="">Tous les biens</option>{data.biens.map((b) => <option key={b.id} value={b.id}>{b.titre}</option>)}<option value="hors">Biens hors site</option></SelectField>
        </div>
      </section>

      {/* Chiffres */}
      <section aria-label="Chiffres de la période" className="grid grid-cols-2 gap-2.5 lg:grid-cols-6 lg:gap-3.5">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </section>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[7fr_5fr] lg:items-start">
        {/* À surveiller */}
        <section aria-labelledby="watch-title" className="overflow-hidden rounded-[10px] border border-[hsl(20_47%_85%)] bg-[hsl(20_70%_95%)]">
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 lg:px-5">
            <SectionTitle id="watch-title">À surveiller</SectionTitle>
            <CountBadge count={watch.length} />
          </div>
          <p className="m-0 border-t border-[hsl(25_38%_90%)] bg-card px-4 py-2.5 text-[13px] text-muted-foreground lg:px-5">
            Aujourd’hui : <strong className="text-foreground">{view.rythme.today}</strong> publication(s) sur {MAX_PER_DAY} conseillées, au moins {MIN_GAP_MINUTES} minutes entre deux.
          </p>
          {watch.length === 0 ? (
            <p className="m-0 border-t border-[hsl(20_47%_85%)] bg-card px-4 py-6 text-center text-sm text-muted-foreground lg:px-5">Rien à signaler : pas de doublon, pas de publication bloquée en attente, rythme raisonnable.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {watch.map((w) => (
                <li key={w.key} className="flex flex-col gap-2 border-t border-[hsl(25_38%_90%)] bg-card px-4 py-3 lg:grid lg:grid-cols-[130px_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-5">
                  <span className={cn("text-xs font-semibold uppercase tracking-[0.06em]", w.tone === "danger" ? "text-destructive" : "text-accent")}>{w.kind}</span>
                  <span className="flex min-w-0 flex-col gap-0.5"><span className="text-[15px] font-semibold leading-snug">{w.title}</span><span className="text-[13px] leading-snug text-muted-foreground">{w.detail}</span></span>
                  {w.to && <Link to={w.to} className="flex h-11 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-semibold text-white lg:h-10">Ouvrir</Link>}
                </li>
              ))}
            </ul>
          )}
          {/* Dernières alertes de compte */}
          <div className="border-t border-[hsl(20_47%_85%)] bg-card px-4 py-3 lg:px-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="m-0 text-sm font-semibold">Dernières alertes de compte</h3>
              <button type="button" onClick={() => setAlerteOpen(true)} className="min-h-10 text-sm font-semibold text-primary">Ajouter</button>
            </div>
            {view.alertes.length === 0 ? <p className="m-0 text-[13px] text-muted-foreground">Aucune alerte enregistrée.</p> : (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {view.alertes.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-[13px]">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
                    <span className="flex-1"><strong>{ALERTE_TYPES[a.type]}</strong> · {RESEAUX[a.reseau].label} · {formatDateTime(a.survenue_le)}{a.compte ? ` · ${a.compte}` : ""}{a.remarque ? ` — ${a.remarque}` : ""}</span>
                    <button type="button" onClick={() => removeAlerte.mutate(a.id)} aria-label="Supprimer l’alerte" className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"><Trash2 size={15} aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Entonnoir et réseaux */}
        <section aria-labelledby="funnel-title" className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4 lg:p-5">
          <SectionTitle id="funnel-title">Entonnoir</SectionTitle>
          <HBarChart data={view.funnel} color={OLIVE} label="Publications, clics, clients, visites, biens conclus" unit={["", ""]} empty="Pas encore de données." />
          <SectionTitle>Clients par réseau</SectionTitle>
          <HBarChart data={view.networks} color={BROWN} label="Clients par réseau" unit={["client", "clients"]} empty="Aucun client venu des réseaux sur la période." />
        </section>
      </div>

      {/* Publications et clients par jour */}
      <section aria-labelledby="daily-title" className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4 lg:p-5">
        <SectionTitle id="daily-title">Publications et clients par jour</SectionTitle>
        <figure className="m-0" aria-label="Publications et clients par jour">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barGap={1}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval="preserveStartEnd" tick={{ fontSize: 11, fontFamily: "Montserrat, sans-serif" }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fontFamily: "Montserrat, sans-serif" }} />
              <Tooltip cursor={{ fill: "hsl(39 47% 94%)" }} contentStyle={{ borderRadius: 8, border: "1px solid hsl(35 30% 86%)", fontFamily: "Montserrat, sans-serif", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Montserrat, sans-serif" }} iconSize={10} />
              <Bar dataKey="publications" name="Publications" fill={OLIVE} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="clients" name="Clients" fill={BROWN} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </figure>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4 lg:p-5">
          <SectionTitle>Top 10 des groupes par clients</SectionTitle>
          <HBarChart data={view.topClients.filter((t) => t.value > 0)} color={OLIVE} label="Groupes qui amènent le plus de clients" unit={["client", "clients"]} empty="Aucun client rattaché à un groupe sur la période." nameWidth={190} />
          <SectionTitle>Clients pour 1 000 membres</SectionTitle>
          <HBarChart data={view.topPer1000.filter((t) => t.value > 0)} color={BROWN} label="Clients pour 1 000 membres" unit={["", ""]} empty="Renseignez le nombre de membres des groupes pour comparer." nameWidth={190} />
        </section>
        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4 lg:p-5">
          <SectionTitle>Immo, expat ou quartier</SectionTitle>
          <HBarPair data={view.byType} label="Publications et clients par type de groupe" />
          <SectionTitle>Langue des publications</SectionTitle>
          <HBarPair data={view.byLangue} label="Publications et clients par langue" />
        </section>
      </div>

      <section className="grid gap-5 rounded-[10px] border border-border bg-card p-4 lg:grid-cols-2 lg:p-5">
        <div className="flex flex-col gap-3">
          <SectionTitle>Meilleurs jours de publication</SectionTitle>
          <HBarPair data={view.slots.days.filter((d) => d.publications > 0)} label="Publications et clients par jour de la semaine" />
        </div>
        <div className="flex flex-col gap-3">
          <SectionTitle>Meilleures heures (Casablanca)</SectionTitle>
          <HBarPair data={view.slots.hours.filter((d) => d.publications > 0)} label="Publications et clients par tranche horaire" nameWidth={150} />
        </div>
      </section>

      <PublicationForm open={pubOpen} onClose={() => setPubOpen(false)} publication={null} biens={data.biens} groupes={data.groupes} pubs={data.pubs} />
      <AlerteForm open={alerteOpen} onClose={() => setAlerteOpen(false)} />
    </div>
  );
}

