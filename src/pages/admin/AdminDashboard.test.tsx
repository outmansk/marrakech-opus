import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tableau de bord avec des données simulées : indicateurs, liste « À faire », fiches à compléter.

const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 24 * 3600 * 1000).toISOString();
const bien = (id: string, over: Record<string, unknown>) => ({
  id, titre: `Bien ${id}`, statut: "publie", photo_principale: null, services: ["vente"], service: "vente", prix: null, prix_vente: 1000000,
  prix_location_longue: null, prix_location_courte: null, devise: "MAD", updated_at: iso(-1), meuble: null, quartier: "Gueliz",
  titre_en: "EN", titre_es: "ES", traduction_a_relire: false, ...over,
});

const tables: Record<string, { data?: unknown[]; count?: number }> = {
  properties_v2: { data: [
    bien("b1", {}),
    bien("b2", { titre: "Villa sans traduction", services: ["location-longue-duree"], titre_en: null, titre_es: null }),
    bien("b3", { statut: "vendu-loue" }),
  ] },
  visit_requests: { data: [{ id: "v1", client_name: "Mme Durand", client_phone: "0612345678", requested_date: iso(1), property_v2_id: "b1" }] },
  client_leads: { data: [{ id: "l1", name: "M. Martin", phone: "0611111111", status: "nouveau", next_follow_up_at: null, created_at: iso(-2), transaction_type: "vente", budget_min: null, budget_max: 3000000, preferred_areas: ["Gueliz"] }], count: 2 },
  taches: { data: [{ id: "t1", type: "appel", titre: "Rappeler le propriétaire", echeance: iso(-1), fait: false, contact: { nom: "Ahmed", telephone: "0622222222" } }] },
  contact_messages: { data: [] },
  social_publications: { data: [] },
};

// Chaînable comme le client Supabase : chaque filtre renvoie la même requête, `await` donne { data, count }.
function query(table: string) {
  const result = { data: tables[table]?.data ?? [], count: tables[table]?.count ?? tables[table]?.data?.length ?? 0, error: null };
  const q: Record<string, unknown> = {};
  for (const method of ["select", "not", "order", "eq", "lte", "gte", "lt", "in"]) q[method] = () => q;
  q.then = (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve);
  return q;
}
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => query(table) } }));

describe("tableau de bord", () => {
  it("affiche les indicateurs, la liste « À faire » et les fiches à compléter", async () => {
    const { default: AdminDashboard } = await import("./AdminDashboard");
    render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><AdminDashboard /></MemoryRouter></QueryClientProvider>);

    const kpis = await screen.findByLabelText("Indicateurs");
    expect(within(kpis).getByText("Visites à confirmer").parentElement?.textContent).toContain("1");
    expect(within(kpis).getByText("Biens en ligne").parentElement?.textContent).toContain("2");
    expect(within(kpis).getByText("Nouveaux clients").parentElement?.textContent).toContain("2");

    expect(screen.getByText("Rappeler le propriétaire")).toBeTruthy();
    expect(screen.getByText("Mme Durand")).toBeTruthy();
    expect(screen.getByText("M. Martin")).toBeTruthy();

    expect(screen.getByText("Fiches à compléter")).toBeTruthy();
    // Plus de blog ni de graphiques sur le tableau de bord.
    expect(screen.queryByText("Derniers articles")).toBeNull();
    expect(screen.queryByText("Biens par type")).toBeNull();
  }, 30000);
});
