import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, MapPin, MessageCircle, Phone, Plus, Search, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { telHref, whatsappHref } from "@/lib/contact";
import {
  CONTACT_ROLES,
  CONTACT_ROLE,
  GROUPES,
  TACHE_TYPES,
  TACHE_TYPE,
  echeanceLabel,
  groupeOf,
  isLate,
  isMissingTable,
  postpone,
  type Contact,
  type ContactRole,
  type Groupe,
  type Tache,
  type TacheType,
} from "@/lib/agenda";
import { useContacts, useDeleteContact, useDeleteTache, useSaveContact, useSaveTache, useTaches } from "@/hooks/useAgenda";
import { useProperties } from "@/hooks/useBiens";
import { ActionMenu, Chips, ConfirmDialog, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import { btn, field } from "@/components/admin/styles";
import {
  ContactForm,
  FormSheet,
  TacheForm,
  contactToForm,
  formToContact,
  formToTache,
  tacheToForm,
  type ContactFormValues,
  type Option,
  type TacheFormValues,
} from "@/components/admin/AgendaForms";

type Vue = "taches" | "contacts";
type Filtre = "a-faire" | "faites";

function useLeadOptions() {
  return useQuery({
    queryKey: ["admin-lead-options"],
    queryFn: async () => {
      const { data } = await supabase.from("client_leads").select("id, name, phone").order("name");
      return (data ?? []) as { id: string; name: string; phone: string }[];
    },
  });
}

function IconLink({ href, label, whatsapp, children }: { href?: string; label: string; whatsapp?: boolean; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a href={href} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noopener noreferrer" : undefined} aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-md", whatsapp ? "bg-whatsapp text-white" : "bg-primary-soft text-[hsl(72_19%_23%)]")}>
      {children}
    </a>
  );
}

