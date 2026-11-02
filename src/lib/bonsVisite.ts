/**
 * Bons de visite signés à distance (visite sur place ou à distance) (table bons_visite,
 * SQL : supabase/migrations/20261102_bons_visite.sql).
 * L'agence prépare le bon dans l'admin, la cliente le signe depuis /bon/<jeton> (anciens liens : /bon-visite/<jeton>).
 * Le PDF est construit ici, à l'identique pour la cliente et pour l'agence.
 */

export type BonTypeBien = "villa" | "appartement";
export type BonPrixUnite = "mois" | "nuit";
export type BonStatut = "a-signer" | "signe";

/** Ce que voit la cliente (fonction SQL bon_visite_public). */
export interface BonVisitePublic {
  numero: number;
  type_bien: BonTypeBien;
  bien: string;
  quartier: string;
  date_visite: string;
  prix: number;
  prix_unite: BonPrixUnite;
  texte: string;
  texte_confirmation: string;
  statut: BonStatut;
  client_nom: string | null;
  client_telephone: string | null;
  client_email: string | null;
  signature: string | null;
  signe_le: string | null;
  empreinte: string | null;
}

/** Ligne vue par l'agence (sans la signature, chargée seulement pour le PDF). */
export interface BonVisiteAdmin extends Omit<BonVisitePublic, "signature"> {
  id: string;
  jeton: string;
  created_at: string;
}

export const BON_ADMIN_COLUMNS =
  "id, numero, jeton, type_bien, bien, quartier, date_visite, prix, prix_unite, texte, texte_confirmation, statut, client_nom, client_telephone, client_email, signe_le, empreinte, created_at";

export const TYPE_BIEN_LABELS: Record<BonTypeBien, string> = { villa: "Villa", appartement: "Appartement" };
export const PRIX_UNITE_LABELS: Record<BonPrixUnite, string> = { mois: "par mois", nuit: "par nuit" };

export const BON_PATH = "/bon";
/** Jeton de lien : 12 caractères (liens courts) ou 64 hexadécimaux (premiers bons envoyés). */
export const JETON_RE = /^(?:[0-9a-f]{64}|[a-z2-9]{12})$/;
export const SQL_FILE = "supabase/migrations/20261102_bons_visite.sql";

export function bonReference(numero: number) {
  return `BV-${String(numero).padStart(4, "0")}`;
}

export function bonLink(origin: string, jeton: string) {
  return `${origin}${BON_PATH}/${jeton}`;
}

export function bonWhatsappText(link: string) {
  return `Bonjour, voici votre bon de visite Live In Marrakech. Merci de le lire, de le compléter et de le signer depuis ce lien : ${link}`;
}

