import { describe, expect, it } from "vitest";
import { NATIONALITES, profileText } from "@/lib/dealProfile";
import { dealLine, dealOf } from "@/lib/propertyDeals";
import type { Bien } from "@/types/property";

const bien = (patch: Partial<Bien>): Bien => ({
  id: "00000000-0000-0000-0000-000000000001", titre: "Villa Test", type: "villa", services: ["location-longue-duree"], service: null,
  prix_vente: null, prix_location_longue: 12000, prix_location_courte: null, prix: null, devise: "MAD",
  surface_habitable: null, surface_terrain: null, chambres: 3, salles_de_bain: 2, quartier: "Route de Fes",
  description_courte: null, description_longue: null, equipements: [], photos: [], photo_principale: null, proximites: [],
  statut: "vendu-loue", disponible_le: null, reference: null, latitude: null, longitude: null, created_at: "", updated_at: "",
  ...patch,
});

describe("profil anonyme du client", () => {
  it("accorde le type de client et la nationalité dans les trois langues", () => {
    expect(profileText("couple", "francaise", "fr")).toBe("un couple français");
    expect(profileText("couple", "francaise", "en")).toBe("a French couple");
    expect(profileText("couple", "francaise", "es")).toBe("una pareja francesa");
    expect(profileText("famille", "marocaine", "fr")).toBe("une famille marocaine");
    expect(profileText("client", "espagnole", "es")).toBe("un cliente español");
    expect(profileText("cliente", "americaine", "en")).toBe("an American client");
    expect(profileText("entreprise", null, "fr")).toBe("une entreprise");
  });

  it("a cinq formes pour chaque nationalité", () => {
    for (const forms of Object.values(NATIONALITES)) expect(forms).toHaveLength(5);
  });
});

describe("fiche « Déjà loué » saisie dans l'admin", () => {
  it("prend la base en priorité et compose la phrase du site", () => {
    const b = bien({ conclusion_client: "couple", conclusion_nationalite: "belge", conclusion_montant: 16000, conclusion_mois: "2026-11" });
    expect(dealLine(b, "fr")).toBe("Louée à un couple belge en novembre 2026 · 16 000 MAD / mois");
    expect(dealLine(b, "en")).toBe("Rented to a Belgian couple in November 2026 · 16,000 MAD / month");
  });

  it("met le montant en prix de vente pour un bien vendu", () => {
    const b = bien({ services: ["vente"], conclusion_client: "famille", conclusion_nationalite: "francaise", conclusion_montant: 3500000 });
    expect(dealOf(b)).toMatchObject({ prix: 3500000, loyer: null });
  });

  it("n'affiche rien tant que le bien n'est pas loué ou vendu", () => {
    expect(dealOf(bien({ statut: "publie", conclusion_client: "couple" }))).toBeNull();
  });

  it("ignore une valeur hors liste (aucun texte libre)", () => {
    expect(dealOf(bien({ conclusion_client: "M. Dupont", conclusion_montant: null, conclusion_mois: null }))).toBeNull();
  });
});
