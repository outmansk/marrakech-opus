import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Home, MessageCircle, PenLine, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Bien } from "@/types/property";
import type { Article } from "@/types/article";
import OptimizedImage from "@/components/ui/OptimizedImage";
import StatusBadge, { CountBadge } from "@/components/admin/StatusBadge";
import { endOfToday } from "@/hooks/useAdminCounts";
import { HBarChart, SectionTitle } from "@/components/admin/charts";
import { useSocialData } from "@/hooks/useSocial";
import { fromOrigin } from "@/lib/social/model";
import { pendingTooLong, rentedStillOnline } from "@/lib/social/stats";
import { telHref, whatsappHref } from "@/lib/contact";
import { TACHE_TYPE, echeanceLabel, isLate, type Contact, type Tache } from "@/lib/agenda";
import {
  LEAD_LABELS,
  SERVICE_SHORT_LABELS,
  STATUT_LABELS,
  STATUT_TONE,
  TYPE_LABELS,
  mainPrice,
  visitStatus,
  type LeadStatus,
} from "@/lib/labels";

const BASE = "/manage-xk92p";

type Visit = { id: string; client_name: string; client_phone: string; requested_date: string; status: string; property_v2_id: string | null; created_at: string };
type Lead = {
  id: string; name: string; phone: string; status: LeadStatus; next_follow_up_at: string | null; created_at: string;
  transaction_type: string; budget_min: number | null; budget_max: number | null; preferred_areas: string[] | null;
};

const PROJECT_LABELS: Record<string, string> = { "location-longue-duree": "Location longue", "location-courte-duree": "Séjour", vente: "Achat" };

function useDashboardData() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [biens, articles, visits, leads, taches, contacts, messages] = await Promise.all([
        supabase.from("properties_v2").select("*").order("updated_at", { ascending: false }),
        supabase.from("articles").select("*").order("created_at", { ascending: false }),
        supabase.from("visit_requests").select("id, client_name, client_phone, requested_date, status, property_v2_id, created_at").order("requested_date", { ascending: true }),
        supabase.from("client_leads").select("id, name, phone, status, next_follow_up_at, created_at, transaction_type, budget_min, budget_max, preferred_areas").order("created_at", { ascending: false }),
        supabase.from("taches").select("*").eq("fait", false).not("echeance", "is", null).lte("echeance", endOfToday().toISOString()).order("echeance"),
        supabase.from("contacts").select("id, nom, telephone"),
        supabase.from("contact_messages").select("id, name, phone, message, created_at").eq("traite", false).order("created_at", { ascending: false }),
      ]);
      if (biens.error) throw biens.error;
      return {
        biens: (biens.data ?? []) as Bien[],
        articles: (articles.data ?? []) as Article[],
        visits: (visits.data ?? []) as Visit[],
        // Le CRM peut ne pas être encore activé : on affiche simplement 0.
        leads: (leads.data ?? []) as Lead[],
        // Idem pour l'agenda.
        taches: (taches.data ?? []) as Tache[],
        contacts: (contacts.data ?? []) as Pick<Contact, "id" | "nom" | "telephone">[],
        messages: (messages.data ?? []) as { id: string; name: string; phone: string | null; message: string; created_at: string }[],
      };
    },
  });
}

function formatVisitDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function budget(lead: Lead) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  if (lead.budget_min && lead.budget_max) return `${fmt(lead.budget_min)} – ${fmt(lead.budget_max)} MAD`;
  if (lead.budget_max) return `jusqu’à ${fmt(lead.budget_max)} MAD`;
  if (lead.budget_min) return `dès ${fmt(lead.budget_min)} MAD`;
  return null;
}

