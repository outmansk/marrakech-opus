import { CalendarClock, Handshake, Home, Megaphone, NotebookPen, Phone, RotateCcw } from "lucide-react";

export type TacheType = "appel" | "rendez-vous" | "visite" | "relance" | "prospection" | "note";
export type ContactRole = "proprietaire" | "agence" | "client" | "partenaire" | "autre";

export interface Contact {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  role: ContactRole;
  societe: string | null;
  bien_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tache {
  id: string;
  type: TacheType;
  titre: string;
  echeance: string | null;
  fait: boolean;
  fait_le: string | null;
  contact_id: string | null;
  bien_id: string | null;
  lead_id: string | null;
  lieu: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const TACHE_TYPES: { value: TacheType; label: string; plural: string; icon: React.ElementType; placeholder: string; tone: string }[] = [
  { value: "appel", label: "Appel", plural: "Appels", icon: Phone, placeholder: "Appeler le propriétaire de la villa…", tone: "bg-primary-soft text-[hsl(72_19%_23%)]" },
  { value: "rendez-vous", label: "Rendez-vous", plural: "Rendez-vous", icon: CalendarClock, placeholder: "Rendez-vous avec Madame X pour les photos du riad", tone: "bg-[hsl(20_70%_93%)] text-accent" },
  { value: "visite", label: "Visite", plural: "Visites", icon: Home, placeholder: "Visite de l'appartement Gueliz avec le client", tone: "bg-warning text-warning-foreground" },
  { value: "relance", label: "Relance", plural: "Relances", icon: RotateCcw, placeholder: "Relancer le client qui cherche une villa", tone: "bg-[hsl(25_30%_90%)] text-[hsl(25_25%_32%)]" },
  { value: "prospection", label: "Prospection", plural: "Prospection", icon: Megaphone, placeholder: "Prospecter les annonces Facebook Palmeraie", tone: "bg-[hsl(205_35%_92%)] text-[hsl(205_40%_30%)]" },
  { value: "note", label: "Note", plural: "Notes", icon: NotebookPen, placeholder: "Idée, information à retenir…", tone: "bg-muted text-muted-foreground" },
];

export const TACHE_TYPE = Object.fromEntries(TACHE_TYPES.map((t) => [t.value, t])) as Record<TacheType, (typeof TACHE_TYPES)[number]>;

export const CONTACT_ROLES: { value: ContactRole; label: string; plural: string; icon: React.ElementType }[] = [
  { value: "proprietaire", label: "Propriétaire", plural: "Propriétaires", icon: Home },
  { value: "agence", label: "Agence", plural: "Agences", icon: Handshake },
  { value: "client", label: "Client", plural: "Clients", icon: Phone },
  { value: "partenaire", label: "Partenaire", plural: "Partenaires", icon: Handshake },
  { value: "autre", label: "Autre", plural: "Autres", icon: NotebookPen },
];

export const CONTACT_ROLE = Object.fromEntries(CONTACT_ROLES.map((r) => [r.value, r])) as Record<ContactRole, (typeof CONTACT_ROLES)[number]>;

// ─── Dates ────────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export type Groupe = "retard" | "aujourdhui" | "demain" | "semaine" | "plus-tard" | "sans-date";

export const GROUPES: { value: Groupe; label: string }[] = [
  { value: "retard", label: "En retard" },
  { value: "aujourdhui", label: "Aujourd’hui" },
  { value: "demain", label: "Demain" },
  { value: "semaine", label: "Cette semaine" },
  { value: "plus-tard", label: "Plus tard" },
  { value: "sans-date", label: "Sans date" },
];

/** Range une tâche à faire dans « En retard », « Aujourd'hui », « Demain »… */
export function groupeOf(tache: Pick<Tache, "echeance">, now = new Date()): Groupe {
  if (!tache.echeance) return "sans-date";
  const due = new Date(tache.echeance);
  const today = startOfDay(now);
  if (due < today) return "retard";
  if (due < addDays(today, 1)) return "aujourdhui";
  if (due < addDays(today, 2)) return "demain";
  if (due < addDays(today, 7)) return "semaine";
  return "plus-tard";
}

/** Une échéance à 00:00 est une journée entière (pas d'heure précise). */
export function hasTime(d: Date) {
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

/** « Aujourd'hui · 15:00 », « Demain », « jeu. 9 oct. · 10:30 », « En retard — lun. 6 oct. » */
export function echeanceLabel(iso: string | null, now = new Date()) {
  if (!iso) return null;
  const d = new Date(iso);
  const today = startOfDay(now);
  const time = hasTime(d) ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
  let day: string;
  if (d >= today && d < addDays(today, 1)) day = "Aujourd’hui";
  else if (d >= addDays(today, 1) && d < addDays(today, 2)) day = "Demain";
  else if (d >= addDays(today, -1) && d < today) day = "Hier";
  else day = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return time ? `${day} · ${time}` : day;
}

export function isLate(tache: Pick<Tache, "echeance" | "fait">, now = new Date()) {
  if (tache.fait || !tache.echeance) return false;
  const d = new Date(tache.echeance);
  return hasTime(d) ? d < now : d < startOfDay(now);
}

/** Raccourcis de date du formulaire : renvoie une date locale « YYYY-MM-DD ». */
export function shortcutDate(kind: "aujourdhui" | "demain" | "semaine-prochaine") {
  const now = new Date();
  const d = kind === "aujourdhui" ? now : kind === "demain" ? addDays(now, 1) : addDays(now, ((8 - now.getDay()) % 7) || 7);
  return toDateInput(d);
}

export function toDateInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInput(d: Date) {
  return hasTime(d) ? d.toTimeString().slice(0, 5) : "";
}

/** Date + heure saisies → ISO (heure vide = journée entière, stockée à 00:00 locale). */
export function fromInputs(date: string, time: string) {
  if (!date) return null;
  const [y, m, day] = date.split("-").map(Number);
  const [h, min] = time ? time.split(":").map(Number) : [0, 0];
  return new Date(y, m - 1, day, h, min).toISOString();
}

/** Reporte une tâche de n jours en gardant son heure. */
export function postpone(iso: string | null, days: number) {
  const base = iso ? new Date(iso) : new Date();
  const from = iso && new Date(iso) > new Date() ? base : new Date(new Date().setHours(base.getHours(), base.getMinutes(), 0, 0));
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days, from.getHours(), from.getMinutes()).toISOString();
}

/** Table absente : le fichier SQL de l'agenda n'a pas encore été lancé. */
export function isMissingTable(error: { code?: string; message?: string } | null | undefined) {
  return !!error && (error.code === "PGRST205" || error.code === "42P01" || /schema cache|does not exist/i.test(error.message ?? ""));
}
