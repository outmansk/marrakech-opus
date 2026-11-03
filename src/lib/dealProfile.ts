import type { Lang } from "@/i18n/routing";

// Profil ANONYME du client d'un bien loué ou vendu (loi 09-08 : jamais de nom).
// L'admin choisit un type de client et une nationalité dans des listes fermées ;
// la phrase est composée ici dans les trois langues (« un couple français », "a French couple", « una pareja francesa »).

export const CLIENT_TYPES = {
  couple: { label: "Un couple", fr: "un couple", frFem: false, en: "couple", es: "una pareja", esFem: true },
  famille: { label: "Une famille", fr: "une famille", frFem: true, en: "family", es: "una familia", esFem: true },
  client: { label: "Un client", fr: "un client", frFem: false, en: "client", es: "un cliente", esFem: false },
  cliente: { label: "Une cliente", fr: "une cliente", frFem: true, en: "client", es: "una clienta", esFem: true },
  entreprise: { label: "Une entreprise", fr: "une entreprise", frFem: true, en: "company", es: "una empresa", esFem: true },
} as const;
export type ClientType = keyof typeof CLIENT_TYPES;

/** Adjectifs de nationalité : [FR masc., FR fém., EN, ES masc., ES fém.]. */
export const NATIONALITES = {
  francaise: ["français", "française", "French", "francés", "francesa"],
  belge: ["belge", "belge", "Belgian", "belga", "belga"],
  marocaine: ["marocain", "marocaine", "Moroccan", "marroquí", "marroquí"],
  espagnole: ["espagnol", "espagnole", "Spanish", "español", "española"],
  britannique: ["britannique", "britannique", "British", "británico", "británica"],
  italienne: ["italien", "italienne", "Italian", "italiano", "italiana"],
  allemande: ["allemand", "allemande", "German", "alemán", "alemana"],
  suisse: ["suisse", "suisse", "Swiss", "suizo", "suiza"],
  neerlandaise: ["néerlandais", "néerlandaise", "Dutch", "neerlandés", "neerlandesa"],
  americaine: ["américain", "américaine", "American", "estadounidense", "estadounidense"],
  canadienne: ["canadien", "canadienne", "Canadian", "canadiense", "canadiense"],
  portugaise: ["portugais", "portugaise", "Portuguese", "portugués", "portuguesa"],
  russe: ["russe", "russe", "Russian", "ruso", "rusa"],
  saoudienne: ["saoudien", "saoudienne", "Saudi", "saudí", "saudí"],
  emiratie: ["émirien", "émirienne", "Emirati", "emiratí", "emiratí"],
} as const satisfies Record<string, readonly [string, string, string, string, string]>;
export type Nationalite = keyof typeof NATIONALITES;

/** Libellé de la liste de l'admin : « Française », « Belge »… */
export const nationaliteLabel = (code: Nationalite) => {
  const fem = NATIONALITES[code][1];
  return fem.charAt(0).toUpperCase() + fem.slice(1);
};

export const isClientType = (value: unknown): value is ClientType => typeof value === "string" && value in CLIENT_TYPES;
export const isNationalite = (value: unknown): value is Nationalite => typeof value === "string" && value in NATIONALITES;

/** « un couple français », "a French couple", « una pareja francesa » ; nationalité facultative. */
export function profileText(client: ClientType, nationalite: Nationalite | null, lang: Lang): string {
  const type = CLIENT_TYPES[client];
  const adj = nationalite ? NATIONALITES[nationalite] : null;
  if (lang === "en") {
    const noun = adj ? `${adj[2]} ${type.en}` : type.en;
    return `${/^[aeiouAEIOU]/.test(noun) ? "an" : "a"} ${noun}`;
  }
  if (lang === "es") return adj ? `${type.es} ${type.esFem ? adj[4] : adj[3]}` : type.es;
  return adj ? `${type.fr} ${type.frFem ? adj[1] : adj[0]}` : type.fr;
}

/** Mois « AAAA-MM » valide (01 à 12). */
export const isDealMonth = (value: unknown): value is string => typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
