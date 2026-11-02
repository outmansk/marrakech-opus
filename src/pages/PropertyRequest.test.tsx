import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PropertyRequest from "./PropertyRequest";

const { insert, toastError } = vi.hoisted(() => ({ insert: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

/* Parcours « Décrire ma recherche » (design Stitch) : Projet → Critères → Coordonnées → Confirmation. */

function openRequest() {
  render(<HelmetProvider><MemoryRouter><PropertyRequest /></MemoryRouter></HelmetProvider>);
}
const project = (name: RegExp) => screen.getByRole("radio", { name });
const toCriteria = () => fireEvent.click(screen.getByRole("button", { name: "Continuer vers les critères" }));
const toContact = () => fireEvent.click(screen.getByRole("button", { name: "Valider et passer à mes coordonnées" }));
function fillContact(name = "Test Local", phone = "612345678") {
  fireEvent.change(screen.getByPlaceholderText("Ex: Alexandre de Montmirail"), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText("6 12 34 56 78"), { target: { value: phone } });
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Transmettre ma recherche" }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  insert.mockResolvedValue({ error: null });
});
afterEach(cleanup);

describe("Décrire ma recherche (parcours en 4 étapes)", () => {
  it("affiche l'étape 1 avec les trois projets et les trois types de bien", () => {
    openRequest();
    expect(screen.getByText("Étape 1 sur 3")).toBeVisible();
    for (const name of [/^Acheter/, /^Louer à l'année/, /^Séjourner/]) expect(project(name)).toBeInTheDocument();
    for (const name of [/^Villa/, /^Appartement/, /^Riad/]) expect(screen.getByRole("radio", { name })).toBeInTheDocument();
  });

  it("envoie une recherche d'achat avec le type, le budget, les chambres et le quartier choisis", async () => {
    openRequest();
    fireEvent.click(project(/^Acheter/));
    fireEvent.click(screen.getByRole("radio", { name: /^Appartement/ }));
    toCriteria();
    expect(screen.getByRole("heading", { name: "Vos critères de sélection" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "3M MAD" }));
    fireEvent.click(screen.getByRole("radio", { name: "2" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Guéliz (Vie urbaine, commerces, contemporain)" } });
    toContact();
    fillContact();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "+212" } });
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      name: "Test Local", phone: "+212 612345678", transaction_type: "vente", property_types: ["appartement"],
      budget_max: 3000000, bedrooms_min: 2, preferred_areas: ["Guéliz"], source: "Site web", status: "nouveau",
    }));
    expect(await screen.findByText("Demande transmise avec succès")).toBeVisible();
    expect(screen.getByRole("heading", { name: /Merci/ })).toHaveTextContent("Test");
  });

  it("propose des budgets mensuels en location à l'année et accepte un budget inconnu", async () => {
    openRequest();
    fireEvent.click(project(/^Louer à l'année/));
    toCriteria();
    expect(screen.getByRole("button", { name: "25k MAD" })).toBeVisible();
    expect(screen.getByText("MAD / mois")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Je ne sais pas encore" }));
    toContact();
    fillContact();
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ transaction_type: "location-longue-duree", budget_max: null }));
  });

  it("envoie un séjour court avec les voyageurs et le budget par nuit, puis propose WhatsApp", async () => {
    openRequest();
    fireEvent.click(project(/^Séjourner/));
    toCriteria();
    expect(screen.getByRole("heading", { name: "Vos dates & séjour" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("5")).toBeVisible();
    toContact();
    fillContact();
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    const payload = insert.mock.calls[0][0];
    expect(payload).toEqual(expect.objectContaining({ transaction_type: "location-courte-duree", client_profile: "5 personnes" }));
    expect(payload.notes).toContain("Séjour : 5 voyageurs.");
    expect(payload.notes).toContain("Budget nuit: 4 500 MAD");
    const whatsapp = await screen.findByRole("link", { name: "Accélérer la réponse sur WhatsApp" });
    expect(whatsapp.getAttribute("href")).toContain("S%C3%A9journer");
  });

  it("bloque l'envoi sans nom ou sans téléphone valable", () => {
    openRequest();
    toCriteria();
    toContact();
    fillContact("", "612345678");
    fireEvent.submit(screen.getByRole("button", { name: "Transmettre ma recherche" }).closest("form")!);
    expect(toastError).toHaveBeenLastCalledWith("Veuillez indiquer au moins votre prénom pour que nous sachions à qui nous adresser.");
    fillContact("Test Local", "123");
    fireEvent.submit(screen.getByRole("button", { name: "Transmettre ma recherche" }).closest("form")!);
    expect(toastError).toHaveBeenLastCalledWith("Veuillez saisir un numéro de téléphone mobile ou WhatsApp valide.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("garde les coordonnées après une erreur d'envoi et permet de réessayer", async () => {
    insert.mockResolvedValueOnce({ error: { message: "Unavailable" } });
    openRequest();
    toCriteria();
    toContact();
    fillContact();
    submit();
    await waitFor(() => expect(toastError).toHaveBeenLastCalledWith(expect.stringContaining("Une erreur est survenue lors de l'envoi")));
    expect(screen.queryByText("Demande transmise avec succès")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Alexandre de Montmirail")).toHaveValue("Test Local");
    expect(screen.getByPlaceholderText("6 12 34 56 78")).toHaveValue("612345678");
    submit();
    expect(await screen.findByText("Demande transmise avec succès")).toBeVisible();
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it("garde les critères en revenant en arrière depuis les coordonnées", () => {
    openRequest();
    fireEvent.click(screen.getByRole("radio", { name: /^Riad/ }));
    toCriteria();
    fireEvent.click(screen.getByRole("button", { name: "10M MAD" }));
    toContact();
    expect(screen.getByText(/Acheter Riad · 10 000 000 MAD/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    expect(screen.getByDisplayValue("10 000 000")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "← Modifier le type de bien" }));
    expect(screen.getByRole("radio", { name: /^Riad/ })).toBeChecked();
  });

  it("garde la sélection en changeant de langue, et passe en droite-à-gauche en arabe", () => {
    openRequest();
    fireEvent.click(project(/^Séjourner/));
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(project(/^Short stay/)).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "AR" }));
    expect(project(/^إقامة قصيرة/)).toBeChecked();
    expect(within(document.body).getByRole("main").parentElement).toHaveAttribute("dir", "rtl");
  });
});
