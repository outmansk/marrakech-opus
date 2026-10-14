import { BASE_URL } from "@/hooks/useSEO";
import { propertyPath } from "@/lib/propertyUrl";
import { trackedUrl, TZ } from "./stats";
import type { Groupe, Publication } from "./model";

// Formats d'affichage de la section Réseaux sociaux (heure de Casablanca).

/** Lien suivi d'une publication (null si le bien n'est pas sur le site). */
export function pubTrackedUrl(pub: Publication, biens: Map<string, { id: string; titre: string }>, groupes: Map<string, Groupe>) {
  const bien = pub.bien_id ? biens.get(pub.bien_id) : undefined;
  if (!bien) return null;
  return trackedUrl(BASE_URL, propertyPath(bien), pub, pub.groupe_id ? groupes.get(pub.groupe_id) : null);
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, ...opts });
export const formatDateTime = (iso: string) => fmt({ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const formatDate = (iso: string) => fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
export const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)} %`);
export const nf = (v: number) => new Intl.NumberFormat("fr-FR").format(v);

/** Valeur d'un champ datetime-local à l'heure de Casablanca, et retour en ISO. */
export function toLocalInput(iso: string) {
  const p = Object.fromEntries(fmt({ year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
}
export function fromLocalInput(value: string) {
  // L'heure saisie est celle de Casablanca : on retrouve son décalage à cette date.
  const guess = new Date(`${value}:00Z`);
  const shown = toLocalInput(guess.toISOString());
  const offsetMs = new Date(`${shown}:00Z`).getTime() - guess.getTime();
  return new Date(guess.getTime() - offsetMs).toISOString();
}
