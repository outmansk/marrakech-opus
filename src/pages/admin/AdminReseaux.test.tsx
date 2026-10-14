import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Groupe, Publication } from "@/lib/social/model";

// Affiche les pages Réseaux sociaux avec des données de démonstration : aucune ne doit planter.

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 24 * 3600 * 1000).toISOString();
const groupes: Groupe[] = [
  { id: "g1", code: 1, nom: "Immobilier Marrakech", lien: "https://facebook.com/groups/a", reseau: "facebook", membres: 40000, type: "immo", langue: "fr", regles: "Une publication par semaine.", agences_interdites: false, immobilier_interdit: false, approbation_obligatoire: true, statut: "actif", statut_raison: null, created_at: iso(30) },
  { id: "g2", code: 2, nom: "Expats Marrakech", lien: null, reseau: "facebook", membres: 20000, type: "expat", langue: "en", regles: null, agences_interdites: true, immobilier_interdit: false, approbation_obligatoire: true, statut: "actif", statut_raison: null, created_at: iso(30) },
];
const pub = (id: string, code: number, over: Partial<Publication>): Publication => ({
  id, code, bien_id: "b1", bien_hors_site: null, groupe_id: "g1", reseau: "facebook", publie_le: iso(1), langue: "fr", texte_debut: "Villa à louer", nb_photos: 8,
  lien: null, publie_par: "moi", statut: "en-ligne", statut_change_le: iso(1), remarque: null, ...over,
});
const data = {
  missing: false,
  groupes,
  pubs: [pub("p1", 1, {}), pub("p2", 2, { statut: "en-attente", publie_le: iso(5), groupe_id: "g2", langue: "en" }), pub("p3", 3, { bien_id: null, bien_hors_site: "Maison Essaouira", publie_le: iso(0) }), pub("p4", 4, { bien_id: "b2" })],
  clics: [{ id: 1, publication_id: "p1", created_at: iso(1) }],
  alertes: [{ id: "a1", survenue_le: iso(2), reseau: "facebook" as const, type: "avertissement" as const, compte: "Principal", remarque: "Trop de publications" }],
  leads: [{ id: "l1", name: "Client A", status: "converti", bien_id: "b1", created_at: iso(1), origine_reseau: "facebook" as const, origine_groupe_id: "g1", origine_publication_id: "p1" }],
  visites: [{ id: "v1", property_v2_id: "b1", created_at: iso(1), origine_reseau: "facebook" as const, origine_groupe_id: null, origine_publication_id: "p1" }],
  biens: [
    { id: "b1", titre: "Villa Elhaj", reference: "elhaj", statut: "publie", type: "villa", services: ["location-longue-duree"], enBase: true },
    { id: "b2", titre: "villa avec piscine himri", reference: "himri", statut: "vendu-loue", type: "villa", services: ["location-longue-duree"], enBase: true },
  ],
};

vi.mock("@/hooks/useSocial", async (original) => ({
  ...(await original<typeof import("@/hooks/useSocial")>()),
  useSocialData: () => ({ data, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }) }) }) } }));

beforeAll(() => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
});

async function renderAt(path: string, element: React.ReactNode, route = "*") {
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={element} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe("pages Réseaux sociaux", () => {
  it("vue globale : chiffres et « À surveiller »", async () => {
    const { default: AdminReseaux } = await import("./AdminReseaux");
    await renderAt("/manage-xk92p/reseaux", <AdminReseaux />);
    expect(screen.getByText("À surveiller")).toBeTruthy();
    expect(screen.getAllByText("villa avec piscine himri").length).toBeGreaterThan(1); // bien loué encore en ligne
    expect(screen.getAllByText("Maison Essaouira").length).toBeGreaterThan(0); // bien hors site
    expect(screen.getByText("Clients venus des réseaux")).toBeTruthy();
  }, 30000); // premier test : chargement des modules (graphiques)

  it("journal des publications", async () => {
    const { default: Journal } = await import("./AdminReseauxJournal");
    await renderAt("/manage-xk92p/reseaux/journal", <Journal />);
    expect(screen.getAllByText("Villa Elhaj").length).toBeGreaterThan(0);
    expect(screen.getByText(/Exporter/)).toBeTruthy();
  });

  it("groupes et fiche groupe", async () => {
    const { default: Groupes } = await import("./AdminReseauxGroupes");
    await renderAt("/manage-xk92p/reseaux/groupes", <Groupes />);
    expect(screen.getAllByText("Immobilier Marrakech").length).toBeGreaterThan(0);
  });

  it("fiche groupe", async () => {
    const { default: Groupes } = await import("./AdminReseauxGroupes");
    await renderAt("/manage-xk92p/reseaux/groupes/g1", <Groupes />, "/manage-xk92p/reseaux/groupes/:id");
    expect(screen.getByText("Règles du groupe")).toBeTruthy();
    expect(screen.getByText("Client A")).toBeTruthy();
  });

  it("onglet Réseaux de la fiche bien", async () => {
    const { default: Panel } = await import("@/components/admin/social/BienSocialPanel");
    await renderAt("/", <Panel bienId="b1" />);
    expect(screen.getByText("Frise de diffusion")).toBeTruthy();
    expect(screen.getByText("Groupes pas encore utilisés")).toBeTruthy();
  });
});
