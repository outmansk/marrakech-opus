import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Home, Link2, MessageCircle, Pencil, Plus, Search, UsersRound } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useProperties } from "@/hooks/useBiens";
import type { Bien, BienService } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

type LeadStatus = "nouveau" | "contacte" | "qualification" | "visite" | "negociation" | "converti" | "perdu";
type Furnishing = "any" | "furnished" | "unfurnished";
type ClientLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  transaction_type: "location-longue-duree" | "vente";
  property_types: string[];
  budget_min: number | null;
  budget_max: number | null;
  preferred_areas: string[];
  bedrooms_min: number | null;
  furnishing: Furnishing;
  available_from: string | null;
  reference_location: string | null;
  max_distance_km: number | null;
  profession: string | null;
  client_profile: string | null;
  status: LeadStatus;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
};

type LeadForm = Omit<ClientLead, "id" | "created_at"> & { areas_text: string; property_types: string[] };

const blankLead: LeadForm = {
  name: "", phone: "", email: "", source: "WhatsApp", transaction_type: "location-longue-duree",
  property_types: [], budget_min: null, budget_max: null, preferred_areas: [], areas_text: "",
  bedrooms_min: null, furnishing: "any", available_from: null, reference_location: "", max_distance_km: null,
  profession: "", client_profile: "", status: "nouveau", next_follow_up_at: null, notes: "",
};

const statusLabels: Record<LeadStatus, string> = {
  nouveau: "Nouveau", contacte: "Contacté", qualification: "À qualifier", visite: "Visite prévue",
  negociation: "Négociation", converti: "Converti", perdu: "Perdu",
};

const statusStyles: Record<LeadStatus, string> = {
  nouveau: "bg-blue-500/10 text-blue-700", contacte: "bg-violet-500/10 text-violet-700",
  qualification: "bg-amber-500/10 text-amber-700", visite: "bg-emerald-500/10 text-emerald-700",
  negociation: "bg-orange-500/10 text-orange-700", converti: "bg-green-600/10 text-green-700",
  perdu: "bg-muted text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  villa: "Villa", appartement: "Appartement", riad: "Riad", maison: "Maison", terrain: "Terrain",
};

const priceOf = (property: Bien, transaction: ClientLead["transaction_type"]) =>
  transaction === "vente" ? (property.prix_vente ?? property.prix) : (property.prix_location_longue ?? property.prix);

function matchingProperties(lead: ClientLead, properties: Bien[]) {
  const service = lead.transaction_type as BienService;
  return properties
    .filter((property) => property.statut === "publie")
    .filter((property) => property.services?.includes(service) || property.service === service)
    .filter((property) => !lead.property_types.length || lead.property_types.includes(property.type))
    .filter((property) => {
      const price = priceOf(property, lead.transaction_type);
      return price != null && (lead.budget_min == null || price >= lead.budget_min) && (lead.budget_max == null || price <= lead.budget_max);
    })
    .filter((property) => lead.bedrooms_min == null || (property.chambres ?? 0) >= lead.bedrooms_min)
    .filter((property) => !lead.preferred_areas.length || lead.preferred_areas.some((area) => property.quartier?.toLocaleLowerCase().includes(area.toLocaleLowerCase())))
    .filter((property) => lead.furnishing === "any" || (property.equipements ?? []).some((item) => item.toLocaleLowerCase() === "meublé") === (lead.furnishing === "furnished"))
    .slice(0, 5);
}

const fieldClass = "space-y-1.5";
const labelClass = "text-xs font-medium text-muted-foreground";

