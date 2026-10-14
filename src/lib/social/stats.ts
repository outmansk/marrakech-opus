import {
  RESEAUX, GROUPE_TYPES, LANGUES, bienKey, fromOrigin, pubRef,
  type Clic, type Groupe, type LeadOrigine, type Publication, type VisiteOrigine,
} from "./model";

// Calculs de la section « Réseaux sociaux » : fonctions pures, testées dans stats.test.ts.
// Toutes les dates sont lues à l'heure de Casablanca.

export const TZ = "Africa/Casablanca";
const DAY = 24 * 3600 * 1000;

export const PENDING_ALERT_DAYS = 3;
export const DUPLICATE_DAYS = 7;
export const MAX_PER_DAY = 5;
export const MIN_GAP_MINUTES = 10;

// Un seul formateur (le créer coûte cher) ; résultats mis en cache par date.
const FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", weekday: "short", hour12: false,
});
const cache = new Map<string, Record<string, string>>();
const parts = (iso: string | Date) => {
  const key = typeof iso === "string" ? iso : iso.toISOString();
  let values = cache.get(key);
  if (!values) {
    values = Object.fromEntries(FORMATTER.formatToParts(new Date(key)).map((p) => [p.type, p.value])) as Record<string, string>;
    if (cache.size > 5000) cache.clear();
    cache.set(key, values);
  }
  return values;
};

/** Jour au format AAAA-MM-JJ, à l'heure de Casablanca. */
export const dayKey = (iso: string | Date) => { const p = parts(iso); return `${p.year}-${p.month}-${p.day}`; };
const hourOf = (iso: string) => Number(parts(iso).hour) % 24;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const weekdayOf = (iso: string) => WEEKDAYS.indexOf(parts(iso).weekday);

// ─── Périodes ──────────────────────────────────────────────────────────────

export interface Periode { from: Date; to: Date }

/** Les N derniers jours jusqu'à maintenant, et la période précédente de même durée. */
export function lastDays(days: number, now = new Date()): { current: Periode; previous: Periode } {
  const to = now;
  const from = new Date(now.getTime() - days * DAY);
  return { current: { from, to }, previous: { from: new Date(from.getTime() - days * DAY), to: from } };
}

export function customPeriod(from: Date, to: Date): { current: Periode; previous: Periode } {
  const span = Math.max(to.getTime() - from.getTime(), DAY);
  return { current: { from, to }, previous: { from: new Date(from.getTime() - span), to: from } };
}

export const inPeriod = (iso: string, p: Periode) => { const t = new Date(iso).getTime(); return t >= p.from.getTime() && t < p.to.getTime(); };

// ─── Indicateurs de base ───────────────────────────────────────────────────

/** Publications acceptées (en ligne, ou expirées après avoir été en ligne) sur celles qui ont reçu une réponse. */
export function approvalRate(pubs: Pick<Publication, "statut">[]): number | null {
  const accepted = pubs.filter((p) => p.statut === "en-ligne" || p.statut === "expiree").length;
  const refused = pubs.filter((p) => p.statut === "refusee").length;
  return accepted + refused === 0 ? null : accepted / (accepted + refused);
}

export const leadsFromNetworks = <T extends LeadOrigine>(leads: T[]) => leads.filter(fromOrigin);
export const won = (lead: Pick<LeadOrigine, "status">) => lead.status === "converti";

export interface Kpis {
  publications: number;
  enLigne: number;
  enAttente: number;
  refusees: number;
  approbation: number | null;
  clics: number;
  clients: number;
  visites: number;
  conclus: number;
}

