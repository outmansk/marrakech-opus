import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildBonPdf,
  bonReference,
  formatBonDate,
  formatBonPrix,
  formatBonSigneLe,
  fullPhone,
  pdfSafe,
  signErrorMessage,
  validateBon,
  type BonVisitePublic,
} from "./bonsVisite";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const SIGNED: BonVisitePublic = {
  numero: 7,
  type_bien: "villa",
  bien: "Villa Test avec piscine (DP-26-TEST)",
  quartier: "Route de Fès",
  date_visite: "2026-11-02",
  prix: 18000,
  prix_unite: "mois",
  texte: "Je confirme avoir effectué une visite virtuelle du bien indiqué ci-dessus avec l’agence Live In Marrakech.\n\nCe document confirme uniquement la présentation du bien. Il ne constitue ni une réservation, ni un engagement de location ou d’achat.",
  texte_confirmation: "Je confirme que les informations ci-dessus sont exactes.",
  statut: "signe",
  client_nom: "Jeanne Test",
  client_telephone: "+33 612345678",
  client_email: "jeanne@example.com",
  signature: PNG,
  signe_le: "2026-11-02T14:42:00.000Z",
  empreinte: "a".repeat(64),
};

describe("bons de visite : formats", () => {
  it("formate la référence, le prix et les dates", () => {
    expect(bonReference(7)).toBe("BV-0007");
    expect(formatBonPrix(18000, "mois")).toBe("18 000 MAD par mois");
    expect(formatBonPrix(950.5, "nuit")).toBe("950,50 MAD par nuit");
    expect(formatBonDate("2026-11-02")).toBe("2 novembre 2026");
    // Marrakech = UTC+1 en novembre 2026.
    expect(formatBonSigneLe("2026-11-02T14:42:00.000Z")).toBe("2 novembre 2026 à 15:42");
  });

  it("construit le téléphone au format de la base", () => {
    expect(fullPhone("+212", "06 12 34 56 78")).toBe("+212 612345678");
    expect(fullPhone("+33", "6.12.34.56.78")).toBe("+33 612345678");
  });

  it("remplace les caractères absents des polices du PDF", () => {
    expect(pdfSafe("18 000 MAD l’agence « été »")).toBe("18 000 MAD l’agence « été »");
    expect(pdfSafe("محمد Ali")).toBe("???? Ali");
  });
});

describe("bons de visite : validation", () => {
  const ok = { nom: "Jeanne Test", indicatif: "+212", telephone: "0612345678", email: "", confirme: true };
  it("accepte une saisie complète avec signature", () => {
    expect(validateBon(ok, true)).toEqual({});
  });
  it("signale chaque champ manquant", () => {
    const errors = validateBon({ nom: " ", indicatif: "+212", telephone: "", email: "x@", confirme: false }, false);
    expect(Object.keys(errors).sort()).toEqual(["confirme", "email", "nom", "signature", "telephone"]);
  });
  it("traduit les erreurs du serveur", () => {
    expect(signErrorMessage({ message: "bon_deja_signe" }).alreadySigned).toBe(true);
    expect(signErrorMessage({ message: "telephone_invalide" }).field).toBe("telephone");
    expect(signErrorMessage(null).message).toMatch(/vos informations sont conservées/);
  });
});

describe("bons de visite : PDF", () => {
  it("contient les coordonnées, le bien, le texte accepté, la signature et la date", async () => {
    const doc = await buildBonPdf(SIGNED, { compress: false });
    const raw = doc.output();
    expect(raw.startsWith("%PDF-")).toBe(true);
    for (const text of ["Bon de visite virtuelle", "BV-0007", "Jeanne Test", "+33 612345678", "jeanne@example.com", "Villa Test avec piscine", "Route de Fès", "2 novembre 2026", "18 000 MAD par mois", "Je confirme que les informations ci-dessus sont exactes.", "15:42", "/Subtype /Image"]) {
      expect(raw).toContain(text);
    }
    expect(raw).not.toMatch(/certifi/i);
    if (process.env.BON_PDF_OUT) fs.writeFileSync(process.env.BON_PDF_OUT, Buffer.from(doc.output("arraybuffer")));
  });

  it("compresse le PDF par défaut", async () => {
    const plain = (await buildBonPdf(SIGNED, { compress: false })).output().length;
    const packed = (await buildBonPdf(SIGNED)).output().length;
    expect(packed).toBeLessThan(plain);
  });

  it("refuse de produire le PDF d'un bon non signé", async () => {
    await expect(buildBonPdf({ ...SIGNED, statut: "a-signer", signature: null, signe_le: null })).rejects.toThrow();
  });
});