export default function AdminClients() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLead, setEditingLead] = useState<ClientLead | null>(null);
  const [form, setForm] = useState<LeadForm>(blankLead);
  const { toast } = useToast();
  const { data: properties = [] } = useProperties();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("client_leads")
      .select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "CRM non disponible", description: "Lance la migration Supabase ajoutée au projet pour activer les dossiers clients.", variant: "destructive" });
    setLeads((data ?? []) as ClientLead[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const needle = search.trim().toLocaleLowerCase();
    const matchesSearch = !needle || `${lead.name} ${lead.phone} ${lead.email ?? ""} ${lead.preferred_areas.join(" ")}`.toLocaleLowerCase().includes(needle);
    return matchesSearch && (statusFilter === "all" || lead.status === statusFilter);
  }), [leads, search, statusFilter]);

  const followUps = leads.filter((lead) => lead.next_follow_up_at && new Date(lead.next_follow_up_at) <= new Date() && !["converti", "perdu"].includes(lead.status)).length;

  const openNew = () => { setEditingLead(null); setForm(blankLead); setDialogOpen(true); };
  const openEdit = (lead: ClientLead) => {
    setEditingLead(lead);
    setForm({ ...lead, email: lead.email ?? "", property_types: lead.property_types ?? [], preferred_areas: lead.preferred_areas ?? [], areas_text: (lead.preferred_areas ?? []).join(", "), notes: lead.notes ?? "", profession: lead.profession ?? "", client_profile: lead.client_profile ?? "", reference_location: lead.reference_location ?? "" });
    setDialogOpen(true);
  };

  const saveLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const { areas_text, id: _id, created_at: _createdAt, ...values } = form as LeadForm & Partial<ClientLead>;
    const payload = {
      ...values,
      email: values.email || null,
      preferred_areas: areas_text.split(",").map((area) => area.trim()).filter(Boolean),
      budget_min: values.budget_min || null,
      budget_max: values.budget_max || null,
      bedrooms_min: values.bedrooms_min ?? null,
      max_distance_km: values.max_distance_km || null,
      available_from: values.available_from || null,
      next_follow_up_at: values.next_follow_up_at || null,
      profession: values.profession || null,
      client_profile: values.client_profile || null,
      reference_location: values.reference_location || null,
      notes: values.notes || null,
    };
    const query = supabase.from("client_leads");
    const result = editingLead
      ? await query.update(payload).eq("id", editingLead.id)
      : await query.insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });
    setSaving(false);
    if (result.error) {
      toast({ title: "Enregistrement impossible", description: result.error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingLead ? "Dossier modifié" : "Client ajouté", description: "Les informations ont été enregistrées." });
    setDialogOpen(false);
    await fetchLeads();
  };

  const changeStatus = async (lead: ClientLead, status: LeadStatus) => {
    const { error } = await supabase.from("client_leads").update({ status }).eq("id", lead.id);
    if (error) toast({ title: "Mise à jour impossible", description: error.message, variant: "destructive" });
    else setLeads((previous) => previous.map((item) => item.id === lead.id ? { ...item, status } : item));
  };

  const shareMatches = (lead: ClientLead, matches: Bien[]) => {
    const base = window.location.origin;
    const intro = `Bonjour ${lead.name.split(" ")[0]}, voici des biens qui correspondent à votre recherche :`;
    const listings = matches.map((property) => {
      const price = priceOf(property, lead.transaction_type);
      const details = [property.titre, property.quartier, property.chambres ? `${property.chambres} chambres` : null, price ? `${price.toLocaleString("fr-FR")} ${property.devise}` : null].filter(Boolean).join(" · ");
      return `• ${details}\n${base}/bien/${property.id}`;
    }).join("\n\n");
    const message = matches.length ? `${intro}\n\n${listings}\n\nDites-moi lesquels vous intéressent pour organiser une visite.` : `Bonjour ${lead.name.split(" ")[0]}, je reviens vers vous concernant votre recherche immobilière.`;
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const copyRequestLink = async () => {
    const link = `${window.location.origin}/demande`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Lien copié", description: "Tu peux l’envoyer à tes clients sur WhatsApp ou Facebook." });
    } catch {
      window.prompt("Copie ce lien pour l’envoyer à tes clients :", link);
    }
  };

  return (
    <main className="container mx-auto flex-1 space-y-6 overflow-y-auto px-5 py-8 md:px-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bronze/10"><UsersRound className="h-4 w-4 text-[hsl(30_30%_45%)]" /></div>
            <h2 className="font-serif text-2xl md:text-3xl">Clients & demandes</h2>
          </div>
          <p className="ml-[42px] text-sm font-light text-muted-foreground">{leads.length} dossier{leads.length !== 1 ? "s" : ""} · {followUps} relance{followUps !== 1 ? "s" : ""} à faire</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void copyRequestLink()} className="gap-2"><Link2 size={15} /> Lien du formulaire</Button><Button onClick={openNew} className="gap-2"><Plus size={16} /> Ajouter un client</Button></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Chercher par nom, téléphone ou quartier…" className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
      </div>

      {loading ? <div className="admin-card rounded-xl p-12 text-center text-sm text-muted-foreground">Chargement des dossiers…</div> : filteredLeads.length === 0 ? (
        <div className="admin-card flex flex-col items-center rounded-xl px-6 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60"><UsersRound className="h-5 w-5 text-muted-foreground/60" /></div>
          <p className="font-medium">{leads.length ? "Aucun résultat" : "Ton fichier client commence ici"}</p>
          <p className="mt-1 max-w-md text-sm font-light text-muted-foreground">Ajoute les coordonnées et les critères de recherche. Le système te proposera les biens publiés qui correspondent au budget, au type, au quartier, aux chambres et au meublé.</p>
          {!leads.length && <Button onClick={openNew} variant="outline" className="mt-5 gap-2"><Plus size={15} /> Créer le premier dossier</Button>}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredLeads.map((lead) => {
            const matches = matchingProperties(lead, properties);
            const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, "")}`;
            return (
              <article key={lead.id} className="admin-card space-y-4 rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-xl">{lead.name}</h3>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-700"><MessageCircle size={14} />{lead.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider", statusStyles[lead.status])}>{statusLabels[lead.status]}</span>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(lead)} aria-label="Modifier le dossier"><Pencil size={15} /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-muted px-2 py-1">{lead.transaction_type === "vente" ? "Vente" : "Location longue durée"}</span>
                  {(lead.property_types ?? []).map((type) => <span key={type} className="rounded-md bg-muted px-2 py-1">{typeLabels[type] ?? type}</span>)}
                  {lead.budget_max != null && <span className="rounded-md bg-muted px-2 py-1">Budget max {lead.budget_max.toLocaleString("fr-FR")} MAD</span>}
                  {lead.preferred_areas.length > 0 && <span className="rounded-md bg-muted px-2 py-1">{lead.preferred_areas.join(", ")}</span>}
                  {lead.bedrooms_min != null && <span className="rounded-md bg-muted px-2 py-1">{lead.bedrooms_min}+ chambres</span>}
                  {lead.furnishing !== "any" && <span className="rounded-md bg-muted px-2 py-1">{lead.furnishing === "furnished" ? "Meublé" : "Non meublé"}</span>}
                </div>
                {(lead.profession || lead.client_profile || lead.reference_location) && <p className="text-xs leading-5 text-muted-foreground">{[lead.profession, lead.client_profile, lead.reference_location && `${lead.max_distance_km ?? "?"} km de ${lead.reference_location}`].filter(Boolean).join(" · ")}</p>}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2"><p className="flex items-center gap-1.5 text-xs font-medium"><Home size={13} /> Biens correspondants</p><span className="text-[11px] text-muted-foreground">{matches.length} trouvé{matches.length !== 1 ? "s" : ""}</span></div>
                  {matches.length ? <div className="space-y-2">{matches.slice(0, 3).map((property) => <Link key={property.id} to={`/bien/${property.id}`} target="_blank" className="flex items-center justify-between gap-3 text-xs hover:text-primary"><span className="truncate">{property.titre} · {property.quartier ?? "Marrakech"}</span><span className="shrink-0">{(priceOf(property, lead.transaction_type) ?? 0).toLocaleString("fr-FR")} {property.devise}</span></Link>)}</div> : <p className="text-xs text-muted-foreground">Aucun bien publié ne correspond à ces critères pour le moment.</p>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">{lead.next_follow_up_at && <><CalendarClock size={14} /> Relance : {format(new Date(lead.next_follow_up_at), "dd MMM yyyy", { locale: fr })}</>}{lead.source && <span>{lead.source}</span>}</div>
                  <div className="flex items-center gap-2">
                    <Select value={lead.status} onValueChange={(value) => void changeStatus(lead, value as LeadStatus)}><SelectTrigger className="h-8 w-[145px] text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => shareMatches(lead, matches)}><MessageCircle size={14} /> WhatsApp</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLead ? "Modifier le dossier client" : "Nouveau dossier client"}</DialogTitle><DialogDescription>Note les critères et le profil pour retrouver plus vite les biens adaptés.</DialogDescription></DialogHeader>
          <form onSubmit={saveLead} className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2">
              <div className={fieldClass}><label className={labelClass}>Nom complet *</label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className={fieldClass}><label className={labelClass}>Téléphone WhatsApp *</label><Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212…" /></div>
              <div className={fieldClass}><label className={labelClass}>E-mail</label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className={fieldClass}><label className={labelClass}>Source du contact</label><Select value={form.source} onValueChange={(value) => setForm({ ...form, source: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["WhatsApp", "Facebook", "Instagram", "Mubawab", "Site web", "Recommandation", "Agence partenaire", "Autre"].map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}</SelectContent></Select></div>
            </section>

            <section className="space-y-3 rounded-lg border border-border/60 p-4">
              <h3 className="text-sm font-medium">Ce que le client cherche</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={fieldClass}><label className={labelClass}>Projet</label><Select value={form.transaction_type} onValueChange={(value) => setForm({ ...form, transaction_type: value as LeadForm["transaction_type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="location-longue-duree">Location longue durée</SelectItem><SelectItem value="vente">Achat</SelectItem></SelectContent></Select></div>
                <div className={fieldClass}><label className={labelClass}>Types de bien</label><div className="flex flex-wrap gap-2">{Object.entries(typeLabels).map(([value, label]) => <label key={value} className="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs"><input type="checkbox" checked={form.property_types.includes(value)} onChange={(e) => setForm({ ...form, property_types: e.target.checked ? [...form.property_types, value] : form.property_types.filter((type) => type !== value) })} />{label}</label>)}</div></div>
                <div className={fieldClass}><label className={labelClass}>Budget minimum (MAD)</label><Input type="number" min="0" value={form.budget_min ?? ""} onChange={(e) => setForm({ ...form, budget_min: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className={fieldClass}><label className={labelClass}>Budget maximum (MAD)</label><Input type="number" min="0" value={form.budget_max ?? ""} onChange={(e) => setForm({ ...form, budget_max: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className={fieldClass}><label className={labelClass}>Quartiers ou secteurs (séparés par virgule)</label><Input value={form.areas_text} onChange={(e) => setForm({ ...form, areas_text: e.target.value })} placeholder="Route de Fès, Targa…" /></div>
                <div className={fieldClass}><label className={labelClass}>Chambres minimum</label><Input type="number" min="0" value={form.bedrooms_min ?? ""} onChange={(e) => setForm({ ...form, bedrooms_min: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className={fieldClass}><label className={labelClass}>Meublé</label><Select value={form.furnishing} onValueChange={(value) => setForm({ ...form, furnishing: value as Furnishing })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Indifférent</SelectItem><SelectItem value="furnished">Meublé</SelectItem><SelectItem value="unfurnished">Non meublé</SelectItem></SelectContent></Select></div>
                <div className={fieldClass}><label className={labelClass}>Disponible à partir du</label><Input type="date" value={form.available_from ?? ""} onChange={(e) => setForm({ ...form, available_from: e.target.value || null })} /></div>
                <div className={fieldClass}><label className={labelClass}>Point de référence pour la distance</label><Input value={form.reference_location ?? ""} onChange={(e) => setForm({ ...form, reference_location: e.target.value })} placeholder="Travail, école, quartier…" /></div>
                <div className={fieldClass}><label className={labelClass}>Distance maximale (km)</label><Input type="number" min="0" value={form.max_distance_km ?? ""} onChange={(e) => setForm({ ...form, max_distance_km: e.target.value ? Number(e.target.value) : null })} /></div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div className={fieldClass}><label className={labelClass}>Métier / activité</label><Input value={form.profession ?? ""} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></div>
              <div className={fieldClass}><label className={labelClass}>Profil du client / composition du foyer</label><Input value={form.client_profile ?? ""} onChange={(e) => setForm({ ...form, client_profile: e.target.value })} placeholder="Salarié, famille, couple…" /></div>
              <div className={fieldClass}><label className={labelClass}>Prochaine relance</label><Input type="datetime-local" value={form.next_follow_up_at ? form.next_follow_up_at.slice(0, 16) : ""} onChange={(e) => setForm({ ...form, next_follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
              <div className={fieldClass}><label className={labelClass}>Étape actuelle</label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as LeadStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
              <div className={`${fieldClass} sm:col-span-2`}><label className={labelClass}>Notes pour toi</label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Préférences, détails utiles, historique des échanges…" /></div>
            </section>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button><Button disabled={saving} type="submit">{saving ? "Enregistrement…" : "Enregistrer le dossier"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
