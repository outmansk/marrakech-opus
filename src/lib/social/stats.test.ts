import { describe, expect, it } from "vitest";
import type { Groupe, LeadOrigine, Publication } from "./model";
import { pubRef } from "./model";
import {
  approvalRate, dayKey, duplicates, groupScore, groupStats, kpis, lastDays, pace, pendingTooLong,
  rentedStillOnline, toCsv, trackedUrl, unusedGroupsFor,
} from "./stats";

let n = 0;
const pub = (over: Partial<Publication>): Publication => ({
  id: `p${++n}`, code: n, bien_id: "b1", bien_hors_site: null, groupe_id: "g1", reseau: "facebook",
  publie_le: "2026-10-13T10:00:00Z", langue: "fr", texte_debut: null, nb_photos: null, lien: null,
  publie_par: "moi", statut: "en-ligne", statut_change_le: "2026-10-13T10:00:00Z", remarque: null, ...over,
});
const groupe = (over: Partial<Groupe>): Groupe => ({
  id: "g1", code: 1, nom: "Groupe", lien: null, reseau: "facebook", membres: 10000, type: "immo", langue: "fr",
  regles: null, agences_interdites: false, immobilier_interdit: false, approbation_obligatoire: false,
  statut: "actif", statut_raison: null, created_at: "2026-10-01T00:00:00Z", ...over,
});
const lead = (over: Partial<LeadOrigine>): LeadOrigine => ({
  id: `l${++n}`, name: "Client", status: "nouveau", bien_id: "b1", created_at: "2026-10-13T12:00:00Z",
  origine_reseau: "facebook", origine_groupe_id: null, origine_publication_id: null, ...over,
});

describe("taux d'approbation", () => {
  it("compte en ligne et expirées sur celles qui ont eu une réponse", () => {
    expect(approvalRate([pub({ statut: "en-ligne" }), pub({ statut: "expiree" }), pub({ statut: "refusee" }), pub({ statut: "en-attente" })])).toBeCloseTo(2 / 3);
  });
  it("vaut null tant qu'aucune réponse n'est arrivée", () => {
    expect(approvalRate([pub({ statut: "en-attente" })])).toBeNull();
  });
});

describe("clients par groupe", () => {
  it("rattache les clients via la publication, ou via le groupe saisi à la main", () => {
    const g1 = groupe({ id: "g1", membres: 2000 });
    const g2 = groupe({ id: "g2", code: 2 });
    const a = pub({ id: "pa", groupe_id: "g1" });
    const b = pub({ id: "pb", groupe_id: "g2" });
    const leads = [
      lead({ origine_publication_id: "pa" }),
      lead({ origine_publication_id: "pa" }),
      lead({ origine_groupe_id: "g1" }),
      lead({ origine_publication_id: "pb", origine_groupe_id: "g1" }), // la publication fait foi
      lead({ origine_reseau: null }), // pas venu des réseaux
    ];
    const [s1, s2] = groupStats([g1, g2], [a, b], [{ id: 1, publication_id: "pa", created_at: a.publie_le }], leads);
    expect(s1.clients).toBe(3);
    expect(s1.pour1000).toBe(1.5);
    expect(s1.clics).toBe(1);
    expect(s2.clients).toBe(1);
  });

  it("classe les groupes", () => {
    expect(groupScore({ publications: 2, clients: 1, approbation: 1 })).toBe("garder");
    expect(groupScore({ publications: 3, clients: 0, approbation: 1 })).toBe("abandonner");
    expect(groupScore({ publications: 4, clients: 0, approbation: 0.2 })).toBe("abandonner");
    expect(groupScore({ publications: 1, clients: 0, approbation: null })).toBe("surveiller");
  });
});

describe("doublons", () => {
  it("signale le même bien dans le même groupe à moins de 7 jours", () => {
    const list = [
      pub({ publie_le: "2026-10-01T10:00:00Z" }),
      pub({ publie_le: "2026-10-05T10:00:00Z" }),
      pub({ publie_le: "2026-10-20T10:00:00Z" }),
      pub({ publie_le: "2026-10-05T11:00:00Z", groupe_id: "g2" }),
      pub({ publie_le: "2026-10-05T12:00:00Z", bien_id: null, bien_hors_site: "Maison Essaouira" }),
    ];
    const found = duplicates(list);
    expect(found).toHaveLength(1);
    expect(found[0].first.publie_le).toBe("2026-10-01T10:00:00Z");
  });
  it("ignore les publications refusées", () => {
    expect(duplicates([pub({ statut: "refusee" }), pub({ publie_le: "2026-10-14T10:00:00Z" })])).toHaveLength(0);
  });
});

