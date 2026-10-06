import { useMemo, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SelectField } from "@/components/admin/ui";
import { btn, field } from "@/components/admin/styles";
import { cn } from "@/lib/utils";
import {
  CONTACT_ROLES,
  CONTACT_ROLE,
  TACHE_TYPES,
  TACHE_TYPE,
  fromInputs,
  shortcutDate,
  toDateInput,
  toTimeInput,
  type Contact,
  type ContactRole,
  type Tache,
  type TacheType,
} from "@/lib/agenda";

export type Option = { id: string; label: string };

export function Field({ label, children, className, hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className={field.label}>{label}</span>
      {children}
      {hint && <span className={field.help}>{hint}</span>}
    </label>
  );
}

/** Panneau latéral (desktop) / plein écran (mobile) avec barre d'action collante. */
export function FormSheet({ open, onClose, title, description, children }: {
  open: boolean; onClose: () => void; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex h-[100dvh] w-full max-w-none flex-col gap-0 border-border bg-background p-0 sm:max-w-none lg:w-[560px] [&>button]:hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-1.5 lg:px-5 lg:py-3">
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 place-items-center rounded-md hover:bg-muted"><X size={22} aria-hidden="true" /></button>
          <SheetTitle className="flex-1 truncate font-sans text-[15px] font-semibold">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pt-5 lg:px-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function RoleChips({ value, onChange }: { value: ContactRole; onChange: (r: ContactRole) => void }) {
  return (
    <div role="group" aria-label="Rôle du contact" className="flex flex-wrap gap-1.5">
      {CONTACT_ROLES.map((r) => (
        <button key={r.value} type="button" aria-pressed={value === r.value} onClick={() => onChange(r.value)}
          className={cn("min-h-10 rounded-full border px-3.5 text-[13px] font-semibold transition-colors", value === r.value ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:bg-muted")}>
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tâche ────────────────────────────────────────────────────────────────

export type NewContact = { nom: string; telephone: string; role: ContactRole };

export type TacheFormValues = {
  type: TacheType; titre: string; date: string; heure: string; fait: boolean;
  contact_id: string | null; newContact: NewContact | null;
  bien_id: string | null; lead_id: string | null; lieu: string; notes: string;
};

export function tacheToForm(t: Partial<Tache> = {}): TacheFormValues {
  const d = t.echeance ? new Date(t.echeance) : null;
  return {
    type: t.type ?? "appel", titre: t.titre ?? "", date: d ? toDateInput(d) : t.id ? "" : shortcutDate("aujourdhui"), heure: d ? toTimeInput(d) : "",
    fait: t.fait ?? false, contact_id: t.contact_id ?? null, newContact: null, bien_id: t.bien_id ?? null, lead_id: t.lead_id ?? null,
    lieu: t.lieu ?? "", notes: t.notes ?? "",
  };
}

export function formToTache(f: TacheFormValues) {
  return {
    type: f.type, titre: f.titre.trim(), echeance: fromInputs(f.date, f.heure), fait: f.fait,
    contact_id: f.contact_id, bien_id: f.bien_id, lead_id: f.lead_id,
    lieu: f.lieu.trim() || null, notes: f.notes.trim() || null,
  };
}

function ContactPicker({ contacts, value, newContact, onPick, onNew }: {
  contacts: Contact[]; value: string | null; newContact: NewContact | null;
  onPick: (id: string | null) => void; onNew: (c: NewContact | null) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = contacts.find((c) => c.id === value);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts.slice(0, 5);
    return contacts.filter((c) => [c.nom, c.telephone, c.societe].filter(Boolean).join(" ").toLowerCase().includes(q)).slice(0, 6);
  }, [contacts, query]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-input bg-card px-3 py-2">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold">{selected.nom}</span>
          <span className="truncate text-[13px] text-muted-foreground">{[CONTACT_ROLE[selected.role]?.label, selected.telephone, selected.societe].filter(Boolean).join(" · ")}</span>
        </span>
        <button type="button" onClick={() => onPick(null)} className="h-10 rounded-md px-3 text-[13px] font-semibold text-accent hover:bg-muted">Changer</button>
      </div>
    );
  }

  if (newContact) {
    return (
      <div className="flex flex-col gap-3 rounded-[10px] border border-input bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">Nouveau contact</span>
          <button type="button" onClick={() => onNew(null)} className="h-9 rounded-md px-2.5 text-[13px] font-semibold text-muted-foreground hover:bg-muted">Annuler</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom"><input value={newContact.nom} onChange={(e) => onNew({ ...newContact, nom: e.target.value })} placeholder="Ex. Madame Benali" className={field.input} /></Field>
          <Field label="Téléphone"><input type="tel" inputMode="tel" value={newContact.telephone} onChange={(e) => onNew({ ...newContact, telephone: e.target.value })} placeholder="06 12 34 56 78" className={field.input} /></Field>
        </div>
        <RoleChips value={newContact.role} onChange={(role) => onNew({ ...newContact, role })} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="relative flex">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-[13px] text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher un nom, un numéro…" aria-label="Chercher un contact" className={cn(field.input, "pl-10")} />
      </span>
      {matches.length > 0 && (
        <ul className="m-0 flex list-none flex-col overflow-hidden rounded-md border border-border bg-card p-0">
          {matches.map((c) => (
            <li key={c.id} className="border-b border-border last:border-0">
              <button type="button" onClick={() => onPick(c.id)} className="flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-muted">
                <span className="text-sm font-semibold">{c.nom}</span>
                <span className="text-xs text-muted-foreground">{[CONTACT_ROLE[c.role]?.label, c.telephone].filter(Boolean).join(" · ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => onNew({ nom: query.trim(), telephone: /^[\d\s+]+$/.test(query.trim()) ? query.trim() : "", role: "proprietaire" })} className={cn(btn.soft, "self-start")}>
        <UserPlus size={18} aria-hidden="true" />Nouveau contact
      </button>
    </div>
  );
}

export function TacheForm({ initial, editing, contacts, biens, leads, onCancel, onSave, onDelete }: {
  initial: TacheFormValues; editing: boolean; contacts: Contact[]; biens: Option[]; leads: Option[];
  onCancel: () => void; onSave: (values: TacheFormValues) => Promise<boolean>; onDelete?: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const up = <K extends keyof TacheFormValues>(k: K, v: TacheFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const shortcuts = [
    { label: "Aujourd’hui", date: shortcutDate("aujourdhui") },
    { label: "Demain", date: shortcutDate("demain") },
    { label: "Lundi prochain", date: shortcutDate("semaine-prochaine") },
    { label: "Sans date", date: "" },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) return setError("Écrivez ce qu’il faut faire, par exemple « Appeler le propriétaire de la villa ».");
    if (form.newContact && !form.newContact.nom.trim()) return setError("Indiquez le nom du nouveau contact, ou annulez sa création.");
    setError(null);
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (!ok) setError("L’enregistrement a échoué. Vérifiez votre connexion, puis réessayez.");
  };

  return (
    <form id="tache-form" onSubmit={submit} className="flex flex-col gap-5">
      <div role="group" aria-label="Type" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TACHE_TYPES.map((t) => {
          const on = form.type === t.value;
          return (
            <button key={t.value} type="button" aria-pressed={on} onClick={() => up("type", t.value)}
              className={cn("flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold transition-colors", on ? "border-primary bg-primary-soft text-[hsl(72_19%_23%)]" : "border-input bg-card text-foreground hover:bg-muted")}>
              <t.icon size={20} strokeWidth={1.7} aria-hidden="true" />{t.label}
            </button>
          );
        })}
      </div>

      <Field label="À faire">
        <input autoFocus={!editing} value={form.titre} onChange={(e) => up("titre", e.target.value)} placeholder={TACHE_TYPE[form.type].placeholder} className={field.input} maxLength={200} />
      </Field>

      <div className="flex flex-col gap-2">
        <span className={field.label}>Quand</span>
        <div className="flex flex-wrap gap-1.5">
          {shortcuts.map((s) => {
            const on = form.date === s.date;
            return (
              <button key={s.label} type="button" aria-pressed={on} onClick={() => setForm((f) => ({ ...f, date: s.date, heure: s.date ? f.heure : "" }))}
                className={cn("min-h-10 rounded-full border px-3.5 text-[13px] font-semibold", on ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:bg-muted")}>
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
          <input type="date" aria-label="Date" value={form.date} onChange={(e) => up("date", e.target.value)} className={field.input} />
          <input type="time" aria-label="Heure" value={form.heure} disabled={!form.date} onChange={(e) => up("heure", e.target.value)} className={cn(field.input, "disabled:opacity-50")} />
        </div>
        <span className={field.help}>Sans heure, la tâche compte pour toute la journée.</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className={field.label}>Contact <span className="font-normal text-muted-foreground">(propriétaire, agence, client…)</span></span>
        <ContactPicker contacts={contacts} value={form.contact_id} newContact={form.newContact}
          onPick={(id) => setForm((f) => ({ ...f, contact_id: id, newContact: null }))}
          onNew={(c) => setForm((f) => ({ ...f, newContact: c, contact_id: null }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bien concerné">
          <SelectField label="Bien concerné" value={form.bien_id ?? ""} onChange={(v) => up("bien_id", v || null)}>
            <option value="">Aucun</option>
            {biens.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </SelectField>
        </Field>
        <Field label="Client concerné">
          <SelectField label="Client concerné" value={form.lead_id ?? ""} onChange={(v) => up("lead_id", v || null)}>
            <option value="">Aucun</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </SelectField>
        </Field>
      </div>

      <Field label="Lieu ou lien" hint="Adresse du rendez-vous, lien de l’annonce Facebook…">
        <input value={form.lieu} onChange={(e) => up("lieu", e.target.value)} placeholder="Ex. Route de l’Ourika, km 12" className={field.input} />
      </Field>

      <Field label="Notes">
        <textarea rows={4} value={form.notes} onChange={(e) => up("notes", e.target.value)} placeholder="Ce qui a été dit, ce qu’il faut demander…" className={cn(field.input, "h-auto py-2.5 leading-relaxed")} />
      </Field>

      {editing && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={form.fait} onChange={(e) => up("fait", e.target.checked)} className="h-5 w-5 accent-[hsl(70_19%_34%)]" />
          <span className="text-[15px] font-semibold">Fait</span>
        </label>
      )}

      {error && <p role="alert" className="m-0 rounded-md bg-[hsl(14_60%_95%)] px-3 py-2.5 text-sm font-medium text-[hsl(9_57%_31%)]">{error}</p>}

      <TacheFormFooter saving={saving} onCancel={onCancel} onDelete={onDelete} />
    </form>
  );
}

/** Barre d'action collante en bas du panneau. */
function TacheFormFooter({ saving, onCancel, onDelete }: { saving: boolean; onCancel: () => void; onDelete?: () => void }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-border bg-card px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 lg:-mx-6 lg:px-6 lg:pb-4">
      {onDelete && <button type="button" onClick={onDelete} className={cn(btn.outline, "text-destructive")}>Supprimer</button>}
      <button type="button" onClick={onCancel} className={cn(btn.outline, "flex-1 lg:flex-none")}>Annuler</button>
      <button type="submit" disabled={saving} className={cn(btn.primary, "flex-1")}>
        <Check size={18} aria-hidden="true" />{saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────

export type ContactFormValues = { nom: string; telephone: string; email: string; role: ContactRole; societe: string; bien_id: string | null; notes: string };

export function contactToForm(c: Partial<Contact> = {}): ContactFormValues {
  return { nom: c.nom ?? "", telephone: c.telephone ?? "", email: c.email ?? "", role: c.role ?? "proprietaire", societe: c.societe ?? "", bien_id: c.bien_id ?? null, notes: c.notes ?? "" };
}

export function formToContact(f: ContactFormValues) {
  return { nom: f.nom.trim(), telephone: f.telephone.trim() || null, email: f.email.trim() || null, role: f.role, societe: f.societe.trim() || null, bien_id: f.bien_id, notes: f.notes.trim() || null };
}

export function ContactForm({ initial, editing, biens, onCancel, onSave, onDelete }: {
  initial: ContactFormValues; editing: boolean; biens: Option[];
  onCancel: () => void; onSave: (values: ContactFormValues) => Promise<boolean>; onDelete?: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const up = <K extends keyof ContactFormValues>(k: K, v: ContactFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return setError("Indiquez au moins le nom du contact.");
    setError(null);
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (!ok) setError("L’enregistrement a échoué. Vérifiez votre connexion, puis réessayez.");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className={field.label}>Rôle</span>
        <RoleChips value={form.role} onChange={(r) => up("role", r)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom"><input autoFocus={!editing} value={form.nom} onChange={(e) => up("nom", e.target.value)} placeholder="Ex. Monsieur Alaoui" className={field.input} maxLength={120} /></Field>
        <Field label="Téléphone"><input type="tel" inputMode="tel" value={form.telephone} onChange={(e) => up("telephone", e.target.value)} placeholder="06 12 34 56 78" className={field.input} /></Field>
        <Field label={form.role === "agence" ? "Nom de l’agence" : "Société / agence"}><input value={form.societe} onChange={(e) => up("societe", e.target.value)} placeholder="Optionnel" className={field.input} /></Field>
        <Field label="E-mail"><input type="email" inputMode="email" value={form.email} onChange={(e) => up("email", e.target.value)} placeholder="Optionnel" className={field.input} /></Field>
      </div>
      <Field label="Bien lié" hint="Pour un propriétaire : la villa, le riad ou l’appartement concerné.">
        <SelectField label="Bien lié" value={form.bien_id ?? ""} onChange={(v) => up("bien_id", v || null)}>
          <option value="">Aucun</option>
          {biens.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </SelectField>
      </Field>
      <Field label="Notes">
        <textarea rows={4} value={form.notes} onChange={(e) => up("notes", e.target.value)} placeholder="Disponibilités, conditions, commission, source (Facebook, Mubawab…)" className={cn(field.input, "h-auto py-2.5 leading-relaxed")} />
      </Field>
      {error && <p role="alert" className="m-0 rounded-md bg-[hsl(14_60%_95%)] px-3 py-2.5 text-sm font-medium text-[hsl(9_57%_31%)]">{error}</p>}
      <TacheFormFooter saving={saving} onCancel={onCancel} onDelete={onDelete} />
    </form>
  );
}