export function kpis(data: { pubs: Publication[]; clics: Clic[]; leads: LeadOrigine[]; visites: VisiteOrigine[] }, p: Periode): Kpis {
  const pubs = data.pubs.filter((x) => inPeriod(x.publie_le, p));
  const leads = leadsFromNetworks(data.leads).filter((l) => inPeriod(l.created_at, p));
  return {
    publications: pubs.length,
    enLigne: pubs.filter((x) => x.statut === "en-ligne").length,
    enAttente: pubs.filter((x) => x.statut === "en-attente").length,
    refusees: pubs.filter((x) => x.statut === "refusee").length,
    approbation: approvalRate(pubs),
    clics: data.clics.filter((c) => inPeriod(c.created_at, p)).length,
    clients: leads.length,
    visites: data.visites.filter((v) => fromOrigin(v) && inPeriod(v.created_at, p)).length,
    conclus: leads.filter(won).length,
  };
}

/** Variation en % entre deux valeurs, null quand la base est nulle. */
export const delta = (current: number, previous: number) => (previous === 0 ? null : Math.round(((current - previous) / previous) * 100));

// ─── Séries pour les graphiques ────────────────────────────────────────────

export function perDay(pubs: Publication[], leads: LeadOrigine[], p: Periode) {
  const days: string[] = [];
  for (let t = p.from.getTime(); t < p.to.getTime(); t += DAY) days.push(dayKey(new Date(t)));
  if (!days.includes(dayKey(new Date(p.to.getTime() - 1)))) days.push(dayKey(new Date(p.to.getTime() - 1)));
  const count = (keys: string[]) => keys.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {});
  const byPub = count(pubs.filter((x) => inPeriod(x.publie_le, p)).map((x) => dayKey(x.publie_le)));
  const byLead = count(leadsFromNetworks(leads).filter((l) => inPeriod(l.created_at, p)).map((l) => dayKey(l.created_at)));
  return [...new Set(days)].map((day) => ({ day, publications: byPub[day] ?? 0, clients: byLead[day] ?? 0 }));
}

const pubById = (pubs: Publication[]) => new Map(pubs.map((x) => [x.id, x]));

/** Réseau d'un client : celui de sa publication, sinon celui saisi à la main. */
export function leadReseau(lead: LeadOrigine, pubs: Map<string, Publication>) {
  return (lead.origine_publication_id && pubs.get(lead.origine_publication_id)?.reseau) || lead.origine_reseau || null;
}

export function clientsByNetwork(pubs: Publication[], leads: LeadOrigine[], p: Periode) {
  const map = pubById(pubs);
  const counts = new Map<string, number>();
  for (const lead of leadsFromNetworks(leads).filter((l) => inPeriod(l.created_at, p))) {
    const reseau = leadReseau(lead, map) ?? "autre";
    counts.set(reseau, (counts.get(reseau) ?? 0) + 1);
  }
  return [...counts].map(([k, value]) => ({ name: RESEAUX[k as keyof typeof RESEAUX]?.label ?? k, value })).sort((a, b) => b.value - a.value);
}

export function funnel(k: Kpis) {
  return [
    { name: "Publications", value: k.publications },
    { name: "Clics vers le site", value: k.clics },
    { name: "Clients", value: k.clients },
    { name: "Visites", value: k.visites },
    { name: "Loués / vendus", value: k.conclus },
  ];
}

// ─── Groupes ───────────────────────────────────────────────────────────────

export type Score = "garder" | "surveiller" | "abandonner";
export const SCORE_LABELS: Record<Score, string> = { garder: "À garder", surveiller: "À surveiller", abandonner: "À abandonner" };

/** À garder : au moins 1 client et 50 % d'approbation. À abandonner : 3 publications sans client, ou moins de 30 % d'approbation. */
export function groupScore(s: { publications: number; clients: number; approbation: number | null }): Score {
  if (s.approbation !== null && s.approbation < 0.3 && s.publications >= 2) return "abandonner";
  if (s.clients >= 1 && (s.approbation === null || s.approbation >= 0.5)) return "garder";
  if (s.publications >= 3 && s.clients === 0) return "abandonner";
  return "surveiller";
}

export interface GroupeStats {
  groupe: Groupe;
  publications: number;
  approbation: number | null;
  clics: number;
  clients: number;
  pour1000: number | null;
  dernierePublication: string | null;
  score: Score;
}

