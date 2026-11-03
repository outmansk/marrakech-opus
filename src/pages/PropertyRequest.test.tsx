import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PropertyRequest from "./PropertyRequest";

const { insert, toastError } = vi.hoisted(() => ({ insert: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

/* « Décrire ma recherche » : une question par écran, réponses en un toucher, puis coordonnées et confirmation. */

function openRequest(path = "/demande") {
  render(<HelmetProvider><MemoryRouter initialEntries={[path]}><PropertyRequest /></MemoryRouter></HelmetProvider>);
}
/** Touch an answer, then wait for the next question (single choices move on by themselves). */
async function answer(name: RegExp, next: RegExp) {
  fireEvent.click(screen.getByRole("radio", { name }));
  await screen.findByRole("heading", { name: next });
}
function fillContact({ name = "Claire Martin", phone = "+33 6 12 34 56 78", consent = true } = {}) {
  fireEvent.change(screen.getByLabelText("Votre nom"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Téléphone ou WhatsApp, avec l’indicatif"), { target: { value: phone } });
  if (consent) fireEvent.click(screen.getByRole("checkbox"));
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Envoyer ma recherche" }));
const sent = () => insert.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  insert.mockResolvedValue({ error: null });
});
afterEach(cleanup);

describe("Décrire ma recherche (questionnaire)", () => {
  it("commence par le titre et les trois projets, sans réponse présélectionnée", () => {
    openRequest();
    expect(screen.getByRole("heading", { level: 1, name: "Trouvons votre bien à Marrakech" })).toBeInTheDocument();
    for (const name of [/^Acheter/, /^Louer à l’année/, /^Séjourner/]) {
      expect(screen.getByRole("radio", { name })).toHaveAttribute("aria-checked", "false");
    }
  }, 20000);

  it("achat d'une villa pour Airbnb : envoie le type, le budget, les chambres, les quartiers et les préférences", async () => {
    openRequest();
    await answer(/^Acheter/, /Quel type de bien/);
    expect(screen.getByRole("radio", { name: /^Terrain/ })).toBeInTheDocument();
    await answer(/^Villa/, /C’est pour/);
    await answer(/type Airbnb/, /Quel style/);
    await answer(/^Beldi modernisé/, /grand jardin/);
    await answer(/^Indispensable, j’adore/, /piscine/);
    await answer(/^Un plus/, /Combien de chambres/);
    await answer(/^4$/, /Des quartiers/);
    fireEvent.click(screen.getByRole("checkbox", { name: /Route de Fès/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Palmeraie/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continuer/ }));
    await answer(/^3 M à 5 M MAD/, /Pour quand/);
    await answer(/^Dans 1 à 3 mois/, /Dernière étape/);

    // Les réponses restent visibles et cliquables.
    expect(screen.getByRole("button", { name: "Pour Airbnb" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jardin : indispensable, j’adore" })).toBeInTheDocument();

    fillContact();
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(sent()).toEqual(expect.objectContaining({
      name: "Claire Martin", phone: "+33 6 12 34 56 78", source: "Site web", status: "nouveau", created_by: null,
      transaction_type: "vente", property_types: ["villa"], budget_min: 3_000_000, budget_max: 5_000_000,
      bedrooms_min: 4, preferred_areas: ["Route de Fès", "Palmeraie"], furnishing: "any",
    }));
    for (const line of ["Usage : La louer aux vacanciers (type Airbnb)", "Style : Beldi modernisé", "Jardin : Indispensable, j’adore", "Piscine : Un plus, pas obligatoire", "Quand : Dans 1 à 3 mois"]) {
      expect(sent().notes).toContain(line);
    }
    expect(sent().notes).toMatch(/Réf : LIM-[0-9A-Z]{6}/);
    expect(await screen.findByRole("heading", { name: "Merci Claire, c’est envoyé !" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continuer sur WhatsApp/ }).getAttribute("href")).toContain("wa.me/212605387041");
  }, 20000);

  it("location d'un appartement : pas de question jardin, le statut meublé va dans sa colonne", async () => {
    openRequest();
    await answer(/^Louer à l’année/, /Quel type de bien/);
    expect(screen.queryByRole("radio", { name: /^Terrain/ })).toBeNull();
    await answer(/^Appartement/, /Qui va y habiter/);
    await answer(/^En couple/, /Quel style/);
    await answer(/^Moderne/, /Et la piscine/);
    await answer(/^Pas nécessaire/, /Meublé ou vide/);
    await answer(/^Meublé/, /Combien de chambres/);
    await answer(/^2$/, /Des quartiers/);
    fireEvent.click(screen.getByRole("button", { name: /Passer/ }));
    await screen.findByRole("heading", { name: /Quel budget/ });
    expect(screen.getByRole("radio", { name: /^8\s000 à 12\s000 MAD \/ mois/ })).toBeInTheDocument();
    await answer(/^Je ne sais pas encore/, /Pour quand/);
    await answer(/^Dès que possible/, /Dernière étape/);
    fillContact();
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(sent()).toEqual(expect.objectContaining({
      transaction_type: "location-longue-duree", property_types: ["appartement"], furnishing: "furnished",
      budget_min: null, budget_max: null, bedrooms_min: 2, preferred_areas: [], client_profile: "En couple",
    }));
    expect(sent().notes).not.toContain("Jardin");
  }, 20000);

  it("séjour : voyageurs, occasion, budget par nuit et dates", async () => {
    openRequest();
    await answer(/^Séjourner/, /Quel type de bien/);
    await answer(/^Riad/, /Vous serez combien/);
    await answer(/^5 à 8 personnes/, /Pour quelle occasion/);
    await answer(/^Un événement/, /Quel style/);
    await answer(/^Beldi traditionnel/, /Et la piscine/);
    await answer(/^Indispensable/, /Combien de chambres/);
    await answer(/^4$/, /Des quartiers/);
    fireEvent.click(screen.getByRole("checkbox", { name: /Médina/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continuer/ }));
    await answer(/^1\s500 à 3\s000 MAD \/ nuit/, /Vos dates/);
    fireEvent.change(screen.getByLabelText("Arrivée"), { target: { value: "2026-12-20" } });
    fireEvent.change(screen.getByLabelText("Départ"), { target: { value: "2026-12-27" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuer/ }));
    await screen.findByRole("heading", { name: /Dernière étape/ });
    expect(screen.getByRole("button", { name: "20/12 → 27/12" })).toBeInTheDocument();
    fillContact();
    submit();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(sent()).toEqual(expect.objectContaining({
      transaction_type: "location-courte-duree", property_types: ["riad"], budget_min: 1500, budget_max: 3000,
      available_from: "2026-12-20", client_profile: "5 à 8 personnes", preferred_areas: ["Médina"],
    }));
    expect(sent().notes).toContain("Occasion : Un événement");
    expect(sent().notes).toContain("Dates : du 2026-12-20 au 2026-12-27");
  }, 20000);

  it("revient à une question en touchant une réponse du résumé, sans perdre les autres", async () => {
    openRequest();
    await answer(/^Acheter/, /Quel type de bien/);
    await answer(/^Villa/, /C’est pour/);
    fireEvent.click(screen.getByRole("button", { name: "Acheter" }));
    await screen.findByRole("heading", { name: /Quel est votre projet/ });
    expect(screen.getByRole("radio", { name: /^Acheter/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Villa" })).toBeInTheDocument();
  }, 20000);

  it("bloque l'envoi sans nom, sans téléphone valable ou sans accord", async () => {
    openRequest();
    await answer(/^Acheter/, /Quel type de bien/);
    await answer(/^Terrain/, /C’est pour/);
    await answer(/^Un investissement/, /Des quartiers/);
    fireEvent.click(screen.getByRole("button", { name: /Passer/ }));
    await answer(/^Je ne sais pas encore/, /Pour quand/);
    await answer(/^Je regarde seulement/, /Dernière étape/);

    fillContact({ name: "C", consent: false });
    submit();
    expect(toastError).toHaveBeenLastCalledWith("Indiquez votre nom (2 lettres minimum).");
    fillContact({ phone: "1234", consent: false });
    submit();
    expect(toastError).toHaveBeenLastCalledWith(expect.stringContaining("numéro valide"));
    fillContact({ consent: false });
    submit();
    expect(toastError).toHaveBeenLastCalledWith("Cochez la case pour que nous puissions vous contacter.");
    expect(insert).not.toHaveBeenCalled();
  }, 20000);

  it("garde les réponses et les coordonnées si l'envoi échoue", async () => {
    insert.mockResolvedValueOnce({ error: { message: "network" } });
    openRequest();
    await answer(/^Acheter/, /Quel type de bien/);
    await answer(/^Terrain/, /C’est pour/);
    await answer(/^Un investissement/, /Des quartiers/);
    fireEvent.click(screen.getByRole("button", { name: /Passer/ }));
    await answer(/^Je ne sais pas encore/, /Pour quand/);
    await answer(/^Je regarde seulement/, /Dernière étape/);
    fillContact();
    submit();
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringContaining("L’envoi n’a pas abouti")));
    expect(screen.getByLabelText("Votre nom")).toHaveValue("Claire Martin");
    submit();
    await screen.findByRole("heading", { name: /Merci Claire/ });
  }, 20000);

  it("s'affiche en anglais sous /en", () => {
    openRequest("/en/demande");
    expect(screen.getByRole("heading", { level: 1, name: "Let’s find your home in Marrakech" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^Rent long term/ })).toBeInTheDocument();
  });
});