type TodoItem = {
  key: string; kind: string; name: string; detail: string; phone?: string; late?: boolean;
  action: { label: string; to?: string; run?: () => void };
};

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-5 lg:px-10 lg:py-8" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="h-9 w-40 rounded bg-[hsl(38_30%_91%)]" />
      <div className="h-48 rounded-[10px] bg-[hsl(38_30%_93%)]" />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-6 lg:gap-3.5">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[108px] rounded-[10px] border border-border bg-card p-4"><div className="h-3 w-3/4 rounded bg-[hsl(38_30%_91%)]" /><div className="mt-3 h-7 w-1/3 rounded bg-[hsl(38_30%_89%)]" /></div>)}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardData();
  // Réseaux sociaux : vide tant que le SQL de la section n'est pas lancé.
  const { data: social } = useSocialData();
  // Téléphone : liste « À faire » raccourcie et graphiques repliés par défaut.
  const [showAllTodo, setShowAllTodo] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const queryClient = useQueryClient();

  const view = useMemo(() => {
    if (!data) return null;
    const { biens, articles, visits, leads } = data;
    const bienById = new Map(biens.map((b) => [b.id, b]));
    const limit = endOfToday();
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const pending = visits.filter((v) => visitStatus(v.status) === "pending");
    const followUps = leads.filter((l) => l.next_follow_up_at && new Date(l.next_follow_up_at) <= limit && !["converti", "perdu"].includes(l.status));
    const newLeads = leads.filter((l) => l.status === "nouveau");

    const count = <K extends string>(keys: K[]) => keys.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {});
    const byType = Object.entries(count(biens.map((b) => b.type))).map(([k, value]) => ({ name: TYPE_LABELS[k as keyof typeof TYPE_LABELS] ?? k, value })).sort((a, b) => b.value - a.value);
    const byService = Object.entries(count(biens.flatMap((b) => b.services ?? []))).map(([k, value]) => ({ name: SERVICE_SHORT_LABELS[k as keyof typeof SERVICE_SHORT_LABELS] ?? k, value })).sort((a, b) => b.value - a.value);

    return {
      biens, articles, pending, followUps, newLeads, bienById, byType, byService,
      published: biens.filter((b) => b.statut === "publie").length,
      closed: biens.filter((b) => b.statut === "vendu-loue").length,
      newClients: leads.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length,
      publishedArticles: articles.filter((a) => a.est_publie).length,
    };
  }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !view) {
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

  const contactById = new Map(data!.contacts.map((c) => [c.id, c]));
  const todo: TodoItem[] = [
    ...data!.taches.map((t) => {
      const contact = t.contact_id ? contactById.get(t.contact_id) : undefined;
      return {
        key: `t-${t.id}`, kind: TACHE_TYPE[t.type]?.label ?? "Tâche", name: t.titre, phone: contact?.telephone ?? undefined, late: isLate(t),
        detail: [isLate(t) ? `En retard · ${echeanceLabel(t.echeance)}` : echeanceLabel(t.echeance), contact?.nom].filter(Boolean).join(" · "),
        action: { label: "Ouvrir", to: `${BASE}/agenda?edit=${t.id}` },
      };
    }),
    ...(social && !social.missing ? [
      ...rentedStillOnline(social.pubs, social.biens).map(({ bien, pubs }) => ({
        key: `sr-${bien.id}`, kind: "Réseaux", name: bien.titre, late: true,
        detail: `Loué ou vendu, mais ${pubs.length} publication(s) encore en ligne ou en attente : à retirer.`,
        action: { label: "Ouvrir", to: `${BASE}/reseaux/journal?bien=${bien.id}` },
      })),
      ...(() => {
        const pending = pendingTooLong(social.pubs);
        return pending.length ? [{
          key: "sp", kind: "Réseaux", name: `${pending.length} publication(s) en attente`,
          detail: "En attente d’approbation depuis plus de 3 jours : relancez les admins ou retirez-les.",
          action: { label: "Ouvrir", to: `${BASE}/reseaux/journal?statut=en-attente` },
        }] : [];
      })(),
    ] : []),
    ...data!.messages.map((m) => ({
      key: `m-${m.id}`, kind: "Message", name: m.name, phone: m.phone ?? undefined,
      detail: m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message,
      action: { label: "Lire", to: `${BASE}/messages` },
    })),
    ...view.pending.map((v) => ({
      key: `v-${v.id}`, kind: "Visite" as const, name: v.client_name, phone: v.client_phone,
      detail: [view.bienById.get(v.property_v2_id ?? "")?.titre, formatVisitDate(v.requested_date)].filter(Boolean).join(" · "),
      action: { label: "Confirmer", run: () => void confirmVisit(v) },
    })),
    ...view.followUps.map((l) => ({
      key: `f-${l.id}`, kind: "Relance" as const, name: l.name, phone: l.phone,
      detail: [PROJECT_LABELS[l.transaction_type], budget(l), l.preferred_areas?.join(", ")].filter(Boolean).join(" · "),
      action: { label: "Ouvrir la fiche", to: `${BASE}/clients?edit=${l.id}` },
    })),
    ...view.newLeads.filter((l) => !view.followUps.includes(l)).map((l) => ({
      key: `n-${l.id}`, kind: "Nouvelle demande" as const, name: l.name, phone: l.phone,
      detail: [PROJECT_LABELS[l.transaction_type], budget(l), `reçue le ${new Date(l.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`].filter(Boolean).join(" · "),
      action: { label: "Qualifier", to: `${BASE}/clients?edit=${l.id}` },
    })),
  ];

  const kpis = [
    { label: "Biens au total", value: view.biens.length, sub: `${view.published} publiés · ${view.closed} loués ou vendus`, to: `${BASE}/biens` },
    { label: "Visites en attente", value: view.pending.length, sub: "à confirmer", to: `${BASE}/visites`, alert: true },
    { label: "Nouveaux clients", value: view.newClients, sub: "7 derniers jours", to: `${BASE}/clients` },
    { label: "Relances du jour", value: view.followUps.length, sub: "à faire aujourd’hui", to: `${BASE}/clients`, alert: true },
    { label: "Biens publiés", value: view.published, sub: "visibles sur le site", to: `${BASE}/biens` },
    { label: "Articles publiés", value: view.publishedArticles, sub: `sur ${view.articles.length} articles`, to: `${BASE}/blog` },
    ...(() => {
      if (!social || social.missing) return [];
      const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const pubs = social.pubs.filter((p) => new Date(p.publie_le).getTime() >= weekAgo).length;
      const clients = social.leads.filter((l) => fromOrigin(l) && new Date(l.created_at).getTime() >= weekAgo).length;
      return [{ label: "Réseaux sociaux", value: pubs, sub: `publications en 7 jours · ${clients} client${clients > 1 ? "s" : ""}`, to: `${BASE}/reseaux` }];
    })(),
  ];

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hour = new Date().getHours();

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pb-28 pt-4 lg:gap-7 lg:px-10 lg:py-8">
      {/* En-tête */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-baseline justify-between gap-3 lg:flex-col lg:items-start lg:gap-1">
          <span className="order-2 text-[13px] font-medium text-muted-foreground first-letter:uppercase lg:order-1 lg:text-sm">{today}</span>
          <h1 className="order-1 m-0 font-serif text-[26px] font-semibold leading-tight lg:order-2 lg:text-[38px]">{hour >= 18 ? "Bonsoir" : "Bonjour"}</h1>
        </div>
        {/* Sur téléphone, le bouton « + » flottant propose déjà ces actions. */}
        <div className="hidden gap-2.5 lg:flex">
          <Link to={`${BASE}/biens?new=1`} className="flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-[18px] text-sm font-semibold text-white hover:bg-[hsl(70_19%_28%)] lg:order-2 lg:h-11">
            <Plus size={18} strokeWidth={1.9} aria-hidden="true" />Ajouter un bien
          </Link>
          <Link to={`${BASE}/blog?new=1`} className="flex h-12 items-center justify-center gap-2 rounded-md border border-input bg-card px-[18px] text-sm font-semibold hover:bg-muted lg:order-1 lg:h-11">
            <PenLine size={18} strokeWidth={1.7} aria-hidden="true" />Nouvel article
          </Link>
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-5">
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
                <li key={item.key} className={cn("flex items-center gap-3 border-t border-[hsl(25_38%_90%)] bg-card px-4 py-2.5 lg:grid lg:grid-cols-[130px_minmax(0,1fr)_auto] lg:gap-4 lg:px-5 lg:py-3", !showAllTodo && index >= 4 && "hidden lg:grid")}>
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
              {todo.length > 4 && (
                <li className="border-t border-[hsl(25_38%_90%)] bg-card lg:hidden">
                  <button type="button" onClick={() => setShowAllTodo((v) => !v)} className="flex min-h-11 w-full items-center justify-center text-sm font-semibold text-primary">
                    {showAllTodo ? "Réduire" : `Tout afficher (${todo.length})`}
                  </button>
                </li>
              )}
            </ul>
          )}
        </section>

        {/* Indicateurs */}
        <section aria-label="Indicateurs" className={cn("grid grid-cols-3 gap-2 lg:col-span-2 lg:row-start-1 lg:gap-3.5", kpis.length > 6 ? "lg:grid-cols-7" : "lg:grid-cols-6")}>
          {kpis.map((kpi) => (
            <Link key={kpi.label} to={kpi.to} className="flex min-h-[84px] flex-col justify-between gap-1 rounded-[10px] border border-border bg-card p-2.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] hover:border-input lg:min-h-0 lg:justify-start lg:gap-2 lg:p-4">
              <span className="text-[11px] font-medium leading-tight text-muted-foreground lg:text-[13px] lg:leading-snug">{kpi.label}</span>
              <span className={cn("font-serif text-[26px] font-semibold leading-none lg:text-[36px]", kpi.alert && kpi.value > 0 ? "text-accent" : "text-foreground")}>{kpi.value}</span>
              <span className="hidden text-xs leading-snug text-muted-foreground lg:block">{kpi.sub}</span>
            </Link>
          ))}
        </section>

        {/* Graphiques */}
        <button type="button" onClick={() => setShowCharts((v) => !v)} aria-expanded={showCharts} className="flex min-h-11 items-center justify-between rounded-[10px] border border-border bg-card px-4 text-sm font-semibold lg:hidden">
          Statistiques des biens<ChevronRight size={18} aria-hidden="true" className={cn("transition-transform", showCharts && "rotate-90")} />
        </button>
        <section aria-labelledby="charts-title" className={cn("flex-col gap-3 rounded-[10px] border border-border bg-card p-4 lg:flex lg:p-5", showCharts ? "flex" : "hidden")}>
          <SectionTitle id="charts-title">Biens par type</SectionTitle>
          <HBarChart data={view.byType} color="hsl(70 19% 34%)" label="Nombre de biens par type" />
          <SectionTitle>Biens par service</SectionTitle>
          <HBarChart data={view.byService} color="hsl(25 20% 45%)" label="Nombre de biens par service" />
          <p className="m-0 text-xs text-muted-foreground">Un bien proposé pour plusieurs services compte dans chacun.</p>
        </section>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-5">
        {/* Derniers biens */}
        <section aria-labelledby="recent-biens" className="flex flex-col gap-2.5 lg:gap-0 lg:overflow-hidden lg:rounded-[10px] lg:border lg:border-border lg:bg-card">
          <div className="flex items-center justify-between lg:px-5 lg:py-3">
            <SectionTitle id="recent-biens">Derniers biens</SectionTitle>
            <Link to={`${BASE}/biens`} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Tous les biens<ChevronRight size={16} aria-hidden="true" /></Link>
          </div>
          {view.biens.length === 0 && <p className="m-0 rounded-[10px] border border-dashed border-input p-6 text-center text-sm text-muted-foreground lg:m-5 lg:mt-0">Aucun bien pour l’instant.</p>}
          {view.biens.slice(0, 4).map((bien) => (
            <Link key={bien.id} to={`${BASE}/biens?edit=${bien.id}`} className="flex items-center gap-3 rounded-[10px] border border-border bg-card p-2.5 hover:border-input lg:rounded-none lg:border-0 lg:border-t lg:px-5 lg:py-2.5">
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[hsl(38_30%_91%)] lg:h-[42px] lg:w-14 lg:rounded">
                {bien.photo_principale ? <OptimizedImage src={bien.photo_principale} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /> : <Home size={18} className="m-auto mt-[22px] text-muted-foreground lg:mt-3" aria-hidden="true" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 lg:grid lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center lg:gap-3.5">
                <span className="font-serif text-[17px] font-semibold leading-tight lg:truncate lg:font-sans lg:text-[15px]">{bien.titre}</span>
                <span className="text-[13px] font-medium text-muted-foreground lg:text-sm lg:text-foreground">{mainPrice(bien)}</span>
              </span>
              <StatusBadge tone={STATUT_TONE[bien.statut] ?? "warning"}>{bien.statut === "vendu-loue" ? "Loué / vendu" : STATUT_LABELS[bien.statut] ?? "Brouillon"}</StatusBadge>
            </Link>
          ))}
        </section>

        {/* Derniers articles */}
        <section aria-labelledby="recent-articles" className="flex flex-col gap-2.5 lg:gap-0 lg:overflow-hidden lg:rounded-[10px] lg:border lg:border-border lg:bg-card">
          <div className="flex items-center justify-between lg:px-5 lg:py-3">
            <SectionTitle id="recent-articles">Derniers articles</SectionTitle>
            <Link to={`${BASE}/blog`} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Blog<ChevronRight size={16} aria-hidden="true" /></Link>
          </div>
          {view.articles.length === 0 && <p className="m-0 rounded-[10px] border border-dashed border-input p-6 text-center text-sm text-muted-foreground lg:m-5 lg:mt-0">Aucun article pour l’instant.</p>}
          {view.articles.slice(0, 4).map((article) => (
            <Link key={article.id} to={`${BASE}/blog?edit=${article.id}`} className="flex flex-col gap-1 rounded-[10px] border border-border bg-card px-3.5 py-3 hover:border-input lg:rounded-none lg:border-0 lg:border-t lg:px-5">
              <span className="font-serif text-[17px] font-semibold leading-snug lg:font-sans lg:text-[15px]">{article.title}</span>
              <span className={cn("text-xs", article.est_publie ? "text-muted-foreground" : "text-warning-foreground")}>
                {article.est_publie ? "Publié" : "Brouillon"}{article.category ? ` · ${SERVICE_SHORT_LABELS[article.category as keyof typeof SERVICE_SHORT_LABELS] ?? TYPE_LABELS[article.category as keyof typeof TYPE_LABELS] ?? article.category}` : ""} · {new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