/** Clients d'un groupe : ceux rattachés à une de ses publications, ou à lui directement. */
export function groupStats(groupes: Groupe[], pubs: Publication[], clics: Clic[], leads: LeadOrigine[]): GroupeStats[] {
  const map = pubById(pubs);
  const networkLeads = leadsFromNetworks(leads);
  return groupes.map((groupe) => {
    const own = pubs.filter((x) => x.groupe_id === groupe.id);
    const ids = new Set(own.map((x) => x.id));
    const clients = networkLeads.filter((l) => {
      const pub = l.origine_publication_id ? map.get(l.origine_publication_id) : undefined;
      return pub ? ids.has(pub.id) : l.origine_groupe_id === groupe.id;
    }).length;
    const approbation = approvalRate(own);
    const last = own.map((x) => x.publie_le).sort().at(-1) ?? null;
    return {
      groupe,
      publications: own.length,
      approbation,
      clics: clics.filter((c) => ids.has(c.publication_id)).length,
      clients,
      pour1000: groupe.membres ? Math.round((clients / groupe.membres) * 1000 * 100) / 100 : null,
      dernierePublication: last,
      score: groupScore({ publications: own.length, clients, approbation }),
    };
  });
}

export function splitBy<K extends string>(pubs: Publication[], leads: LeadOrigine[], keyOf: (pub: Publication) => K | null, labels: Record<string, string>) {
  const map = pubById(pubs);
  const rows = new Map<string, { publications: number; clients: number }>();
  const row = (k: string) => rows.get(k) ?? rows.set(k, { publications: 0, clients: 0 }).get(k)!;
  for (const pub of pubs) { const k = keyOf(pub); if (k) row(k).publications += 1; }
  for (const lead of leadsFromNetworks(leads)) {
    const pub = lead.origine_publication_id ? map.get(lead.origine_publication_id) : undefined;
    const k = pub ? keyOf(pub) : null;
    if (k) row(k).clients += 1;
  }
  return [...rows].map(([k, v]) => ({ name: labels[k] ?? k, ...v }));
}

export const splitByGroupType = (pubs: Publication[], leads: LeadOrigine[], groupes: Map<string, Groupe>) =>
  splitBy(pubs, leads, (pub) => (pub.groupe_id ? groupes.get(pub.groupe_id)?.type ?? null : null), GROUPE_TYPES);
export const splitByLangue = (pubs: Publication[], leads: LeadOrigine[]) => splitBy(pubs, leads, (pub) => pub.langue, LANGUES);

/** Publications et clients par jour de la semaine et par tranche horaire de publication. */
export function bestSlots(pubs: Publication[], leads: LeadOrigine[]) {
  const map = pubById(pubs);
  const clientsByPub = new Map<string, number>();
  for (const lead of leadsFromNetworks(leads)) if (lead.origine_publication_id && map.has(lead.origine_publication_id)) clientsByPub.set(lead.origine_publication_id, (clientsByPub.get(lead.origine_publication_id) ?? 0) + 1);
  const slots = [["Matin (6 h – 12 h)", 6, 12], ["Après-midi (12 h – 17 h)", 12, 17], ["Soir (17 h – 22 h)", 17, 22], ["Nuit (22 h – 6 h)", 22, 30]] as const;
  const days = WEEKDAY_FR.map((name) => ({ name, publications: 0, clients: 0 }));
  const hours = slots.map(([name]) => ({ name, publications: 0, clients: 0 }));
  for (const pub of pubs) {
    const d = weekdayOf(pub.publie_le);
    const h = hourOf(pub.publie_le);
    const slot = slots.findIndex(([, a, b]) => (h >= a && h < b) || (h + 24 >= a && h + 24 < b));
    const clients = clientsByPub.get(pub.id) ?? 0;
    if (d >= 0) { days[d].publications += 1; days[d].clients += clients; }
    if (slot >= 0) { hours[slot].publications += 1; hours[slot].clients += clients; }
  }
  return { days, hours };
}

// ─── À surveiller ──────────────────────────────────────────────────────────