describe("rythme du jour", () => {
  const now = new Date("2026-10-13T20:00:00Z");
  it("alerte au-delà de 5 publications", () => {
    const list = Array.from({ length: 6 }, (_, i) => pub({ publie_le: `2026-10-13T${String(9 + i).padStart(2, "0")}:00:00Z` }));
    expect(pace(list, now)).toMatchObject({ today: 6, tooMany: true, tooClose: 0, alert: true });
  });
  it("alerte quand deux publications ont moins de 10 minutes d'écart", () => {
    const list = [pub({ publie_le: "2026-10-13T09:00:00Z" }), pub({ publie_le: "2026-10-13T09:05:00Z" })];
    expect(pace(list, now)).toMatchObject({ today: 2, tooMany: false, tooClose: 1, alert: true });
  });
  it("utilise le jour de Casablanca", () => {
    expect(dayKey("2026-10-13T23:30:00Z")).toBe("2026-10-14");
  });
});

describe("à surveiller", () => {
  it("bien loué encore en ligne ou en attente", () => {
    const biens = [{ id: "b1", titre: "villa avec piscine himri", statut: "vendu-loue" }, { id: "b2", titre: "Autre", statut: "publie" }];
    const list = [pub({ bien_id: "b1" }), pub({ bien_id: "b1", statut: "en-attente" }), pub({ bien_id: "b1", statut: "supprimee" }), pub({ bien_id: "b2" })];
    const found = rentedStillOnline(list, biens);
    expect(found).toHaveLength(1);
    expect(found[0].pubs).toHaveLength(2);
  });
  it("publications en attente depuis plus de 3 jours", () => {
    const now = new Date("2026-10-20T10:00:00Z");
    expect(pendingTooLong([pub({ statut: "en-attente", publie_le: "2026-10-16T09:00:00Z" }), pub({ statut: "en-attente", publie_le: "2026-10-18T10:00:00Z" })], now)).toHaveLength(1);
  });
  it("groupes non utilisés qui acceptent les agences et l'immobilier", () => {
    const groupes = [groupe({ id: "g1" }), groupe({ id: "g2", agences_interdites: true }), groupe({ id: "g3", immobilier_interdit: true }), groupe({ id: "g4" }), groupe({ id: "g5", statut: "a-eviter" })];
    expect(unusedGroupsFor("b1", groupes, [pub({ groupe_id: "g1" })]).map((g) => g.id)).toEqual(["g4"]);
  });
});

describe("chiffres de la période", () => {
  it("compte publications, clients et biens conclus", () => {
    const { current } = lastDays(7, new Date("2026-10-14T00:00:00Z"));
    const k = kpis({
      pubs: [pub({}), pub({ statut: "refusee" }), pub({ publie_le: "2026-09-01T10:00:00Z" })],
      clics: [{ id: 1, publication_id: "x", created_at: "2026-10-13T11:00:00Z" }],
      leads: [lead({ status: "converti" }), lead({ origine_reseau: null })],
      visites: [{ id: "v", property_v2_id: "b1", created_at: "2026-10-13T13:00:00Z", origine_reseau: "facebook", origine_groupe_id: null, origine_publication_id: null }],
    }, current);
    expect(k).toMatchObject({ publications: 2, enLigne: 1, refusees: 1, approbation: 0.5, clics: 1, clients: 1, visites: 1, conclus: 1 });
  });
});

describe("liens et export", () => {
  it("génère le lien suivi et la référence WhatsApp", () => {
    const p = pub({ code: 12 });
    expect(trackedUrl("https://liveinmarrakech.com", "/bien/villa-elhaj-x", p, { code: 3 })).toBe("https://liveinmarrakech.com/bien/villa-elhaj-x?src=fb&g=3&p=12");
    expect(pubRef(p)).toBe("FB-12");
  });
  it("échappe les cellules CSV", () => {
    expect(toCsv([["a;b", 'il dit "oui"', null]])).toBe('﻿"a;b";"il dit ""oui""";');
  });
});