/** « 18 000 MAD par mois » (espaces simples : le PDF n'a pas les espaces fines). */
export function formatBonPrix(prix: number, unite: BonPrixUnite) {
  const value = Number(prix);
  const [int, dec] = value.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${dec === "00" ? grouped : `${grouped},${dec}`} MAD ${PRIX_UNITE_LABELS[unite]}`;
}

/** Date de la visite (colonne DATE) : « 2 novembre 2026 ». */
export function formatBonDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
}

/** Horodatage de la signature, à l'heure de Marrakech : « 2 novembre 2026 à 15:42 ». */
export function formatBonSigneLe(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("fr-FR", { timeZone: "Africa/Casablanca", day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { timeZone: "Africa/Casablanca", hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}

// ─── Saisie de la cliente ──────────────────────────────────────────────────

export const INDICATIFS = [
  { code: "+212", label: "+212 Maroc" },
  { code: "+33", label: "+33 France" },
  { code: "+32", label: "+32 Belgique" },
  { code: "+41", label: "+41 Suisse" },
  { code: "+34", label: "+34 Espagne" },
  { code: "+44", label: "+44 Royaume-Uni" },
  { code: "+49", label: "+49 Allemagne" },
  { code: "+39", label: "+39 Italie" },
  { code: "+31", label: "+31 Pays-Bas" },
  { code: "+351", label: "+351 Portugal" },
  { code: "+1", label: "+1 États-Unis / Canada" },
  { code: "+971", label: "+971 Émirats arabes unis" },
  { code: "+966", label: "+966 Arabie saoudite" },
  { code: "+974", label: "+974 Qatar" },
] as const;

export interface BonSaisie {
  nom: string;
  indicatif: string;
  telephone: string;
  email: string;
  confirme: boolean;
}

export type BonChamp = "nom" | "telephone" | "email" | "confirme" | "signature";

/** Numéro national sans le 0 initial : « 06 12 34 56 78 » → « 612345678 ». */
export function nationalDigits(telephone: string) {
  return telephone.replace(/\D/g, "").replace(/^0+/, "");
}

/** Format attendu par la base : « +212 612345678 ». */
export function fullPhone(indicatif: string, telephone: string) {
  return `${indicatif} ${nationalDigits(telephone)}`;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateBon(saisie: BonSaisie, hasSignature: boolean) {
  const errors: Partial<Record<BonChamp, string>> = {};
  const nom = saisie.nom.trim();
  if (nom.length < 2) errors.nom = "Indiquez votre nom et votre prénom.";
  else if (nom.length > 120) errors.nom = "Le nom ne doit pas dépasser 120 caractères.";
  const digits = nationalDigits(saisie.telephone);
  if (!digits) errors.telephone = "Indiquez votre numéro de téléphone ou WhatsApp.";
  else if (digits.length < 6 || digits.length > 14) errors.telephone = "Ce numéro ne semble pas complet. Vérifiez l’indicatif et le numéro.";
  const email = saisie.email.trim();
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) errors.email = "Cette adresse e-mail n’est pas valide.";
  if (!saisie.confirme) errors.confirme = "Cochez cette case pour confirmer vos informations.";
  if (!hasSignature) errors.signature = "Signez dans le cadre avant d’envoyer.";
  return errors;
}

/** Message lisible pour une erreur renvoyée par signer_bon_visite(). */
export function signErrorMessage(error: { message?: string; code?: string } | null | undefined): { field?: BonChamp; message: string; alreadySigned?: boolean } {
  const m = error?.message ?? "";
  if (m.includes("bon_deja_signe")) return { message: "Ce bon de visite a déjà été signé.", alreadySigned: true };
  if (m.includes("bon_introuvable")) return { message: "Ce lien n’est plus valide. Contactez Live In Marrakech." };
  if (m.includes("nom_invalide")) return { field: "nom", message: "Indiquez votre nom et votre prénom." };
  if (m.includes("telephone_invalide")) return { field: "telephone", message: "Ce numéro ne semble pas complet. Vérifiez l’indicatif et le numéro." };
  if (m.includes("email_invalide")) return { field: "email", message: "Cette adresse e-mail n’est pas valide." };
  if (m.includes("signature_invalide")) return { field: "signature", message: "La signature n’a pas pu être lue. Effacez et signez de nouveau." };
  return { message: "L’envoi a échoué. Vérifiez votre connexion puis réessayez : vos informations sont conservées." };
}

// ─── PDF ───────────────────────────────────────────────────────────────────

const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

/** Les polices standard du PDF ne couvrent que le jeu Windows-1252 : on remplace le reste. */
export function pdfSafe(text: string) {
  return Array.from(text)
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code === 0xa0 || code === 0x202f || code === 0x2009) return " ";
      if (code === 0x2010 || code === 0x2011) return "-";
      return code <= 0xff || WIN_ANSI_EXTRA.includes(c) ? c : "?";
    })
    .join("");
}

export function bonPdfFileName(numero: number) {
  return `bon-de-visite-${bonReference(numero)}.pdf`;
}

/** Construit le PDF d'un bon signé (jsPDF chargé à la demande). `compress: false` sert aux tests. */
export async function buildBonPdf(bon: BonVisitePublic, { compress = true } = {}) {
  if (bon.statut !== "signe" || !bon.signature || !bon.signe_le) throw new Error("Bon non signé");
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress });
  const W = 210;
  const M = 20;
  const inner = W - 2 * M;
  const dark: [number, number, number] = [33, 31, 27];
  const grey: [number, number, number] = [110, 104, 96];
  const terracotta: [number, number, number] = [156, 85, 61];
  let y = 22;

  doc.setProperties({ title: `Bon de visite ${bonReference(bon.numero)}`, author: "Live In Marrakech", creator: "liveinmarrakech.com" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...terracotta);
  doc.text("LIVE IN MARRAKECH", M, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  doc.text(`N° ${bonReference(bon.numero)}`, W - M, y, { align: "right" });
  y += 11;
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...dark);
  doc.text("Bon de visite", M, y);
  y += 4;
  doc.setDrawColor(...terracotta);
  doc.setLineWidth(0.6);
  doc.line(M, y, M + 28, y);
  y += 10;

  const section = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...terracotta);
    doc.text(pdfSafe(title.toUpperCase()), M, y);
    y += 6;
  };
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grey);
    doc.text(pdfSafe(label), M, y);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(pdfSafe(value), inner - 52) as string[];
    doc.text(lines, M + 52, y);
    y += Math.max(1, lines.length) * 5 + 2;
  };

  section("Coordonnées");
  row("Nom et prénom", bon.client_nom ?? "");
  row("Téléphone / WhatsApp", bon.client_telephone ?? "");
  row("E-mail", bon.client_email || "Non renseigné");
  y += 4;

  section("Bien présenté");
  row("Type de bien", TYPE_BIEN_LABELS[bon.type_bien]);
  row("Bien", bon.bien);
  row("Résidence / quartier", bon.quartier);
  row("Date de la visite", formatBonDate(bon.date_visite));
  row("Prix proposé", formatBonPrix(bon.prix, bon.prix_unite));
  y += 4;

  section("Déclaration");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...dark);
  for (const paragraph of bon.texte.split(/\n\s*\n/)) {
    const lines = doc.splitTextToSize(pdfSafe(paragraph.trim()), inner) as string[];
    doc.text(lines, M, y);
    y += lines.length * 5.2 + 3;
  }
  // Case cochée dessinée (pas de glyphe « ☑ » dans les polices standard).
  doc.setDrawColor(...dark);
  doc.setLineWidth(0.3);
  doc.rect(M, y - 3.4, 4, 4);
  doc.setLineWidth(0.5);
  doc.line(M + 0.8, y - 1.4, M + 1.7, y - 0.3);
  doc.line(M + 1.7, y - 0.3, M + 3.3, y - 2.9);
  const confirmLines = doc.splitTextToSize(pdfSafe(bon.texte_confirmation), inner - 7) as string[];
  doc.text(confirmLines, M + 7, y);
  y += confirmLines.length * 5.2 + 8;

  section("Signature");
  const boxH = 42;
  doc.setDrawColor(220, 212, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, 90, boxH, 1.5, 1.5);
  const img = doc.getImageProperties(bon.signature);
  const ratio = img.width / img.height;
  let iw = 84;
  let ih = iw / ratio;
  if (ih > boxH - 6) { ih = boxH - 6; iw = ih * ratio; }
  doc.addImage(bon.signature, "PNG", M + (90 - iw) / 2, y + (boxH - ih) / 2, iw, ih, undefined, "FAST");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text(pdfSafe(bon.client_nom ?? ""), M + 98, y + 8);
  doc.setTextColor(...grey);
  doc.text(doc.splitTextToSize(pdfSafe(`Signé le ${formatBonSigneLe(bon.signe_le)} (heure de Marrakech)`), inner - 98) as string[], M + 98, y + 15);
  y += boxH + 12;

  doc.setFontSize(8);
  doc.setTextColor(...grey);
  const footer = [
    "Signature manuscrite tracée à l’écran par le signataire, depuis le lien personnel transmis par Live In Marrakech. La date et l’heure sont enregistrées par le serveur au moment de l’envoi.",
    `Empreinte du document (SHA-256) : ${bon.empreinte ?? ""}`,
    "Live In Marrakech, Marrakech · liveinmarrakech.com",
  ];
  for (const text of footer) {
    const lines = doc.splitTextToSize(pdfSafe(text), inner) as string[];
    doc.text(lines, M, y);
    y += lines.length * 3.8 + 1.5;
  }
  return doc;
}

export async function downloadBonPdf(bon: BonVisitePublic) {
  const doc = await buildBonPdf(bon);
  doc.save(bonPdfFileName(bon.numero));
}
