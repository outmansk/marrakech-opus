import type { BienService, BienStatut, BienType } from "@/types/property";

/**
 * Libellés lisibles pour le back-office : aucune valeur brute de la base
 * (« publie », « location-longue-duree »…) ne doit s'afficher telle quelle.
 */

export const STATUT_LABELS: Record<BienStatut, string> = {
  publie: "Publié",
  brouillon: "Brouillon",
  "vendu-loue": "Déjà loué / vendu",
};

export const SERVICE_LABELS: Record<BienService, string> = {
  vente: "Vente",
  "location-longue-duree": "Location longue durée",
  "location-courte-duree": "Séjour courte durée",
  "sous-location": "Sous-location",
};

/** Version courte pour les graphiques et les puces. */
export const SERVICE_SHORT_LABELS: Record<BienService, string> = {
  vente: "Vente",
  "location-longue-duree": "Location longue",
  "location-courte-duree": "Séjour court",
  "sous-location": "Sous-location",
};

export const TYPE_LABELS: Record<BienType, string> = {
  villa: "Villa",
  appartement: "Appartement",
  riad: "Riad",
  maison: "Maison",
  terrain: "Terrain",
};

export type VisitStatus = "pending" | "confirmed" | "cancelled";

/** Les visites utilisent plusieurs orthographes en base : on les ramène à trois états. */
export function visitStatus(raw: string | null | undefined): VisitStatus {
  if (raw === "confirmee" || raw === "confirmed") return "confirmed";
  if (raw === "annulee" || raw === "cancelled") return "cancelled";
  return "pending";
}

export const VISIT_LABELS: Record<VisitStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

export type LeadStatus = "nouveau" | "contacte" | "qualification" | "visite" | "negociation" | "converti" | "perdu";

export const LEAD_LABELS: Record<LeadStatus, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  qualification: "À qualifier",
  visite: "Visite prévue",
  negociation: "Négociation",
  converti: "Converti",
  perdu: "Perdu",
};

/** Ton de la puce de statut : vert = publié/confirmé, ambre = brouillon/en attente, gris-rose = clos. */
export type StatusTone = "success" | "warning" | "closed";

export const STATUT_TONE: Record<BienStatut, StatusTone> = { publie: "success", brouillon: "warning", "vendu-loue": "closed" };
export const VISIT_TONE: Record<VisitStatus, StatusTone> = { pending: "warning", confirmed: "success", cancelled: "closed" };

/** « 22 000 MAD / mois », « 1 800 MAD / nuit », « 5 000 000 MAD » ou « Prix sur demande ». */
export function formatPrix(montant: number | null | undefined, devise: string = "MAD", service?: BienService | null) {
  if (!montant) return "Prix sur demande";
  const value = `${new Intl.NumberFormat("fr-FR").format(montant)} ${devise}`;
  if (service === "location-longue-duree" || service === "sous-location") return `${value} / mois`;
  if (service === "location-courte-duree") return `${value} / nuit`;
  return value;
}

/** Prix principal d'un bien, avec la bonne unité. */
export function mainPrice(bien: {
  prix_vente: number | null;
  prix_location_longue: number | null;
  prix_location_courte: number | null;
  prix: number | null;
  devise: string;
  services?: BienService[] | null;
}) {
  if (bien.prix_vente) return formatPrix(bien.prix_vente, bien.devise, "vente");
  if (bien.prix_location_longue) return formatPrix(bien.prix_location_longue, bien.devise, "location-longue-duree");
  if (bien.prix_location_courte) return formatPrix(bien.prix_location_courte, bien.devise, "location-courte-duree");
  return formatPrix(bien.prix, bien.devise, bien.services?.[0] ?? null);
}