export default function AdminAgenda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vue: Vue = searchParams.get("vue") === "contacts" ? "contacts" : "taches";
  const setVue = (v: Vue) => setSearchParams(v === "contacts" ? { vue: "contacts" } : {}, { replace: true });

  const taches = useTaches();
  const contacts = useContacts();
  const { data: biens = [] } = useProperties();
  const { data: leads = [] } = useLeadOptions();
  const saveTache = useSaveTache();
  const deleteTache = useDeleteTache();
  const saveContact = useSaveContact();
  const deleteContact = useDeleteContact();

  const [filtre, setFiltre] = useState<Filtre>("a-faire");
  const [type, setType] = useState<TacheType | "tous">("tous");
  const [role, setRole] = useState<ContactRole | "tous">("tous");
  const [query, setQuery] = useState("");
  const [tacheForm, setTacheForm] = useState<{ id?: string; values: TacheFormValues } | null>(null);
  const [contactForm, setContactForm] = useState<{ id?: string; values: ContactFormValues } | null>(null);
  const [contactSheet, setContactSheet] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; description: string; run: () => void } | null>(null);

  const contactList = useMemo(() => contacts.data ?? [], [contacts.data]);
  const tacheList = useMemo(() => taches.data ?? [], [taches.data]);
  const contactById = useMemo(() => new Map(contactList.map((c) => [c.id, c])), [contactList]);
  const bienById = useMemo(() => new Map(biens.map((b) => [b.id, b])), [biens]);
  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const bienOptions: Option[] = useMemo(() => biens.map((b) => ({ id: b.id, label: [b.titre, b.quartier].filter(Boolean).join(" · ") })), [biens]);
  const leadOptions: Option[] = useMemo(() => leads.map((l) => ({ id: l.id, label: l.name })), [leads]);

  // Ouverture depuis un lien : ?new=1 (tâche), ?contact=new, ?edit=<id>, avec préremplissage ?type= &lead= &bien= &avec=<contactId>
  useEffect(() => {
    if (taches.isLoading || contacts.isLoading) return;
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if (searchParams.get("new") === "1") {
      setTacheForm({ values: { ...tacheToForm(), type: (searchParams.get("type") as TacheType) || "appel", lead_id: searchParams.get("lead"), bien_id: searchParams.get("bien"), contact_id: searchParams.get("avec") } });
      ["new", "type", "lead", "bien", "avec"].forEach((k) => next.delete(k));
      changed = true;
    }
    if (searchParams.get("contact") === "new") {
      setContactForm({ values: contactToForm() });
      next.delete("contact");
      changed = true;
    }
    const editId = searchParams.get("edit");
    if (editId) {
      const t = tacheList.find((x) => x.id === editId);
      if (t) setTacheForm({ id: t.id, values: tacheToForm(t) });
      next.delete("edit");
      changed = true;
    }
    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, taches.isLoading, contacts.isLoading, tacheList]);

  const missing = isMissingTable(taches.error as never) || isMissingTable(contacts.error as never);

  // ── Tâches filtrées et groupées ──
  const needle = query.trim().toLowerCase();
  const matchesTache = (t: Tache) => {
    if (!needle) return true;
    const c = t.contact_id ? contactById.get(t.contact_id) : undefined;
    return [t.titre, t.notes, t.lieu, c?.nom, c?.telephone, c?.societe, t.bien_id && bienById.get(t.bien_id)?.titre, t.lead_id && leadById.get(t.lead_id)?.name]
      .filter(Boolean).join(" ").toLowerCase().includes(needle);
  };
  const open = tacheList.filter((t) => !t.fait);
  const done = tacheList.filter((t) => t.fait).sort((a, b) => (b.fait_le ?? b.updated_at).localeCompare(a.fait_le ?? a.updated_at));
  const scope = (filtre === "a-faire" ? open : done).filter(matchesTache);
  const typeCounts = Object.fromEntries(TACHE_TYPES.map((t) => [t.value, scope.filter((x) => x.type === t.value).length]));
  const visibles = scope.filter((t) => type === "tous" || t.type === type);
  const groups = GROUPES.map((g) => ({ ...g, items: visibles.filter((t) => groupeOf(t) === g.value) })).filter((g) => g.items.length);

  // ── Contacts filtrés ──
  const roleCounts = Object.fromEntries(CONTACT_ROLES.map((r) => [r.value, contactList.filter((c) => c.role === r.value).length]));
  const visibleContacts = contactList.filter((c) => (role === "tous" || c.role === role) &&
    (!needle || [c.nom, c.telephone, c.societe, c.notes, c.email].filter(Boolean).join(" ").toLowerCase().includes(needle)));

  // ── Actions ──
  const toggleFait = async (t: Tache) => {
    const fait = !t.fait;
    try {
      await saveTache.mutateAsync({ id: t.id, values: { fait, fait_le: fait ? new Date().toISOString() : null } });
      toast.success(fait ? `« ${t.titre} » est fait.` : "Tâche remise à faire.", {
        action: { label: "Annuler", onClick: () => void saveTache.mutateAsync({ id: t.id, values: { fait: t.fait, fait_le: t.fait_le } }) },
      });
    } catch {
      toast.error("La tâche n’a pas pu être mise à jour. Réessayez.");
    }
  };

  const reporter = async (t: Tache, days: number) => {
    try {
      await saveTache.mutateAsync({ id: t.id, values: { echeance: postpone(t.echeance, days) } });
      toast.success(days === 1 ? "Reportée à demain." : "Reportée d’une semaine.", {
        action: { label: "Annuler", onClick: () => void saveTache.mutateAsync({ id: t.id, values: { echeance: t.echeance } }) },
      });
    } catch {
      toast.error("La tâche n’a pas pu être reportée. Réessayez.");
    }
  };

  const submitTache = async (values: TacheFormValues): Promise<boolean> => {
    try {
      let contactId = values.contact_id;
      if (values.newContact) {
        const created = await saveContact.mutateAsync({ values: { nom: values.newContact.nom.trim(), telephone: values.newContact.telephone.trim() || null, role: values.newContact.role, email: null, societe: null, bien_id: values.bien_id, notes: null } });
        contactId = created.id;
      }
      const payload = { ...formToTache(values), contact_id: contactId };
      const existing = tacheForm?.id ? tacheList.find((t) => t.id === tacheForm.id) : undefined;
      const fait_le = payload.fait ? existing?.fait_le ?? new Date().toISOString() : null;
      await saveTache.mutateAsync({ id: tacheForm?.id, values: { ...payload, fait_le } });
      toast.success(tacheForm?.id ? "Tâche enregistrée." : "Tâche ajoutée à l’agenda.");
      setTacheForm(null);
      return true;
    } catch {
      return false;
    }
  };

  const submitContact = async (values: ContactFormValues): Promise<boolean> => {
    try {
      await saveContact.mutateAsync({ id: contactForm?.id, values: formToContact(values) });
      toast.success(contactForm?.id ? "Contact enregistré." : "Contact ajouté.");
      setContactForm(null);
      return true;
    } catch {
      return false;
    }
  };

  const askDeleteTache = (t: Tache) => setConfirm({
    title: "Supprimer cette tâche ?",
    description: `« ${t.titre} » sera supprimée définitivement.`,
    run: async () => {
      try {
        await deleteTache.mutateAsync(t.id);
        setTacheForm(null);
        toast.success("Tâche supprimée.");
      } catch {
        toast.error("La tâche n’a pas pu être supprimée. Réessayez.");
      }
    },
  });

  const askDeleteContact = (c: Contact) => setConfirm({
    title: "Supprimer ce contact ?",
    description: `${c.nom} sera supprimé du carnet. Ses tâches restent dans l’agenda, sans contact associé.`,
    run: async () => {
      try {
        await deleteContact.mutateAsync(c.id);
        setContactForm(null);
        setContactSheet(null);
        toast.success("Contact supprimé.");
      } catch {
        toast.error("Le contact n’a pas pu être supprimé. Réessayez.");
      }
    },
  });

  const newTache = (preset: Partial<TacheFormValues> = {}) => setTacheForm({ values: { ...tacheToForm(), ...preset } });

  // ── Rendu d'une tâche ──
  const TacheCard = ({ t }: { t: Tache }) => {
    const meta = TACHE_TYPE[t.type] ?? TACHE_TYPE.note;
    const contact = t.contact_id ? contactById.get(t.contact_id) : undefined;
    const bien = t.bien_id ? bienById.get(t.bien_id) : undefined;
    const lead = t.lead_id ? leadById.get(t.lead_id) : undefined;
    const phone = contact?.telephone || lead?.phone;
    const late = isLate(t);
    const when = echeanceLabel(t.echeance);
    return (
      <li className="flex gap-3 border-b border-border bg-card px-3 py-3 last:border-0 lg:px-4">
        <button type="button" onClick={() => void toggleFait(t)} aria-label={t.fait ? `Remettre « ${t.titre} » à faire` : `Marquer « ${t.titre} » comme fait`}
          className="grid h-11 w-11 shrink-0 place-items-center">
          <span className={cn("grid h-7 w-7 place-items-center rounded-full border-2 transition-colors", t.fait ? "border-primary bg-primary text-white" : "border-input bg-white hover:border-primary")}>
            {t.fait && <Check size={16} strokeWidth={2.5} aria-hidden="true" />}
          </span>
        </button>
        <button type="button" onClick={() => setTacheForm({ id: t.id, values: tacheToForm(t) })} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold", meta.tone)}>
              <meta.icon size={13} strokeWidth={2} aria-hidden="true" />{meta.label}
            </span>
            {when && <span className={cn("text-[13px] font-semibold", late ? "text-destructive" : "text-muted-foreground")}>{late ? `En retard · ${when}` : when}</span>}
          </span>
          <span className={cn("text-[15px] font-semibold leading-snug", t.fait && "text-muted-foreground line-through")}>{t.titre}</span>
          {(contact || lead || bien || t.lieu) && (
            <span className="flex flex-col gap-0.5 text-[13px] leading-snug text-muted-foreground">
              {contact && <span className="flex items-center gap-1.5"><UserRound size={14} aria-hidden="true" className="shrink-0" />{[contact.nom, CONTACT_ROLE[contact.role]?.label, contact.telephone].filter(Boolean).join(" · ")}</span>}
              {lead && <span className="flex items-center gap-1.5"><UserRound size={14} aria-hidden="true" className="shrink-0" />Client : {lead.name}</span>}
              {bien && <span className="flex items-center gap-1.5"><Building2 size={14} aria-hidden="true" className="shrink-0" /><span className="truncate">{bien.titre}</span></span>}
              {t.lieu && <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" className="shrink-0" /><span className="truncate">{t.lieu}</span></span>}
            </span>
          )}
          {t.notes && <span className="line-clamp-2 whitespace-pre-line text-[13px] leading-snug text-[hsl(36_8%_25%)]">{t.notes}</span>}
        </button>
        <span className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
          {!t.fait && <IconLink href={telHref(phone)} label={`Appeler ${contact?.nom ?? lead?.name ?? ""}`}><Phone size={18} strokeWidth={1.7} aria-hidden="true" /></IconLink>}
          {!t.fait && <IconLink whatsapp href={whatsappHref(phone)} label={`WhatsApp ${contact?.nom ?? lead?.name ?? ""}`}><MessageCircle size={18} strokeWidth={1.7} aria-hidden="true" /></IconLink>}
          <ActionMenu label={`Actions pour « ${t.titre} »`} items={[
            { label: "Modifier", onSelect: () => setTacheForm({ id: t.id, values: tacheToForm(t) }) },
            ...(!t.fait ? [
              { label: "Reporter à demain", onSelect: () => void reporter(t, 1) },
              { label: "Reporter d’une semaine", onSelect: () => void reporter(t, 7) },
            ] : []),
            { label: "Dupliquer", onSelect: () => newTache({ ...tacheToForm(t), fait: false, date: tacheToForm().date }) },
            { label: "Supprimer", danger: true, onSelect: () => askDeleteTache(t) },
          ]} />
        </span>
      </li>
    );
  };

  const sheetContact = contactSheet ? contactById.get(contactSheet) : undefined;
  const sheetTaches = sheetContact ? tacheList.filter((t) => t.contact_id === sheetContact.id).sort((a, b) => Number(a.fait) - Number(b.fait) || (a.echeance ?? "9").localeCompare(b.echeance ?? "9")) : [];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 lg:px-10 lg:py-8">
      <PageHeader title="Agenda" count={vue === "taches" ? `${open.length} à faire` : `${contactList.length} contacts`}>
        <button type="button" onClick={() => setContactForm({ values: contactToForm() })} className={cn(btn.outline, "hidden lg:inline-flex")}><UserPlus size={18} aria-hidden="true" />Nouveau contact</button>
        <button type="button" onClick={() => newTache()} className={cn(btn.primary, "hidden lg:inline-flex")}><Plus size={18} aria-hidden="true" />Nouvelle tâche</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 lg:w-[360px]" role="tablist" aria-label="Vue">
        {([["taches", "Tâches"], ["contacts", "Contacts"]] as const).map(([v, l]) => (
          <button key={v} role="tab" type="button" aria-selected={vue === v} onClick={() => setVue(v)}
            className={cn("h-10 rounded-[5px] text-sm font-semibold transition-colors", vue === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{l}</button>
        ))}
      </div>

      {missing ? (
        <EmptyState title="L’agenda n’est pas encore activé" text="Lancez le fichier « 5-agenda.sql » dans Supabase (SQL Editor), puis rechargez cette page." />
      ) : (taches.isError || contacts.isError) ? (
        <ErrorState title="Impossible de charger l’agenda" onRetry={() => { void taches.refetch(); void contacts.refetch(); }} />
      ) : (
        <>
          <span className="relative flex">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-[13px] text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={vue === "taches" ? "Chercher une tâche, un contact, un bien…" : "Chercher un nom, un numéro, une agence…"} aria-label="Rechercher" className={cn(field.input, "bg-card pl-10")} />
          </span>

          {vue === "taches" ? (
            <>
              {/* Ajout rapide */}
              <form onSubmit={(e) => { e.preventDefault(); const titre = new FormData(e.currentTarget).get("rapide")?.toString().trim(); newTache(titre ? { titre } : {}); e.currentTarget.reset(); }}
                className="flex gap-2">
                <input name="rapide" placeholder="Ajouter : appeler le propriétaire de la villa X…" aria-label="Ajouter une tâche" className={cn(field.input, "bg-white")} />
                <button type="submit" className={cn(btn.primary, "shrink-0")}><Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">Ajouter</span></button>
              </form>

              <div className="flex flex-col gap-2.5">
                <Chips label="Statut" value={filtre} onChange={(v) => setFiltre(v as Filtre)} options={[{ value: "a-faire", label: "À faire", count: open.length }, { value: "faites", label: "Faites", count: done.length }]} />
                <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
                  <div className="flex w-max gap-1.5 lg:w-auto lg:flex-wrap">
                    <Chips label="Type" value={type} onChange={(v) => setType(v as TacheType | "tous")} options={[{ value: "tous" as const, label: "Tout" }, ...TACHE_TYPES.map((t) => ({ value: t.value, label: t.plural, count: typeCounts[t.value] }))]} />
                  </div>
                </div>
              </div>

              {taches.isLoading ? (
                <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement des tâches">
                  {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[92px] rounded-[10px] border border-border bg-card" />)}
                </div>
              ) : visibles.length === 0 ? (
                filtre === "a-faire" && !needle && type === "tous" ? (
                  <EmptyState title="Rien à faire pour l’instant" text="Ajoutez vos appels, rendez-vous, relances et notes de prospection : ils apparaîtront ici, classés par date."
                    action={<button type="button" onClick={() => newTache()} className={btn.primary}><Plus size={18} aria-hidden="true" />Nouvelle tâche</button>} />
                ) : (
                  <EmptyState title="Aucune tâche" text={needle ? "Aucune tâche ne correspond à votre recherche." : "Aucune tâche dans cette catégorie."} />
                )
              ) : filtre === "faites" ? (
                <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-border p-0">{visibles.map((t) => <TacheCard key={t.id} t={t} />)}</ul>
              ) : (
                <div className="flex flex-col gap-5">
                  {groups.map((g) => (
                    <section key={g.value} aria-labelledby={`g-${g.value}`} className="flex flex-col gap-2">
                      <h2 id={`g-${g.value}`} className={cn("m-0 flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em]", g.value === "retard" ? "text-destructive" : g.value === "aujourdhui" ? "text-accent" : "text-muted-foreground")}>
                        {g.label}<span className="font-medium normal-case tracking-normal opacity-80">{g.items.length}</span>
                      </h2>
                      <ul className={cn("m-0 list-none overflow-hidden rounded-[10px] border p-0", (g.value as Groupe) === "retard" ? "border-[hsl(11_47%_79%)]" : "border-border")}>
                        {g.items.map((t) => <TacheCard key={t.id} t={t} />)}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
                <div className="flex w-max gap-1.5 lg:w-auto lg:flex-wrap">
                  <Chips label="Rôle" value={role} onChange={(v) => setRole(v as ContactRole | "tous")} options={[{ value: "tous" as const, label: "Tous", count: contactList.length }, ...CONTACT_ROLES.map((r) => ({ value: r.value, label: r.plural, count: roleCounts[r.value] }))]} />
                </div>
              </div>
              <button type="button" onClick={() => setContactForm({ values: contactToForm(role !== "tous" ? { role } : {}) })} className={cn(btn.outline, "lg:hidden")}><UserPlus size={18} aria-hidden="true" />Nouveau contact</button>

              {contacts.isLoading ? (
                <div className="grid gap-2.5 lg:grid-cols-2" aria-busy="true" aria-label="Chargement des contacts">
                  {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[132px] rounded-[10px] border border-border bg-card" />)}
                </div>
              ) : visibleContacts.length === 0 ? (
                contactList.length === 0 ? (
                  <EmptyState title="Votre carnet est vide" text="Enregistrez les propriétaires de villas, les agences partenaires et vos contacts de prospection pour les retrouver en un geste."
                    action={<button type="button" onClick={() => setContactForm({ values: contactToForm() })} className={btn.primary}><UserPlus size={18} aria-hidden="true" />Ajouter un contact</button>} />
                ) : (
                  <EmptyState title="Aucun contact" text="Aucun contact ne correspond à votre recherche." />
                )
              ) : (
                <ul className="m-0 grid list-none gap-2.5 p-0 lg:grid-cols-2">
                  {visibleContacts.map((c) => {
                    const todo = tacheList.filter((t) => t.contact_id === c.id && !t.fait);
                    const next = todo.filter((t) => t.echeance).sort((a, b) => a.echeance!.localeCompare(b.echeance!))[0];
                    const bien = c.bien_id ? bienById.get(c.bien_id) : undefined;
                    return (
                      <li key={c.id} className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-3.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] lg:p-4">
                        <div className="flex items-start gap-3">
                          <button type="button" onClick={() => setContactSheet(c.id)} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold leading-snug">{c.nom}</span>
                              <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">{CONTACT_ROLE[c.role]?.label}</span>
                            </span>
                            <span className="text-[13px] leading-snug text-muted-foreground">{[c.telephone, c.societe].filter(Boolean).join(" · ") || "Pas de numéro"}</span>
                            {bien && <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><Building2 size={14} aria-hidden="true" className="shrink-0" /><span className="truncate">{bien.titre}</span></span>}
                          </button>
                          <ActionMenu label={`Actions pour ${c.nom}`} items={[
                            { label: "Voir la fiche", onSelect: () => setContactSheet(c.id) },
                            { label: "Modifier", onSelect: () => setContactForm({ id: c.id, values: contactToForm(c) }) },
                            { label: "Supprimer", danger: true, onSelect: () => askDeleteContact(c) },
                          ]} />
                        </div>
                        {(todo.length > 0 || c.notes) && (
                          <p className="m-0 line-clamp-2 text-[13px] leading-snug text-[hsl(36_8%_25%)]">
                            {todo.length > 0 && <span className="font-semibold text-accent">{todo.length} à faire{next ? ` · ${echeanceLabel(next.echeance)}` : ""}. </span>}
                            {c.notes}
                          </p>
                        )}
                        <div className="flex gap-2">
                          {c.telephone && <a href={telHref(c.telephone)} className={cn(btn.soft, "flex-1 px-3")}><Phone size={18} aria-hidden="true" />Appeler</a>}
                          {c.telephone && <a href={whatsappHref(c.telephone)} target="_blank" rel="noopener noreferrer" className={cn(btn.whatsapp, "flex-1 px-3")}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}
                          <button type="button" onClick={() => newTache({ contact_id: c.id, bien_id: c.bien_id })} aria-label={`Nouvelle tâche avec ${c.nom}`} className={cn(btn.outline, "px-3")}><Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">Tâche</span></button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </>
      )}

      {/* Bouton « + » mobile propre à l'agenda : remplace l'ajout générique */}
      {!missing && (
        <button type="button" onClick={() => (vue === "contacts" ? setContactForm({ values: contactToForm() }) : newTache())}
          aria-label={vue === "contacts" ? "Nouveau contact" : "Nouvelle tâche"}
          className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-[41] grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[0_10px_24px_-10px_rgba(61,70,40,0.7)] lg:hidden">
          {vue === "contacts" ? <UserPlus size={22} strokeWidth={2} aria-hidden="true" /> : <Plus size={24} strokeWidth={2} aria-hidden="true" />}
        </button>
      )}

      {/* Formulaire tâche */}
      <FormSheet open={!!tacheForm} onClose={() => setTacheForm(null)} title={tacheForm?.id ? "Modifier la tâche" : "Nouvelle tâche"} description="Type, échéance, contact, bien concerné et notes.">
        {tacheForm && (
          <TacheForm key={tacheForm.id ?? "new"} initial={tacheForm.values} editing={!!tacheForm.id} contacts={contactList} biens={bienOptions} leads={leadOptions}
            onCancel={() => setTacheForm(null)} onSave={submitTache}
            onDelete={tacheForm.id ? () => { const t = tacheList.find((x) => x.id === tacheForm.id); if (t) askDeleteTache(t); } : undefined} />
        )}
      </FormSheet>

      {/* Formulaire contact */}
      <FormSheet open={!!contactForm} onClose={() => setContactForm(null)} title={contactForm?.id ? "Modifier le contact" : "Nouveau contact"} description="Nom, téléphone, rôle et notes du contact.">
        {contactForm && (
          <ContactForm key={contactForm.id ?? "new"} initial={contactForm.values} editing={!!contactForm.id} biens={bienOptions}
            onCancel={() => setContactForm(null)} onSave={submitContact}
            onDelete={contactForm.id ? () => { const c = contactById.get(contactForm.id!); if (c) askDeleteContact(c); } : undefined} />
        )}
      </FormSheet>

      {/* Fiche contact + historique */}
      <FormSheet open={!!sheetContact} onClose={() => setContactSheet(null)} title={sheetContact?.nom ?? "Contact"} description="Coordonnées et historique des tâches du contact.">
        {sheetContact && (
          <div className="flex flex-col gap-5 pb-6">
            <div className="flex flex-col gap-1">
              <span className="inline-flex h-6 self-start items-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">{CONTACT_ROLE[sheetContact.role]?.label}</span>
              <p className="m-0 font-serif text-[26px] font-semibold leading-tight">{sheetContact.nom}</p>
              <p className="m-0 text-sm text-muted-foreground">{[sheetContact.telephone, sheetContact.email, sheetContact.societe].filter(Boolean).join(" · ")}</p>
              {sheetContact.bien_id && bienById.get(sheetContact.bien_id) && <p className="m-0 flex items-center gap-1.5 text-sm text-muted-foreground"><Building2 size={15} aria-hidden="true" />{bienById.get(sheetContact.bien_id)!.titre}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sheetContact.telephone && <a href={telHref(sheetContact.telephone)} className={btn.soft}><Phone size={18} aria-hidden="true" />Appeler</a>}
              {sheetContact.telephone && <a href={whatsappHref(sheetContact.telephone)} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}
              <button type="button" onClick={() => { setContactSheet(null); newTache({ contact_id: sheetContact.id, bien_id: sheetContact.bien_id }); }} className={btn.primary}><Plus size={18} aria-hidden="true" />Nouvelle tâche</button>
              <button type="button" onClick={() => { setContactSheet(null); setContactForm({ id: sheetContact.id, values: contactToForm(sheetContact) }); }} className={btn.outline}>Modifier</button>
            </div>
            {sheetContact.notes && (
              <div className="flex flex-col gap-1.5">
                <span className={field.label}>Notes</span>
                <p className="m-0 whitespace-pre-line rounded-md bg-card p-3 text-sm leading-relaxed">{sheetContact.notes}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <span className={field.label}>Historique ({sheetTaches.length})</span>
              {sheetTaches.length === 0 ? (
                <p className="m-0 text-sm text-muted-foreground">Aucune tâche avec ce contact pour l’instant.</p>
              ) : (
                <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-border p-0">{sheetTaches.map((t) => <TacheCard key={t.id} t={t} />)}</ul>
              )}
            </div>
          </div>
        )}
      </FormSheet>

      <ConfirmDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title={confirm?.title ?? ""} description={confirm?.description ?? ""}
        onConfirm={() => { confirm?.run(); setConfirm(null); }} />
    </div>
  );
}
