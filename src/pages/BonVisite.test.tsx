import { forwardRef, useImperativeHandle } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BonVisite from "./BonVisite";
import type { BonVisitePublic } from "@/lib/bonsVisite";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { rpc } }));
// Le canvas n'existe pas dans jsdom : un faux cadre de signature.
vi.mock("@/components/bons/SignaturePad", () => ({
  default: forwardRef<{ clear: () => void; toDataURL: () => string | null }, { onChange: (v: boolean) => void }>(function FakePad({ onChange }, ref) {
    useImperativeHandle(ref, () => ({ clear: () => onChange(false), toDataURL: () => "data:image/png;base64,SIGNATURE" }));
    return <button type="button" onClick={() => onChange(true)}>Simuler une signature</button>;
  }),
}));

const JETON = "ab".repeat(32);
const PENDING: BonVisitePublic = {
  numero: 3, type_bien: "appartement", bien: "Appartement Test Prestigia", quartier: "Prestigia", date_visite: "2026-11-05",
  prix: 900, prix_unite: "nuit",
  texte: "Je confirme avoir effectué une visite du bien indiqué ci-dessus avec l’agence Live In Marrakech.\n\nCe document confirme uniquement la présentation du bien. Il ne constitue ni une réservation, ni un engagement de location ou d’achat.",
  texte_confirmation: "Je confirme que les informations ci-dessus sont exactes.",
  statut: "a-signer", client_nom: null, client_telephone: null, client_email: null, signature: null, signe_le: null, empreinte: null,
};
const SIGNED: BonVisitePublic = { ...PENDING, statut: "signe", client_nom: "Sara Test", client_telephone: "+212 612345678", client_email: null, signature: "data:image/png;base64,SIGNATURE", signe_le: "2026-11-05T10:00:00Z", empreinte: "f".repeat(64) };

function open(jeton = JETON) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/bon-visite/${jeton}`]}>
          <Routes><Route path="/bon-visite/:jeton" element={<BonVisite />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

function fillAndSign() {
  fireEvent.change(screen.getByLabelText(/Nom et prénom/), { target: { value: "Sara Test" } });
  fireEvent.change(screen.getByLabelText("Numéro de téléphone"), { target: { value: "06 12 34 56 78" } });
  fireEvent.click(screen.getByLabelText(/Je confirme que les informations ci-dessus sont exactes/));
  fireEvent.click(screen.getByRole("button", { name: "Simuler une signature" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  rpc.mockImplementation(async (fn: string) => (fn === "bon_visite_public" ? { data: [PENDING], error: null } : { data: [SIGNED], error: null }));
});
afterEach(() => { cleanup(); focusManager.setFocused(undefined); });

describe("Bon de visite à signer", () => {
  it("affiche le bon préparé par l'agence sans champ modifiable pour le bien", async () => {
    open();
    expect(await screen.findByText("Appartement Test Prestigia")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Bon de visite" })).toBeVisible();
    expect(screen.getByText("Live In Marrakech")).toBeVisible();
    expect(screen.getByText("900 MAD par nuit")).toBeVisible();
    expect(screen.getByText("5 novembre 2026")).toBeVisible();
    expect(screen.getByText(/Il ne constitue ni une réservation/)).toBeVisible();
    expect(screen.queryByDisplayValue("Appartement Test Prestigia")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Je confirme que les informations/)).not.toBeChecked();
    expect(rpc).toHaveBeenCalledWith("bon_visite_public", { p_jeton: JETON });
  });

  it("bloque l'envoi tant que les champs obligatoires et la signature manquent", async () => {
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Signer et envoyer" }));
    expect(screen.getByText("Indiquez votre nom et votre prénom.")).toBeVisible();
    expect(screen.getByText("Indiquez votre numéro de téléphone ou WhatsApp.")).toBeVisible();
    expect(screen.getByText("Cochez cette case pour confirmer vos informations.")).toBeVisible();
    expect(screen.getByText("Signez dans le cadre avant d’envoyer.")).toBeVisible();
    expect(screen.getByLabelText(/Nom et prénom/)).toHaveFocus();
    expect(rpc).not.toHaveBeenCalledWith("signer_bon_visite", expect.anything());
  });

  it("envoie le bon signé puis confirme et propose le PDF", async () => {
    open();
    await screen.findByRole("button", { name: "Signer et envoyer" });
    fillAndSign();
    fireEvent.change(screen.getByLabelText("Indicatif du pays"), { target: { value: "+33" } });
    fireEvent.click(screen.getByRole("button", { name: "Signer et envoyer" }));
    expect(await screen.findByText("Votre bon de visite a bien été envoyé. Merci.")).toBeVisible();
    expect(rpc).toHaveBeenCalledWith("signer_bon_visite", {
      p_jeton: JETON, p_nom: "Sara Test", p_telephone: "+33 612345678", p_email: null, p_signature: "data:image/png;base64,SIGNATURE",
    });
    expect(screen.getByRole("button", { name: "Télécharger une copie (PDF)" })).toBeVisible();
  });

  it("garde la saisie et n'affiche pas de confirmation si l'envoi échoue", async () => {
    rpc.mockImplementation(async (fn: string) => (fn === "bon_visite_public" ? { data: [PENDING], error: null } : { data: null, error: { message: "Failed to fetch" } }));
    open();
    await screen.findByRole("button", { name: "Signer et envoyer" });
    fillAndSign();
    fireEvent.click(screen.getByRole("button", { name: "Signer et envoyer" }));
    expect(await screen.findByText(/L’envoi a échoué/)).toBeVisible();
    expect(screen.queryByText(/bien été envoyé/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Nom et prénom/)).toHaveValue("Sara Test");
    expect(screen.getByLabelText("Numéro de téléphone")).toHaveValue("06 12 34 56 78");
    expect(screen.getByRole("button", { name: "Signer et envoyer" })).toBeEnabled();
  });

  it("montre un bon déjà signé avec sa copie PDF", async () => {
    rpc.mockResolvedValue({ data: [SIGNED], error: null });
    open();
    expect(await screen.findByText("Ce bon de visite a déjà été signé.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Télécharger une copie (PDF)" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Signer et envoyer" })).not.toBeInTheDocument();
  });

  it("refuse un lien incomplet sans interroger la base", async () => {
    open("abc");
    expect(await screen.findByText("Lien incomplet")).toBeVisible();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reste en chargement (et non « introuvable ») quand l'onglet passe en arrière-plan pendant une erreur", async () => {
    focusManager.setFocused(false);
    rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "schema cache" } });
    open();
    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText("Chargement du bon de visite…")).toBeVisible();
    expect(screen.queryByText("Bon de visite introuvable")).not.toBeInTheDocument();
  });

  it("indique un bon introuvable", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    open();
    expect(await screen.findByText("Bon de visite introuvable")).toBeVisible();
  });
});
