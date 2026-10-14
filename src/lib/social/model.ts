// Réseaux sociaux : suivi de la diffusion des biens (groupes, publications, clics, clients).
// Tables : supabase/migrations/20261013_reseaux_sociaux.sql. Rien n'est publié depuis le site.

export type Reseau = "facebook" | "instagram" | "marketplace" | "whatsapp" | "tiktok" | "linkedin" | "autre";
export type GroupeType = "immo" | "expat" | "quartier" | "autre";
export type Langue = "fr" | "en" | "fr-en" | "autre";
export type GroupeStatut = "actif" | "a-eviter" | "reserve";
export type PubStatut = "en-attente" | "en-ligne" | "refusee" | "supprimee" | "expiree";
export type PubliePar = "moi" | "claude" | "autre";
export type AlerteType = "avertissement" | "verification" | "blocage" | "publication-refusee";

export const RESEAUX: Record<Reseau, { label: string; prefix: string; src: string }> = {
  facebook: { label: "Facebook", prefix: "FB", src: "fb" },
  instagram: { label: "Instagram", prefix: "IG", src: "ig" },
  marketplace: { label: "Facebook Marketplace", prefix: "MP", src: "mp" },
  whatsapp: { label: "WhatsApp", prefix: "WA", src: "wa" },
  tiktok: { label: "TikTok", prefix: "TT", src: "tt" },
  linkedin: { label: "LinkedIn", prefix: "LI", src: "li" },
  autre: { label: "Autre", prefix: "XX", src: "xx" },
};
export const GROUPE_TYPES: Record<GroupeType, string> = { immo: "Immobilier", expat: "Expatriés", quartier: "Quartier", autre: "Autre" };
export const LANGUES: Record<Langue, string> = { fr: "Français", en: "Anglais", "fr-en": "FR + EN", autre: "Autre" };
export const GROUPE_STATUTS: Record<GroupeStatut, string> = { actif: "Actif", "a-eviter": "À éviter", reserve: "En réserve" };
export const PUB_STATUTS: Record<PubStatut, string> = {
  "en-attente": "En attente", "en-ligne": "En ligne", refusee: "Refusée", supprimee: "Supprimée", expiree: "Expirée",
};
export const PUB_STATUT_TONE: Record<PubStatut, "success" | "warning" | "closed"> = {
  "en-attente": "warning", "en-ligne": "success", refusee: "closed", supprimee: "closed", expiree: "closed",
};
export const PUBLIE_PAR: Record<PubliePar, string> = { moi: "Moi", claude: "Claude", autre: "Autre" };
export const ALERTE_TYPES: Record<AlerteType, string> = {
  avertissement: "Avertissement", verification: "Vérification de sécurité", blocage: "Blocage", "publication-refusee": "Publication refusée",
};

export interface Groupe {
  id: string;
  code: number;
  nom: string;
  lien: string | null;
  reseau: Reseau;
  membres: number | null;
  type: GroupeType;
  langue: Langue;
  regles: string | null;
  agences_interdites: boolean;
  immobilier_interdit: boolean;
  approbation_obligatoire: boolean;
  statut: GroupeStatut;
  statut_raison: string | null;
  is_demo?: boolean;
  created_at: string;
}

export interface Publication {
  id: string;
  code: number;
  /** Bien du site (base ou fichier) ; null pour un bien hors site. */
  bien_id: string | null;
  bien_hors_site: string | null;
  groupe_id: string | null;
  reseau: Reseau;
  publie_le: string;
  langue: Langue;
  texte_debut: string | null;
  nb_photos: number | null;
  lien: string | null;
  publie_par: PubliePar;
  statut: PubStatut;
  statut_change_le: string;
  remarque: string | null;
  origine?: "manuel" | "import" | "api";
  is_demo?: boolean;
  created_at?: string;
}

export interface Clic {
  id: number;
  publication_id: string;
  created_at: string;
}

export interface AlerteCompte {
  id: string;
  survenue_le: string;
  reseau: Reseau;
  type: AlerteType;
  compte: string | null;
  remarque: string | null;
}

/** Origine enregistrée sur un client, une demande de visite ou un message du site. */
export interface Origine {
  origine_reseau: Reseau | null;
  origine_groupe_id: string | null;
  origine_publication_id: string | null;
  origine_ref?: string | null;
}

export interface LeadOrigine extends Origine {
  id: string;
  name: string;
  status: string;
  bien_id: string | null;
  created_at: string;
}

export interface VisiteOrigine extends Origine {
  id: string;
  property_v2_id: string | null;
  created_at: string;
}

/** Référence courte d'une publication, reprise dans le message WhatsApp : « FB-12 ». */
export const pubRef = (pub: Pick<Publication, "code" | "reseau">) => `${RESEAUX[pub.reseau]?.prefix ?? "XX"}-${pub.code}`;

/** Clé d'un bien, qu'il soit sur le site ou hors site. */
export const bienKey = (pub: Pick<Publication, "bien_id" | "bien_hors_site">) =>
  pub.bien_id ? pub.bien_id : `hors:${(pub.bien_hors_site ?? "").trim().toLowerCase()}`;

export const fromOrigin = (row: Origine) => !!(row.origine_publication_id || row.origine_reseau || row.origine_ref);
