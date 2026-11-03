import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Home, MessageCircle, Phone, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Bien } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import StatusBadge, { CountBadge } from "@/components/admin/StatusBadge";
import { CLOSED_LEAD_STATUSES, CLOSED_VISIT_STATUSES, endOfToday } from "@/hooks/useAdminCounts";
import { SectionTitle } from "@/components/admin/charts";
import type { Publication } from "@/lib/social/model";
import { pendingTooLong, rentedStillOnline } from "@/lib/social/stats";
import { telHref, whatsappHref } from "@/lib/contact";
import { TACHE_TYPE, echeanceLabel, isLate, type Tache } from "@/lib/agenda";
import { furnishedOf, zoneOf } from "@/content/zones";
import { propertyText } from "@/lib/propertyI18n";
import { STATUT_LABELS, STATUT_TONE, mainPrice, type LeadStatus } from "@/lib/labels";

const BASE = "/manage-xk92p";
const DAY = 24 * 3600 * 1000;
/** Lines of the « À faire » list shown on a phone before « Tout afficher ». */
const TODO_PREVIEW = 5;

// Only the columns the dashboard shows: the full rows (descriptions, translations) weigh ~8× more.
const BIEN_COLUMNS = "id, titre, statut, photo_principale, services, service, prix, prix_vente, prix_location_longue, prix_location_courte, devise, updated_at, meuble, quartier, titre_en, titre_es, traduction_a_relire";

type Visit = { id: string; client_name: string; client_phone: string; requested_date: string; property_v2_id: string | null };
type Lead = {
  id: string; name: string; phone: string; status: LeadStatus; next_follow_up_at: string | null; created_at: string;
  transaction_type: string; budget_min: number | null; budget_max: number | null; preferred_areas: string[] | null;
};
type DueTask = Pick<Tache, "id" | "type" | "titre" | "echeance" | "fait"> & { contact: { nom: string; telephone: string | null } | null };
type Message = { id: string; name: string; phone: string | null; message: string };

const PROJECT_LABELS: Record<string, string> = { "location-longue-duree": "Location longue", "location-courte-duree": "Séjour", vente: "Achat" };

/** Everything the dashboard needs, in one round of small requests. Missing tables (CRM, agenda, réseaux) count as empty. */
function useDashboardData() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const end = endOfToday().toISOString();
      const weekAgo = new Date(Date.now() - 7 * DAY).toISOString();
      const [biens, visits, leads, newClients, taches, messages, pubs] = await Promise.all([
        supabase.from("properties_v2").select(BIEN_COLUMNS).order("updated_at", { ascending: false }),
        supabase.from("visit_requests").select("id, client_name, client_phone, requested_date, property_v2_id").not("status", "in", CLOSED_VISIT_STATUSES).order("requested_date"),
        supabase.from("client_leads").select("id, name, phone, status, next_follow_up_at, created_at, transaction_type, budget_min, budget_max, preferred_areas").not("status", "in", CLOSED_LEAD_STATUSES).order("created_at", { ascending: false }),
        supabase.from("client_leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("taches").select("id, type, titre, echeance, fait, contact:contacts(nom, telephone)").eq("fait", false).lte("echeance", end).order("echeance"),
        supabase.from("contact_messages").select("id, name, phone, message").eq("traite", false).order("created_at", { ascending: false }),
        supabase.from("social_publications").select("id, bien_id, statut, publie_le").in("statut", ["en-ligne", "en-attente"]),
      ]);
      if (biens.error) throw biens.error;
      return {
        biens: (biens.data ?? []) as unknown as Bien[],
        visits: (visits.data ?? []) as Visit[],
        leads: (leads.data ?? []) as Lead[],
        newClients: newClients.count ?? 0,
        taches: (taches.data ?? []) as unknown as DueTask[],
        messages: (messages.data ?? []) as Message[],
        pubs: (pubs.data ?? []) as unknown as Publication[],
      };
    },
  });
}

function formatVisitDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function budget(lead: Lead) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  if (lead.budget_min && lead.budget_max) return `${fmt(lead.budget_min)} – ${fmt(lead.budget_max)} MAD`;
  if (lead.budget_max) return `jusqu’à ${fmt(lead.budget_max)} MAD`;
  if (lead.budget_min) return `dès ${fmt(lead.budget_min)} MAD`;
  return null;
}

/** What a published listing still lacks to show well on the site (furnished status, area, EN/ES texts). */
function missingInfo(bien: Bien) {
  const missing: string[] = [];
  if ((bien.services ?? []).includes("location-longue-duree") && furnishedOf(bien) === null) missing.push("meublé ou vide");
  if (!zoneOf(bien)) missing.push("quartier");
  if (!propertyText(bien, "en").translated) missing.push("anglais");
  if (!propertyText(bien, "es").translated) missing.push("espagnol");
  if (bien.traduction_a_relire) missing.push("traduction à relire");
  return missing;
}

type TodoItem = {
  key: string; kind: string; name: string; detail: string; phone?: string; late?: boolean;
  action: { label: string; to?: string; run?: () => void };
};

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-4 lg:gap-6 lg:px-10 lg:py-8" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="h-8 w-36 rounded bg-[hsl(38_30%_91%)]" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3.5">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[84px] rounded-[10px] border border-border bg-card" />)}
      </div>
      <div className="h-64 rounded-[10px] bg-[hsl(38_30%_93%)]" />
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardData();
  const [showAllTodo, setShowAllTodo] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const queryClient = useQueryClient();

  const view = useMemo(() => {
    if (!data) return null;
    const limit = endOfToday();
    const bienById = new Map(data.biens.map((b) => [b.id, b]));
    const followUps = data.leads.filter((l) => l.next_follow_up_at && new Date(l.next_follow_up_at) <= limit);
    const newLeads = data.leads.filter((l) => l.status === "nouveau" && !followUps.includes(l));
    const incomplete = data.biens
      .filter((b) => b.statut === "publie")
      .map((bien) => ({ bien, missing: missingInfo(bien) }))
      .filter((item) => item.missing.length > 0);
    return {
      bienById, followUps, newLeads, incomplete,
      published: data.biens.filter((b) => b.statut === "publie").length,
      closed: data.biens.filter((b) => b.statut === "vendu-loue").length,
    };
  }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data || !view) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-5 lg:px-10 lg:py-8">
        <div role="alert" className="flex flex-col gap-3 rounded-[10px] border border-[hsl(11_47%_79%)] bg-[hsl(14_60%_95%)] p-4">
          <p className="m-0 text-[15px] font-semibold text-[hsl(9_57%_31%)]">Impossible de charger le tableau de bord</p>
          <p className="m-0 text-sm text-[hsl(36_8%_21%)]">Vérifiez votre connexion internet, puis réessayez. Vos données ne sont pas perdues.</p>
          <button type="button" onClick={() => refetch()} className="h-11 self-start rounded-md border border-input bg-white px-4 text-sm font-semibold">Réessayer</button>
        </div>
      </div>
    );
  }

  const confirmVisit = async (visit: Visit) => {
    const { error } = await supabase.from("visit_requests").update({ status: "confirmee" }).eq("id", visit.id);
    if (error) {
      toast.error("La visite n’a pas pu être confirmée. Réessayez.");
      return;
    }
    toast.success(`Visite de ${visit.client_name} confirmée.`);
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
  };

  const pendingPubs = pendingTooLong(data.pubs);
  const todo: TodoItem[] = [
    ...data.taches.map((t) => ({
      key: `t-${t.id}`, kind: TACHE_TYPE[t.type]?.label ?? "Tâche", name: t.titre, phone: t.contact?.telephone ?? undefined, late: isLate(t),
      detail: [isLate(t) ? `En retard · ${echeanceLabel(t.echeance)}` : echeanceLabel(t.echeance), t.contact?.nom].filter(Boolean).join(" · "),
      action: { label: "Ouvrir", to: `${BASE}/agenda?edit=${t.id}` },
    })),
    ...data.visits.map((v) => ({
      key: `v-${v.id}`, kind: "Visite", name: v.client_name, phone: v.client_phone,
      detail: [view.bienById.get(v.property_v2_id ?? "")?.titre, formatVisitDate(v.requested_date)].filter(Boolean).join(" · "),
      action: { label: "Confirmer", run: () => void confirmVisit(v) },
    })),
    ...view.followUps.map((l) => ({
      key: `f-${l.id}`, kind: "Relance", name: l.name, phone: l.phone,
      detail: [PROJECT_LABELS[l.transaction_type], budget(l), l.preferred_areas?.join(", ")].filter(Boolean).join(" · "),
      action: { label: "Ouvrir la fiche", to: `${BASE}/clients?edit=${l.id}` },
    })),
    ...view.newLeads.map((l) => ({
      key: `n-${l.id}`, kind: "Nouvelle demande", name: l.name, phone: l.phone,
      detail: [PROJECT_LABELS[l.transaction_type], budget(l), `reçue le ${new Date(l.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`].filter(Boolean).join(" · "),
      action: { label: "Qualifier", to: `${BASE}/clients?edit=${l.id}` },
    })),
    ...data.messages.map((m) => ({
      key: `m-${m.id}`, kind: "Message", name: m.name, phone: m.phone ?? undefined,
      detail: m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message,
      action: { label: "Lire", to: `${BASE}/messages` },
    })),
    ...rentedStillOnline(data.pubs, data.biens).map(({ bien, pubs }) => ({
      key: `sr-${bien.id}`, kind: "Réseaux", name: bien.titre, late: true,
      detail: `Loué ou vendu, mais ${pubs.length} publication(s) encore en ligne ou en attente : à retirer.`,
      action: { label: "Ouvrir", to: `${BASE}/reseaux/journal?bien=${bien.id}` },
    })),
    ...(pendingPubs.length ? [{
      key: "sp", kind: "Réseaux", name: `${pendingPubs.length} publication(s) en attente`,
      detail: "En attente d’approbation depuis plus de 3 jours : relancez les admins ou retirez-les.",
      action: { label: "Ouvrir", to: `${BASE}/reseaux/journal?statut=en-attente` },
    }] : []),
  ];

  const kpis = [
    { label: "Visites à confirmer", value: data.visits.length, sub: "demandes en attente", to: `${BASE}/visites`, alert: true },
    { label: "Relances du jour", value: view.followUps.length, sub: "clients à rappeler", to: `${BASE}/clients`, alert: true },
    { label: "Nouveaux clients", value: data.newClients, sub: "7 derniers jours", to: `${BASE}/clients` },
    { label: "Biens en ligne", value: view.published, sub: `${view.closed} loués ou vendus`, to: `${BASE}/biens` },
  ];

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pb-28 pt-4 lg:gap-6 lg:px-10 lg:py-8">
      {/* En-tête */}
      <section className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="m-0 font-serif text-[26px] font-semibold leading-tight lg:text-[38px]">{hour >= 18 ? "Bonsoir" : "Bonjour"}</h1>
          <span className="text-[13px] font-medium text-muted-foreground first-letter:uppercase lg:text-sm">{today}</span>
        </div>
        {/* Sur téléphone, le bouton « + » flottant propose déjà ces actions. */}
        <div className="hidden gap-2.5 lg:flex">
          <Link to={`${BASE}/clients?new=1`} className="flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-card px-[18px] text-sm font-semibold hover:bg-muted">
            <UserPlus size={18} strokeWidth={1.7} aria-hidden="true" />Ajouter un client
          </Link>
          <Link to={`${BASE}/biens?new=1`} className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-[18px] text-sm font-semibold text-white hover:bg-[hsl(70_19%_28%)]">
            <Plus size={18} strokeWidth={1.9} aria-hidden="true" />Ajouter un bien
          </Link>
        </div>
      </section>

      {/* Indicateurs : 2 × 2 sur téléphone */}
      <section aria-label="Indicateurs" className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3.5">
        {kpis.map((kpi) => (
          <Link key={kpi.label} to={kpi.to} className="flex flex-col gap-1 rounded-[10px] border border-border bg-card px-3 py-2.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] hover:border-input active:bg-muted lg:gap-2 lg:p-4">
            <span className="text-xs font-medium leading-tight text-muted-foreground lg:text-[13px]">{kpi.label}</span>
            <span className={cn("font-serif text-[28px] font-semibold leading-none lg:text-[36px]", kpi.alert && kpi.value > 0 ? "text-accent" : "text-foreground")}>{kpi.value}</span>
            <span className="truncate text-[11px] leading-snug text-muted-foreground lg:text-xs">{kpi.sub}</span>
          </Link>
        ))}
      </section>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-5">
        {/* À faire aujourd'hui */}
        <section aria-labelledby="todo-title" className="overflow-hidden rounded-[10px] border border-[hsl(20_47%_85%)] bg-[hsl(20_70%_95%)]">
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 lg:px-5">
            <SectionTitle id="todo-title">À faire aujourd’hui</SectionTitle>
            <CountBadge count={todo.length} />
          </div>
          {todo.length === 0 ? (
            <p className="m-0 border-t border-[hsl(20_47%_85%)] bg-card px-4 py-6 text-center text-sm text-muted-foreground lg:px-5">Tout est à jour : aucune tâche, visite ou relance prévue aujourd’hui.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {todo.map((item, index) => (
                <li key={item.key} className={cn("flex items-center gap-3 border-t border-[hsl(25_38%_90%)] bg-card px-4 py-2.5 lg:grid lg:grid-cols-[130px_minmax(0,1fr)_auto] lg:gap-4 lg:px-5 lg:py-3", !showAllTodo && index >= TODO_PREVIEW && "hidden lg:grid")}>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 lg:contents">
                    <span className={cn("text-[11px] font-semibold uppercase tracking-[0.06em] lg:text-xs", item.late ? "text-destructive" : item.kind === "Visite" ? "text-warning-foreground" : item.kind === "Relance" ? "text-accent" : "text-[hsl(72_19%_23%)]")}>{item.kind}</span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-semibold leading-snug lg:whitespace-normal">{item.name}</span>
                      {item.detail && <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground lg:line-clamp-none">{item.detail}</span>}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1.5 lg:gap-2">
                    {item.phone && (
                      <>
                        <a href={telHref(item.phone)} aria-label={`Appeler ${item.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-[hsl(72_19%_23%)] lg:h-10 lg:w-10 lg:rounded-md"><Phone size={18} strokeWidth={1.7} aria-hidden="true" /></a>
                        <a href={whatsappHref(item.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${item.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-whatsapp text-white lg:h-10 lg:w-10 lg:rounded-md"><MessageCircle size={18} strokeWidth={1.7} aria-hidden="true" /></a>
                      </>
                    )}
                    {item.action.to ? (
                      <Link to={item.action.to} aria-label={`${item.action.label} : ${item.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white lg:flex lg:h-10 lg:w-auto lg:rounded-md lg:px-3.5 lg:text-[13px] lg:font-semibold">
                        <ChevronRight size={20} aria-hidden="true" className="lg:hidden" /><span className="hidden lg:inline">{item.action.label}</span>
                      </Link>
                    ) : (
                      <button type="button" onClick={item.action.run} aria-label={`${item.action.label} : ${item.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white lg:flex lg:h-10 lg:w-auto lg:rounded-md lg:px-3.5 lg:text-[13px] lg:font-semibold">
                        <Check size={20} aria-hidden="true" className="lg:hidden" /><span className="hidden lg:inline">{item.action.label}</span>
                      </button>
                    )}
                  </span>
                </li>
              ))}
              {todo.length > TODO_PREVIEW && (
                <li className="border-t border-[hsl(25_38%_90%)] bg-card lg:hidden">
                  <button type="button" onClick={() => setShowAllTodo((v) => !v)} className="flex min-h-11 w-full items-center justify-center text-sm font-semibold text-primary">
                    {showAllTodo ? "Réduire" : `Tout afficher (${todo.length})`}
                  </button>
                </li>
              )}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-4 lg:gap-5">
          {/* Fiches à compléter */}
          {view.incomplete.length > 0 && (
            <section aria-labelledby="incomplete-title" className="overflow-hidden rounded-[10px] border border-border bg-card">
              <h2 id="incomplete-title" className="m-0">
                <button type="button" onClick={() => setShowIncomplete((v) => !v)} aria-expanded={showIncomplete} className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-2 text-left lg:px-5">
                  <span className="flex flex-col">
                    <span className="font-serif text-[22px] font-semibold leading-tight">Fiches à compléter</span>
                    <span className="text-xs font-normal text-muted-foreground">Meilleur affichage et meilleur référencement</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CountBadge count={view.incomplete.length} />
                    <ChevronRight size={18} aria-hidden="true" className={cn("text-muted-foreground transition-transform", showIncomplete && "rotate-90")} />
                  </span>
                </button>
              </h2>
              {showIncomplete && (
                <ul className="m-0 list-none p-0">
                  {view.incomplete.map(({ bien, missing }) => (
                    <li key={bien.id} className="border-t border-border">
                      <Link to={`${BASE}/biens?edit=${bien.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted active:bg-muted lg:px-5">
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="truncate text-[15px] font-semibold leading-snug">{bien.titre}</span>
                          <span className="flex flex-wrap gap-1">
                            {missing.map((m) => <span key={m} className="rounded bg-[hsl(38_45%_92%)] px-1.5 py-0.5 text-[11px] font-medium text-warning-foreground">{m}</span>)}
                          </span>
                        </span>
                        <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Derniers biens modifiés */}
          <section aria-labelledby="recent-biens" className="overflow-hidden rounded-[10px] border border-border bg-card">
            <div className="flex items-center justify-between px-4 pt-1 lg:px-5">
              <SectionTitle id="recent-biens">Derniers biens</SectionTitle>
              <Link to={`${BASE}/biens`} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Tous<ChevronRight size={16} aria-hidden="true" /></Link>
            </div>
            {data.biens.length === 0 && <p className="m-0 border-t border-border p-6 text-center text-sm text-muted-foreground">Aucun bien pour l’instant.</p>}
            {data.biens.slice(0, 3).map((bien) => (
              <Link key={bien.id} to={`${BASE}/biens?edit=${bien.id}`} className="flex items-center gap-3 border-t border-border px-4 py-2.5 hover:bg-muted active:bg-muted lg:px-5">
                <span className="h-12 w-14 shrink-0 overflow-hidden rounded bg-[hsl(38_30%_91%)]">
                  {bien.photo_principale ? <OptimizedImage src={bien.photo_principale} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /> : <Home size={18} className="m-auto mt-[15px] text-muted-foreground" aria-hidden="true" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold leading-snug">{bien.titre}</span>
                  <span className="text-[13px] text-muted-foreground">{mainPrice(bien)}</span>
                </span>
                <StatusBadge tone={STATUT_TONE[bien.statut] ?? "warning"}>{bien.statut === "vendu-loue" ? "Loué / vendu" : STATUT_LABELS[bien.statut] ?? "Brouillon"}</StatusBadge>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
