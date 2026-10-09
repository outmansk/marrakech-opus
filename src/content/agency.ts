// Agency facts shown on the About, legal and privacy pages and in structured data.
// Only facts confirmed by the agency. Empty fields are "TODO À CONFIRMER": the pages hide them
// until they are filled in here.

export const AGENCY = {
  name: "Live In Marrakech",
  phoneDisplay: "+212 6 05 38 70 41",
  phone: "+212605387041",
  email: "contact@liveinmarrakech.com",
  /** As shown in the site footer. */
  area: "Gueliz",
  city: "Marrakech",
  instagram: "https://www.instagram.com/liveinmarrakech",

  // ── TODO À CONFIRMER (hidden while empty) ───────────────────────────────
  /** Raison sociale, e.g. "Live In Marrakech SARL". */
  legalName: "",
  /** Forme juridique and share capital, e.g. "SARL au capital de 100 000 MAD". */
  legalForm: "",
  /** Registre du commerce (RC), identifiant commun de l'entreprise (ICE), identifiant fiscal (IF). */
  rc: "",
  ice: "",
  taxId: "",
  /** Street address of the office, if it receives the public. */
  streetAddress: "",
  /** Director of publication (name). */
  publicationDirector: "",
  /** Year the agency was founded, and 2–3 sentences of its story, per language. */
  foundedYear: "",
  story: { fr: "", en: "", es: "" },
  /** Data retention period stated in the privacy policy, per language (e.g. "3 ans après le dernier contact"). */
  dataRetention: { fr: "", en: "", es: "" },
  /** Declaration or authorisation number with the CNDP (Moroccan data protection authority), if any. */
  cndpNumber: "",
};

/** Hosting providers named in the legal notice and privacy policy (public company information). */
export const PROVIDERS = {
  hosting: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  database: "Supabase",
  images: "Cloudinary",
};
