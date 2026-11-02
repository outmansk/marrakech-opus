import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminBonsVisite from "./AdminBonsVisite";

const { list, insert, single, downloadBonPdf } = vi.hoisted(() => ({ list: vi.fn(), insert: vi.fn(), single: vi.fn(), downloadBonPdf: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: (cols: string) => (cols === "signature"
        ? { eq: () => ({ single }) }
        : { order: list }),
      insert: (row: unknown) => { insert(row); return { select: () => ({ single }) }; },
      delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  },
}));
vi.mock("@/hooks/useBiens", () => ({ useProperties: () => ({ data: [] }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/bonsVisite", async (orig) => ({ ...(await orig<typeof import("@/lib/bonsVisite")>()), downloadBonPdf }));

const JETON = "cd".repeat(32);
const base = {
  type_bien: "villa", bien: "Villa Démo", quartier: "Route de Fès", date_visite: "2026-11-02", prix: 18000, prix_unite: "mois",
  texte: "…", texte_confirmation: "…", created_at: "2026-11-02T10:00:00Z",
};
const PENDING = { ...base, id: "1", numero: 1, jeton: JETON, statut: "a-signer", client_nom: null, client_telephone: null, client_email: null, signe_le: null, empreinte: null };
const SIGNED = { ...base, id: "2", numero: 2, jeton: "ef".repeat(32), statut: "signe", client_nom: "Claire Démo", client_telephone: "+33 612345678", client_email: null, signe_le: "2026-11-02T14:42:00Z", empreinte: "a".repeat(64) };

function open(path = "/manage-xk92p/bons-visite") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><AdminBonsVisite /></MemoryRouter></QueryClientProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  list.mockResolvedValue({ data: [PENDING, SIGNED], error: null });
});
afterEach(cleanup);

describe("Admin : bons de visite", () => {
  it("liste les bons avec leur statut et les actions adaptées", async () => {
    open();
    expect(await screen.findByText("Claire Démo", { exact: false })).toBeVisible();
    expect(screen.getByText("À signer", { selector: "span" })).toBeVisible();
    expect(screen.getByText("Signé", { selector: "span" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Envoyer sur WhatsApp" })).toHaveAttribute("href", expect.stringContaining(encodeURIComponent(`/bon-visite/${JETON}`)));
    expect(screen.getByRole("button", { name: "Télécharger le PDF" })).toBeVisible();
  });

  it("télécharge le PDF d'un bon signé avec sa signature", async () => {
    single.mockResolvedValue({ data: { signature: "data:image/png;base64,SIG" }, error: null });
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Télécharger le PDF" }));
    await waitFor(() => expect(downloadBonPdf).toHaveBeenCalledWith(expect.objectContaining({ numero: 2, client_nom: "Claire Démo", signature: "data:image/png;base64,SIG" })));
  });

  it("prépare un bon et donne le lien à envoyer", async () => {
    single.mockResolvedValue({ data: { ...PENDING, id: "3", numero: 3, jeton: "12".repeat(32) }, error: null });
    open("/manage-xk92p/bons-visite?new=1");
    fireEvent.click(await screen.findByRole("radio", { name: "Appartement" }));
    fireEvent.change(screen.getByLabelText("Référence ou description du bien"), { target: { value: "Appartement Démo (DP-26-DEMO)" } });
    fireEvent.change(screen.getByLabelText("Résidence / quartier"), { target: { value: "Prestigia" } });
    fireEvent.change(screen.getByLabelText("Prix proposé (MAD)"), { target: { value: "900" } });
    fireEvent.change(screen.getByLabelText("Unité du prix"), { target: { value: "nuit" } });
    fireEvent.click(screen.getByRole("button", { name: "Créer le bon et obtenir le lien" }));
    expect(await screen.findByText("Bon BV-0003 prêt")).toBeVisible();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ type_bien: "appartement", bien: "Appartement Démo (DP-26-DEMO)", quartier: "Prestigia", prix: 900, prix_unite: "nuit" }));
    expect(screen.getByText(`${window.location.origin}/bon-visite/${"12".repeat(32)}`)).toBeVisible();
  });

  it("refuse un bon sans prix valable", async () => {
    open("/manage-xk92p/bons-visite?new=1");
    fireEvent.change(await screen.findByLabelText("Référence ou description du bien"), { target: { value: "Villa Démo" } });
    fireEvent.change(screen.getByLabelText("Résidence / quartier"), { target: { value: "Palmeraie" } });
    fireEvent.change(screen.getByLabelText("Prix proposé (MAD)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Créer le bon et obtenir le lien" }));
    expect(await screen.findByText("Indiquez un prix en MAD supérieur à 0.")).toBeVisible();
    expect(insert).not.toHaveBeenCalled();
  });

  it("explique quoi faire tant que le SQL n'est pas lancé", async () => {
    list.mockResolvedValue({ data: null, error: { code: "PGRST205", message: "Could not find the table 'public.bons_visite' in the schema cache" } });
    open();
    expect(await screen.findByText("Bons de visite à activer")).toBeVisible();
    expect(screen.getByText(/20261102_bons_visite\.sql/)).toBeVisible();
  });
});
