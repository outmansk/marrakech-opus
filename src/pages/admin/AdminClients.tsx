import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, LayoutGrid, Link2, List, Mail, MessageCircle, Pencil, Phone, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProperties } from "@/hooks/useBiens";
import type { Bien, BienService } from "@/types/property";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import OptimizedImage from "@/components/ui/OptimizedImage";
import LeadTasks from "@/components/admin/LeadTasks";
import { CountBadge } from "@/components/admin/StatusBadge";
import { EmptyState, PageHeader, SelectField } from "@/components/admin/ui";
import { btn, field } from "@/components/admin/styles";
import { endOfToday } from "@/hooks/useAdminCounts";
import { LEAD_LABELS, TYPE_LABELS, formatPrix, type LeadStatus } from "@/lib/labels";
import { telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Furnishing = "any" | "furnished" | "unfurnished";
type Transaction = "location-longue-duree" | "location-courte-duree" | "vente";
type ClientLead = {
  id: string; name: string; phone: string; email: string | null; source: string; transaction_type: Transaction;
  property_types: string[]; budget_min: number | null; budget_max: number | null; preferred_areas: string[];
  bedrooms_min: number | null; furnishing: Furnishing; available_from: string | null; reference_location: string | null;
  max_distance_km: number | null; profession: string | null; client_profile: string | null; status: LeadStatus;
  next_follow_up_at: string | null; notes: string | null; created_at: string;
};
type LeadForm = Omit<ClientLead, "id" | "created_at"> & { areas_text: string };

const STAGES: LeadStatus[] = ["nouveau", "contacte", "qualification", "visite", "negociation", "converti", "perdu"];
const STAGE_COLOR: Record<LeadStatus, string> = {
  nouveau: "bg-accent", contacte: "bg-[hsl(39_68%_45%)]", qualification: "bg-bronze", visite: "bg-primary",
  negociation: "bg-[hsl(72_19%_23%)]", converti: "bg-[hsl(100_32%_36%)]", perdu: "bg-[hsl(2_17%_59%)]",
};
const SOURCES = ["WhatsApp", "Facebook", "Instagram", "Mubawab", "Site web", "Recommandation", "Agence partenaire", "Autre"];
const PROJECTS: Record<Transaction, string> = { "location-longue-duree": "Location longue durée", vente: "Achat", "location-courte-duree": "Séjour courte durée" };
const FURNISHING: Record<Furnishing, string> = { any: "Indifférent", furnished: "Meublé", unfurnished: "Non meublé" };

const blankLead: LeadForm = {
  name: "", phone: "", email: "", source: "WhatsApp", transaction_type: "location-longue-duree", property_types: [],
  budget_min: null, budget_max: null, preferred_areas: [], areas_text: "", bedrooms_min: null, furnishing: "any",
  available_from: null, reference_location: "", max_distance_km: null, profession: "", client_profile: "",
  status: "nouveau", next_follow_up_at: null, notes: "",
};

const priceOf = (p: Bien, t: Transaction) => (t === "vente" ? p.prix_vente ?? p.prix : t === "location-courte-duree" ? p.prix_location_courte ?? p.prix : p.prix_location_longue ?? p.prix);
const priceText = (p: Bien, t: Transaction) => formatPrix(priceOf(p, t), p.devise, t);
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function budgetText(l: Pick<ClientLead, "budget_min" | "budget_max">) {
  if (l.budget_min && l.budget_max) return `${fmt(l.budget_min)} – ${fmt(l.budget_max)} MAD`;
  if (l.budget_max) return `jusqu’à ${fmt(l.budget_max)} MAD`;
  if (l.budget_min) return `dès ${fmt(l.budget_min)} MAD`;
  return null;
}

function matchingProperties(lead: ClientLead, properties: Bien[]) {
  const service = lead.transaction_type as BienService;
  return properties
    .filter((p) => p.statut === "publie")
    .filter((p) => p.services?.includes(service) || p.service === service)
    .filter((p) => !lead.property_types.length || lead.property_types.includes(p.type))
    .filter((p) => {
      const price = priceOf(p, lead.transaction_type);
      return price != null && (lead.budget_min == null || price >= lead.budget_min) && (lead.budget_max == null || price <= lead.budget_max);
    })
    .filter((p) => lead.bedrooms_min == null || (p.chambres ?? 0) >= lead.bedrooms_min)
    .filter((p) => !lead.preferred_areas.length || lead.preferred_areas.some((a) => p.quartier?.toLocaleLowerCase().includes(a.toLocaleLowerCase())))
    .filter((p) => lead.furnishing === "any" || (p.equipements ?? []).some((e) => e.toLocaleLowerCase() === "meublé") === (lead.furnishing === "furnished"))
    .slice(0, 6);
}

const isDue = (l: ClientLead) => !!l.next_follow_up_at && new Date(l.next_follow_up_at) <= endOfToday() && !["converti", "perdu"].includes(l.status);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function followUpLabel(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd’hui";
  if (d < today) return `En retard · ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function StageTag({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded border border-border bg-white px-2 text-xs font-semibold", className)}>
      <span className={cn("h-2 w-2 rounded-sm", STAGE_COLOR[status])} aria-hidden="true" />{LEAD_LABELS[status]}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminClients() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [crmMissing, setCrmMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<LeadStatus | "all">("all");
  const [dueOnly, setDueOnly] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<LeadForm | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const { data: properties = [] } = useProperties();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("client_leads").select("*").order("created_at", { ascending: false });
    setCrmMissing(!!error);
    setLeads(((data ?? []) as ClientLead[]).map((l) => ({ ...l, property_types: l.property_types ?? [], preferred_areas: l.preferred_areas ?? [] })));
    setLoading(false);
  }, []);
  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  const opened = leads.find((l) => l.id === openId) ?? null;
  const openNew = () => { setOpenId(null); setEditing({ ...blankLead }); };
  const openLead = (lead: ClientLead) => { setEditing(null); setOpenId(lead.id); };
  const startEdit = (lead: ClientLead) => setEditing({ ...lead, email: lead.email ?? "", areas_text: lead.preferred_areas.join(", "), notes: lead.notes ?? "", profession: lead.profession ?? "", client_profile: lead.client_profile ?? "", reference_location: lead.reference_location ?? "" });

  // Liens directs : ?new=1 ou ?edit=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (searchParams.get("new") === "1") {
      openNew();
      setSearchParams({}, { replace: true });
    } else if (editId && !loading) {
      if (leads.some((l) => l.id === editId)) setOpenId(editId);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, leads]);

  const filtered = useMemo(() => leads.filter((l) => {
    const needle = search.trim().toLocaleLowerCase("fr");
    const hay = `${l.name} ${l.phone} ${l.email ?? ""} ${l.preferred_areas.join(" ")}`.toLocaleLowerCase("fr");
    return (!needle || hay.includes(needle)) && (stage === "all" || l.status === stage) && (!dueOnly || isDue(l));
  }), [leads, search, stage, dueOnly]);
  const dueCount = leads.filter(isDue).length;

  const patchLead = async (lead: ClientLead, patch: Partial<ClientLead>, message?: string) => {
    const before = leads;
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));
    const { error } = await supabase.from("client_leads").update(patch).eq("id", lead.id);
    if (error) {
      setLeads(before);
      toast.error("La modification n’a pas été enregistrée. Réessayez.");
    } else if (message) toast.success(message);
  };

  const saveLead = async (form: LeadForm) => {
    const { areas_text, ...values } = form;
    const payload = {
      ...values,
      email: values.email || null, preferred_areas: areas_text.split(",").map((a) => a.trim()).filter(Boolean),
      budget_min: values.budget_min || null, budget_max: values.budget_max || null, bedrooms_min: values.bedrooms_min ?? null,
      max_distance_km: values.max_distance_km || null, available_from: values.available_from || null,
      next_follow_up_at: values.next_follow_up_at || null, profession: values.profession || null,
      client_profile: values.client_profile || null, reference_location: values.reference_location || null, notes: values.notes || null,
    };
    const existing = openId ? leads.find((l) => l.id === openId) : null;
    const result = existing
      ? await supabase.from("client_leads").update(payload).eq("id", existing.id).select().single()
      : await supabase.from("client_leads").insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (result.error) {
      toast.error("Le dossier n’a pas pu être enregistré. Vérifiez le nom et le téléphone, puis réessayez.");
      return false;
    }
    toast.success(existing ? "Dossier enregistré." : "Client ajouté.");
    await fetchLeads();
    setOpenId((result.data as ClientLead).id);
    setEditing(null);
    return true;
  };

  const copyRequestLink = async () => {
    const link = `${window.location.origin}/demande`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien du formulaire copié.", { description: "Vous pouvez l’envoyer sur WhatsApp, Facebook ou Instagram." });
    } catch {
      window.prompt("Copiez ce lien pour l’envoyer à vos clients :", link);
    }
  };

  const LeadRow = ({ lead }: { lead: ClientLead }) => (
    <button type="button" onClick={() => openLead(lead)} className="flex w-full items-center gap-3 rounded-[10px] border border-border bg-card px-3.5 py-3 text-left hover:border-input">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[hsl(38_33%_91%)] text-sm font-semibold">{initials(lead.name)}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-[15px] font-semibold">{lead.name}</span><StageTag status={lead.status} /></span>
        <span className="truncate text-[13px] text-muted-foreground">{[PROJECTS[lead.transaction_type], lead.property_types.map((t) => TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t).join(", "), lead.preferred_areas.join(", ")].filter(Boolean).join(" · ")}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );

  const DueCard = ({ lead }: { lead: ClientLead }) => (
    <li className="flex flex-col rounded-[10px] border border-[hsl(37_55%_76%)] bg-card">
      <button type="button" onClick={() => openLead(lead)} className="flex flex-col gap-1.5 px-3.5 pb-2.5 pt-3.5 text-left">
        <span className="flex items-center justify-between gap-2"><span className="text-base font-semibold">{lead.name}</span><StageTag status={lead.status} /></span>
        <span className="text-sm font-medium text-[hsl(36_8%_21%)]">{PROJECTS[lead.transaction_type]}{lead.property_types.length ? ` · ${lead.property_types.map((t) => TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t).join(", ")}` : ""}</span>
        <span className="text-[13px] text-muted-foreground">{[budgetText(lead), lead.preferred_areas.join(", "), lead.source].filter(Boolean).join(" · ")}</span>
        <span className="text-[13px] font-semibold text-warning-foreground">Relance : {followUpLabel(lead.next_follow_up_at)}</span>
      </button>
      <div className="grid grid-cols-2 gap-2 px-3.5 pb-3.5">
        <a href={telHref(lead.phone)} className={btn.soft}><Phone size={17} aria-hidden="true" />Appeler</a>
        <a href={whatsappHref(lead.phone)} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}><MessageCircle size={17} aria-hidden="true" />WhatsApp</a>
      </div>
    </li>
  );

  const due = filtered.filter(isDue);
  const others = filtered.filter((l) => !isDue(l));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-8 lg:py-7">
      <PageHeader title="Clients & demandes" count={loading ? undefined : leads.length}>
        <button type="button" onClick={() => void copyRequestLink()} className={btn.outline}><Link2 size={18} aria-hidden="true" /><span className="lg:hidden">Lien du formulaire</span><span className="hidden lg:inline">Copier le lien du formulaire public</span></button>
        <button type="button" onClick={openNew} className={cn(btn.primary, "hidden lg:inline-flex")}><Plus size={18} aria-hidden="true" />Nouveau client</button>
      </PageHeader>

      {crmMissing && (
        <div role="alert" className="rounded-[10px] border border-[hsl(37_55%_76%)] bg-warning p-4 text-sm text-warning-foreground">
          Le fichier clients n’est pas encore activé sur votre base Supabase. Appliquez la migration « client_leads » du projet, puis rechargez la page.
        </div>
      )}

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 lg:max-w-[400px]">
          <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, téléphone, quartier…" aria-label="Rechercher un client" className="min-w-0 flex-1 bg-transparent text-base outline-none lg:text-sm" />
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:flex">
          <SelectField label="Étape" value={stage} onChange={(v) => setStage(v as LeadStatus | "all")} className={cn("lg:w-[210px]", view === "kanban" && "lg:hidden")}>
            <option value="all">Toutes les étapes</option>
            {STAGES.map((s) => <option key={s} value={s}>{LEAD_LABELS[s]}</option>)}
          </SelectField>
          <button type="button" aria-pressed={dueOnly} onClick={() => setDueOnly((v) => !v)} className={cn("inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-semibold", dueOnly ? "border-warning-foreground bg-warning-foreground text-white" : "border-[hsl(37_55%_76%)] bg-warning text-warning-foreground")}>
            À relancer<span className="-ml-1 hidden lg:inline">aujourd’hui</span><CountBadge count={dueCount} className="h-5 min-w-5 text-[11px]" />
          </button>
        </div>
        <div role="group" aria-label="Affichage" className="ml-auto hidden gap-1 rounded-lg bg-[hsl(38_33%_91%)] p-1 lg:flex">
          <button type="button" aria-pressed={view === "kanban"} onClick={() => setView("kanban")} className={cn("inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px]", view === "kanban" ? "bg-white font-semibold shadow-sm" : "font-medium")}><LayoutGrid size={15} aria-hidden="true" />Kanban</button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={cn("inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px]", view === "list" ? "bg-white font-semibold shadow-sm" : "font-medium")}><List size={15} aria-hidden="true" />Liste</button>
        </div>
      </div>

      {loading && <div className="flex flex-col gap-2.5" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[10px] border border-border bg-card" />)}</div>}
      {!loading && !crmMissing && leads.length === 0 && (
        <EmptyState title="Votre fichier clients commence ici" text="Ajoutez les coordonnées et les critères d’un client : les biens publiés qui correspondent s’afficheront dans sa fiche. Vous pouvez aussi partager le formulaire public." action={<button type="button" onClick={openNew} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter un client</button>} />
      )}
      {!loading && leads.length > 0 && filtered.length === 0 && <EmptyState title="Aucun client ne correspond" text="Essayez un autre mot ou retirez un filtre." />}

      {!loading && filtered.length > 0 && (
        <>
          {/* Liste (mobile, et desktop en mode liste) */}
          <div className={cn("flex flex-col gap-2.5", view === "kanban" && "lg:hidden")}>
            {due.length > 0 && <h2 className="m-0 mt-1 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-warning-foreground">À relancer aujourd’hui</h2>}
            {due.length > 0 && <ul className="m-0 grid list-none gap-2.5 p-0 lg:grid-cols-2">{due.map((l) => <DueCard key={l.id} lead={l} />)}</ul>}
            {others.length > 0 && due.length > 0 && <h2 className="m-0 mt-3 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Tous les clients</h2>}
            <div className="grid gap-2.5 lg:grid-cols-2">{others.map((l) => <LeadRow key={l.id} lead={l} />)}</div>
          </div>

          {/* Kanban (desktop) */}
          {view === "kanban" && (
            <div className="hidden grid-cols-7 gap-2.5 lg:grid">
              {STAGES.map((s) => {
                const col = filtered.filter((l) => l.status === s);
                return (
                  <section key={s} aria-label={LEAD_LABELS[s]} onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { const l = leads.find((x) => x.id === dragId); if (l && l.status !== s) void patchLead(l, { status: s }, `${l.name} → ${LEAD_LABELS[s]}`); setDragId(null); }}
                    className={cn("flex min-h-[420px] min-w-0 flex-col gap-2 rounded-[10px] bg-[hsl(38_38%_93%)] p-2.5", dragId && "outline-dashed outline-1 outline-[hsl(35_20%_66%)]")}>
                    <h2 className="m-0 flex items-center gap-2 px-1 pb-1 pt-0.5 font-sans text-[13px] font-semibold">
                      <span className={cn("h-2 w-2 rounded-sm", STAGE_COLOR[s])} aria-hidden="true" /><span className="flex-1">{LEAD_LABELS[s]}</span><span className="font-medium text-muted-foreground">{col.length}</span>
                    </h2>
                    {col.map((l) => (
                      <button key={l.id} type="button" draggable onDragStart={() => setDragId(l.id)} onDragEnd={() => setDragId(null)} onClick={() => openLead(l)}
                        className={cn("flex cursor-grab flex-col gap-1.5 rounded-lg border bg-card p-2.5 text-left shadow-[0_1px_2px_rgba(33,31,27,0.05)] hover:border-input", isDue(l) ? "border-[hsl(37_55%_76%)]" : "border-border", dragId === l.id && "opacity-50")}>
                        <span className="text-sm font-semibold leading-tight">{l.name}</span>
                        <span className="text-xs leading-snug text-[hsl(36_8%_21%)]">{PROJECTS[l.transaction_type]}{l.preferred_areas.length ? ` · ${l.preferred_areas.join(", ")}` : ""}</span>
                        {budgetText(l) && <span className="text-xs font-medium text-muted-foreground">{budgetText(l)}</span>}
                        {isDue(l) && <span className="self-start rounded bg-warning px-2 py-1 text-[11px] font-semibold text-warning-foreground">Relance aujourd’hui</span>}
                      </button>
                    ))}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      <ClientSheet
        lead={opened}
        form={editing}
        properties={properties}
        onClose={() => { setOpenId(null); setEditing(null); }}
        onEdit={() => opened && startEdit(opened)}
        onCancelEdit={() => (opened ? setEditing(null) : (setEditing(null), setOpenId(null)))}
        onSave={saveLead}
        onPatch={patchLead}
      />
    </div>
  );
}

// ─── Fiche client ──────────────────────────────────────────────────────────────
function ClientSheet({ lead, form, properties, onClose, onEdit, onCancelEdit, onSave, onPatch }: {
  lead: ClientLead | null; form: LeadForm | null; properties: Bien[];
  onClose: () => void; onEdit: () => void; onCancelEdit: () => void;
  onSave: (form: LeadForm) => Promise<boolean>; onPatch: (lead: ClientLead, patch: Partial<ClientLead>, message?: string) => Promise<void>;
}) {
  const open = !!lead || !!form;
  const matches = useMemo(() => (lead ? matchingProperties(lead, properties) : []), [lead, properties]);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => setSelected(matches.slice(0, 3).map((m) => m.id)), [matches]);

  const sendMatches = () => {
    if (!lead) return;
    const chosen = matches.filter((m) => selected.includes(m.id));
    const first = lead.name.split(" ")[0];
    const list = chosen.map((p) => `• ${[p.titre, p.quartier, p.chambres ? `${p.chambres} chambres` : null, priceText(p, lead.transaction_type)].filter(Boolean).join(" · ")}\n${window.location.origin}/bien/${p.id}`).join("\n\n");
    const message = chosen.length ? `Bonjour ${first}, voici des biens qui correspondent à votre recherche :\n\n${list}\n\nDites-moi lesquels vous intéressent pour organiser une visite.` : `Bonjour ${first}, je reviens vers vous au sujet de votre recherche immobilière.`;
    window.open(whatsappHref(lead.phone, message), "_blank", "noopener,noreferrer");
  };

  const postpone = (days: number) => {
    if (!lead) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(10, 0, 0, 0);
    void onPatch(lead, { next_follow_up_at: d.toISOString() }, `Relance reportée au ${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}.`);
  };

  const details = lead ? [
    ["Projet", PROJECTS[lead.transaction_type]],
    ["Types de bien", lead.property_types.map((t) => TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t).join(", ") || "Indifférent"],
    ["Budget", budgetText(lead) ?? "Non précisé"],
    ["Quartiers", lead.preferred_areas.join(", ") || "Indifférent"],
    ["Chambres min.", lead.bedrooms_min != null ? String(lead.bedrooms_min) : "—"],
    ["Meublé", FURNISHING[lead.furnishing ?? "any"]],
    ["Disponible le", lead.available_from ? new Date(lead.available_from).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"],
    ["Lieu de référence", lead.reference_location ? `${lead.reference_location}${lead.max_distance_km ? ` · ${lead.max_distance_km} km max.` : ""}` : "—"],
    ["Téléphone", lead.phone],
    ["E-mail", lead.email || "—"],
    ["Profession", lead.profession || "—"],
    ["Profil", lead.client_profile || "—"],
  ] : [];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex h-[100dvh] w-full max-w-none flex-col gap-0 border-border bg-background p-0 sm:max-w-none lg:w-[640px] [&>button]:hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-1.5 lg:px-5 lg:py-3">
          <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="grid h-11 w-11 place-items-center rounded-md hover:bg-muted"><X size={22} aria-hidden="true" /></button>
          <SheetTitle className="flex-1 truncate font-sans text-[15px] font-semibold">{form ? (lead ? "Modifier le dossier" : "Nouveau client") : "Fiche client"}</SheetTitle>
          <SheetDescription className="sr-only">Coordonnées, critères de recherche et biens correspondants.</SheetDescription>
          {lead && !form && <button type="button" onClick={onEdit} className="inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-primary hover:bg-muted"><Pencil size={16} aria-hidden="true" />Modifier</button>}
        </header>

        {form ? (
          <LeadEditor initial={form} onCancel={onCancelEdit} onSave={onSave} />
        ) : lead && (
          <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 lg:px-6">
            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-semibold text-[hsl(72_19%_23%)]">{initials(lead.name)}</span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="m-0 font-serif text-[28px] font-semibold leading-none">{lead.name}</h2>
                    <span className="text-[13px] text-muted-foreground">Source : {lead.source}{lead.profession ? ` · ${lead.profession}` : ""}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <a href={telHref(lead.phone)} className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg bg-primary-soft text-[13px] font-semibold text-[hsl(72_19%_23%)]"><Phone size={20} strokeWidth={1.7} aria-hidden="true" />Appeler</a>
                  <a href={whatsappHref(lead.phone)} target="_blank" rel="noopener noreferrer" className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg bg-whatsapp text-[13px] font-semibold text-white"><MessageCircle size={20} strokeWidth={1.7} aria-hidden="true" />WhatsApp</a>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[13px] font-semibold"><Mail size={20} strokeWidth={1.7} aria-hidden="true" />E-mail</a>
                  ) : (
                    <span className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-[13px] font-medium text-muted-foreground"><Mail size={20} strokeWidth={1.7} aria-hidden="true" />Pas d’e-mail</span>
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
                <div className="flex flex-col gap-1.5">
                  <span className={field.label}>Étape</span>
                  <SelectField label="Étape" value={lead.status} onChange={(v) => void onPatch(lead, { status: v as LeadStatus }, `Étape : ${LEAD_LABELS[v as LeadStatus]}.`)}>
                    {STAGES.map((s) => <option key={s} value={s}>{LEAD_LABELS[s]}</option>)}
                  </SelectField>
                </div>
                <div className={cn("flex flex-wrap items-center justify-between gap-2.5 rounded-lg p-3", isDue(lead) ? "bg-warning" : "bg-[hsl(38_45%_95%)]")}>
                  <span className="flex flex-col gap-0.5">
                    <span className={cn("text-[13px] font-semibold", isDue(lead) ? "text-warning-foreground" : "text-muted-foreground")}>Prochaine relance</span>
                    <span className="text-[15px] font-semibold first-letter:uppercase">{followUpLabel(lead.next_follow_up_at) ?? "Aucune prévue"}</span>
                  </span>
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => postpone(1)} className={cn(btn.outline, "h-10 bg-white px-3 text-[13px]")}>Demain</button>
                    <button type="button" onClick={() => postpone(7)} className={cn(btn.outline, "h-10 bg-white px-3 text-[13px]")}>Dans 1 semaine</button>
                  </span>
                </div>
              </section>

              <LeadTasks leadId={lead.id} />

              <section className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="m-0 font-serif text-[22px] font-semibold">Biens correspondants</h3>
                  <span className="text-[13px] font-semibold text-muted-foreground">{matches.length} trouvé{matches.length > 1 ? "s" : ""}</span>
                </div>
                {matches.length === 0 && <p className="m-0 rounded-[10px] border border-dashed border-input p-4 text-sm text-muted-foreground">Aucun bien publié ne correspond à ces critères pour le moment. Élargissez le budget ou les quartiers pour voir plus de biens.</p>}
                {matches.map((p) => {
                  const on = selected.includes(p.id);
                  return (
                    <label key={p.id} className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] border bg-card p-2.5", on ? "border-primary" : "border-border")}>
                      <input type="checkbox" checked={on} onChange={() => setSelected((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))} className="h-[22px] w-[22px] shrink-0 accent-[hsl(70_19%_34%)]" aria-label={`Sélectionner ${p.titre}`} />
                      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[hsl(38_30%_91%)]">{p.photo_principale && <OptimizedImage src={p.photo_principale} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />}</span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-serif text-base font-semibold leading-tight">{p.titre}</span>
                        <span className="text-[13px] font-semibold">{priceText(p, lead.transaction_type)}</span>
                        <span className="text-xs text-muted-foreground">{[p.quartier, p.chambres ? `${p.chambres} ch.` : null].filter(Boolean).join(" · ")}</span>
                      </span>
                    </label>
                  );
                })}
                <button type="button" onClick={sendMatches} className={cn(btn.whatsapp, "h-12 text-[15px]")}>
                  <MessageCircle size={18} aria-hidden="true" />{selected.length ? `Envoyer ${selected.length} bien${selected.length > 1 ? "s" : ""} sur WhatsApp` : "Écrire sur WhatsApp"}
                </button>
              </section>

              <section className="rounded-[10px] border border-border bg-card">
                <h3 className="m-0 px-4 pb-1.5 pt-3.5 font-serif text-[22px] font-semibold">Recherche</h3>
                <dl className="m-0">
                  {details.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[130px_minmax(0,1fr)] gap-2.5 border-t border-[hsl(37_32%_90%)] px-4 py-2.5">
                      <dt className="text-[13px] text-muted-foreground">{k}</dt><dd className="m-0 text-sm font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {lead.notes && (
                <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
                  <h3 className="m-0 font-serif text-[22px] font-semibold">Notes</h3>
                  <p className="m-0 whitespace-pre-line text-sm leading-relaxed text-[hsl(36_8%_21%)]">{lead.notes}</p>
                </section>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Édition d'un dossier ────────────────────────────────────────────────────
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("flex flex-col gap-1.5", className)}><span className={field.label}>{label}</span>{children}</label>;
}

function LeadEditor({ initial, onCancel, onSave }: { initial: LeadForm; onCancel: () => void; onSave: (form: LeadForm) => Promise<boolean> }) {
  const [form, setForm] = useState<LeadForm>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const up = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const numOrNull = (v: string) => (v ? Number(v.replace(/\s/g, "")) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { name: form.name.trim() ? undefined : "Indiquez le nom du client.", phone: form.phone.trim() ? undefined : "Indiquez un numéro de téléphone." };
    setErrors(errs);
    if (errs.name || errs.phone) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 lg:px-6">
        <div className="flex flex-col gap-4">
          <section className="grid gap-3.5 rounded-[10px] border border-border bg-card p-4 sm:grid-cols-2">
            <h3 className="m-0 font-serif text-[22px] font-semibold sm:col-span-2">Contact</h3>
            <Field label="Nom complet">
              <input value={form.name} onChange={(e) => up("name", e.target.value)} className={cn(field.input, errors.name && "border-destructive")} />
              {errors.name && <span className="text-xs font-medium text-destructive">{errors.name}</span>}
            </Field>
            <Field label="Téléphone / WhatsApp">
              <input type="tel" value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="+212 6…" className={cn(field.input, errors.phone && "border-destructive")} />
              {errors.phone && <span className="text-xs font-medium text-destructive">{errors.phone}</span>}
            </Field>
            <Field label="E-mail"><input type="email" value={form.email ?? ""} onChange={(e) => up("email", e.target.value)} className={field.input} /></Field>
            <Field label="Source du contact"><SelectField label="Source" value={form.source} onChange={(v) => up("source", v)}>{SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}</SelectField></Field>
            <Field label="Profession"><input value={form.profession ?? ""} onChange={(e) => up("profession", e.target.value)} className={field.input} /></Field>
            <Field label="Profil / foyer"><input value={form.client_profile ?? ""} onChange={(e) => up("client_profile", e.target.value)} placeholder="Famille, couple, salarié…" className={field.input} /></Field>
          </section>

          <section className="grid gap-3.5 rounded-[10px] border border-border bg-card p-4 sm:grid-cols-2">
            <h3 className="m-0 font-serif text-[22px] font-semibold sm:col-span-2">Ce que le client cherche</h3>
            <Field label="Projet" className="sm:col-span-2"><SelectField label="Projet" value={form.transaction_type} onChange={(v) => up("transaction_type", v as Transaction)}>{(Object.keys(PROJECTS) as Transaction[]).map((t) => <option key={t} value={t}>{PROJECTS[t]}</option>)}</SelectField></Field>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <span className={field.label}>Types de bien</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TYPE_LABELS).map(([v, l]) => {
                  const on = form.property_types.includes(v);
                  return <button key={v} type="button" aria-pressed={on} onClick={() => up("property_types", on ? form.property_types.filter((t) => t !== v) : [...form.property_types, v])} className={cn("min-h-11 rounded-full border px-4 text-sm font-medium", on ? "border-primary bg-primary-soft text-[hsl(72_19%_23%)]" : "border-input bg-white")}>{on ? "✓ " : ""}{l}</button>;
                })}
              </div>
            </div>
            <Field label="Budget minimum (MAD)"><input inputMode="numeric" value={form.budget_min ?? ""} onChange={(e) => up("budget_min", numOrNull(e.target.value))} className={field.input} /></Field>
            <Field label="Budget maximum (MAD)"><input inputMode="numeric" value={form.budget_max ?? ""} onChange={(e) => up("budget_max", numOrNull(e.target.value))} className={field.input} /></Field>
            <Field label="Quartiers (séparés par des virgules)" className="sm:col-span-2"><input value={form.areas_text} onChange={(e) => up("areas_text", e.target.value)} placeholder="Gueliz, Hivernage…" className={field.input} /></Field>
            <Field label="Chambres minimum"><input inputMode="numeric" value={form.bedrooms_min ?? ""} onChange={(e) => up("bedrooms_min", numOrNull(e.target.value))} className={field.input} /></Field>
            <Field label="Meublé"><SelectField label="Meublé" value={form.furnishing} onChange={(v) => up("furnishing", v as Furnishing)}>{(Object.keys(FURNISHING) as Furnishing[]).map((f) => <option key={f} value={f}>{FURNISHING[f]}</option>)}</SelectField></Field>
            <Field label="Disponible à partir du"><input type="date" value={form.available_from ?? ""} onChange={(e) => up("available_from", e.target.value || null)} className={field.input} /></Field>
            <Field label="Distance maximale (km)"><input inputMode="numeric" value={form.max_distance_km ?? ""} onChange={(e) => up("max_distance_km", numOrNull(e.target.value))} className={field.input} /></Field>
            <Field label="Lieu de référence" className="sm:col-span-2"><input value={form.reference_location ?? ""} onChange={(e) => up("reference_location", e.target.value)} placeholder="Travail, école…" className={field.input} /></Field>
          </section>

          <section className="grid gap-3.5 rounded-[10px] border border-border bg-card p-4 sm:grid-cols-2">
            <h3 className="m-0 font-serif text-[22px] font-semibold sm:col-span-2">Suivi</h3>
            <Field label="Étape"><SelectField label="Étape" value={form.status} onChange={(v) => up("status", v as LeadStatus)}>{STAGES.map((s) => <option key={s} value={s}>{LEAD_LABELS[s]}</option>)}</SelectField></Field>
            <Field label="Prochaine relance"><input type="datetime-local" value={form.next_follow_up_at ? form.next_follow_up_at.slice(0, 16) : ""} onChange={(e) => up("next_follow_up_at", e.target.value ? new Date(e.target.value).toISOString() : null)} className={field.input} /></Field>
            <Field label="Notes" className="sm:col-span-2"><textarea rows={4} value={form.notes ?? ""} onChange={(e) => up("notes", e.target.value)} placeholder="Préférences, historique des échanges…" className={cn(field.input, "h-auto py-2.5 leading-relaxed")} /></Field>
          </section>
        </div>
      </div>
      <footer className="flex shrink-0 gap-2 border-t border-border bg-card px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:px-6">
        <button type="button" onClick={onCancel} className={cn(btn.outline, "h-12 flex-1 lg:h-11 lg:flex-none")}>Annuler</button>
        <button type="submit" disabled={saving} className={cn(btn.primary, "h-12 flex-[2] lg:h-11 lg:flex-none lg:px-6")}>{saving ? "Enregistrement…" : "Enregistrer le dossier"}</button>
      </footer>
    </form>
  );
}