const minutes = (a: string, b: string) => Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60000;

export function pendingTooLong(pubs: Publication[], now = new Date(), days = PENDING_ALERT_DAYS) {
  return pubs.filter((p) => p.statut === "en-attente" && now.getTime() - new Date(p.publie_le).getTime() > days * DAY);
}

/** Même bien publié dans le même groupe à moins de 7 jours d'intervalle (publications refusées ou supprimées exclues). */
export function duplicates(pubs: Publication[], days = DUPLICATE_DAYS) {
  const active = pubs.filter((p) => p.groupe_id && p.statut !== "refusee" && p.statut !== "supprimee")
    .sort((a, b) => a.publie_le.localeCompare(b.publie_le));
  const found: { first: Publication; second: Publication }[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.groupe_id === b.groupe_id && bienKey(a) === bienKey(b) && minutes(a.publie_le, b.publie_le) < days * 24 * 60) found.push({ first: a, second: b });
    }
  }
  return found;
}

/** Rythme du jour : alerte au-delà de 5 publications ou si deux publications ont moins de 10 minutes d'écart. */
export function pace(pubs: Publication[], now = new Date()) {
  const today = dayKey(now);
  const list = pubs.filter((p) => dayKey(p.publie_le) === today).sort((a, b) => a.publie_le.localeCompare(b.publie_le));
  const tooClose = list.slice(1).filter((p, i) => minutes(p.publie_le, list[i].publie_le) < MIN_GAP_MINUTES).length;
  return { today: list.length, tooMany: list.length > MAX_PER_DAY, tooClose, alert: list.length > MAX_PER_DAY || tooClose > 0 };
}

/** Biens loués ou vendus qui ont encore des publications en ligne ou en attente : à retirer. */
export function rentedStillOnline(pubs: Publication[], biens: { id: string; titre: string; statut: string }[]) {
  const closed = new Map(biens.filter((b) => b.statut === "vendu-loue").map((b) => [b.id, b]));
  const byBien = new Map<string, { bien: { id: string; titre: string }; pubs: Publication[] }>();
  for (const pub of pubs) {
    if (!pub.bien_id || !closed.has(pub.bien_id) || (pub.statut !== "en-ligne" && pub.statut !== "en-attente")) continue;
    const entry = byBien.get(pub.bien_id) ?? byBien.set(pub.bien_id, { bien: closed.get(pub.bien_id)!, pubs: [] }).get(pub.bien_id)!;
    entry.pubs.push(pub);
  }
  return [...byBien.values()];
}

export function offSite(pubs: Publication[]) {
  const names = new Map<string, number>();
  for (const pub of pubs) if (!pub.bien_id && pub.bien_hors_site) names.set(pub.bien_hors_site.trim(), (names.get(pub.bien_hors_site.trim()) ?? 0) + 1);
  return [...names].map(([name, count]) => ({ name, count }));
}

/** Groupes encore jamais utilisés pour ce bien, en respectant leurs règles (agences et immobilier interdits, groupes à éviter). */
export function unusedGroupsFor(bienId: string, groupes: Groupe[], pubs: Publication[]) {
  const used = new Set(pubs.filter((p) => p.bien_id === bienId).map((p) => p.groupe_id));
  return groupes.filter((g) => !used.has(g.id) && g.statut !== "a-eviter" && !g.agences_interdites && !g.immobilier_interdit);
}

// ─── Lien suivi et export ──────────────────────────────────────────────────

export function trackedUrl(baseUrl: string, propertyPathname: string, pub: Pick<Publication, "code" | "reseau">, groupe?: Pick<Groupe, "code"> | null) {
  const params = new URLSearchParams({ src: RESEAUX[pub.reseau]?.src ?? "xx" });
  if (groupe) params.set("g", String(groupe.code));
  params.set("p", String(pub.code));
  return `${baseUrl}${propertyPathname}?${params.toString()}`;
}

export { pubRef };

/** CSV séparé par « ; » avec BOM : s'ouvre directement dans Excel. */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}
