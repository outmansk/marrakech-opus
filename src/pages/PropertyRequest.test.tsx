import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PropertyRequest from "./PropertyRequest";

const { insert, toastError } = vi.hoisted(() => ({ insert: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/components/Header", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));

function openRequest(project = "Louer longue durée") {
  render(<MemoryRouter><PropertyRequest /></MemoryRouter>);
  fireEvent.click(screen.getByRole("radio", { name: project }));
  fireEvent.change(screen.getByLabelText("Le quartier idéal"), { target: { value: "Hivernage" } });
  fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  insert.mockResolvedValue({ error: null });
});
afterEach(cleanup);

describe("Property request guided flow", () => {
  it("starts without a project and unlocks the neighbourhood only after choosing one", () => {
    render(<MemoryRouter><PropertyRequest /></MemoryRouter>);
    expect(screen.getByLabelText("Le quartier idéal")).toBeDisabled();
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choisissez votre projet");
    expect(screen.getByRole("radio", { name: "Acheter" })).toHaveFocus();
    fireEvent.click(screen.getByRole("radio", { name: "Acheter" }));
    expect(screen.getByLabelText("Le quartier idéal")).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ["Acheter", "Budget total d’achat (MAD)"],
    ["Louer longue durée", "Budget mensuel de location (MAD)"],
    ["Séjourner", "Budget par nuit (MAD)"],
  ])("retains the neighbourhood and uses the appropriate budget for %s", (project, budget) => {
    openRequest(project);
    expect(screen.getByText(budget)).toBeVisible();
    expect(screen.getByLabelText("Quartiers souhaités")).toHaveValue("Hivernage");
    expect(screen.getByText("2 / 3")).toBeVisible();
  });

  it("validates criteria and keeps them when going back from contact details", () => {
    openRequest();
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(toastError).toHaveBeenLastCalledWith("Choisissez au moins un type de bien.");
    fireEvent.click(screen.getByRole("button", { name: "Villa" }));
    fireEvent.change(screen.getByLabelText("Minimum"), { target: { value: "12000" } });
    fireEvent.change(screen.getByLabelText("Maximum"), { target: { value: "10000" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(toastError).toHaveBeenLastCalledWith("Le maximum doit être supérieur au minimum.");
    fireEvent.change(screen.getByLabelText("Maximum"), { target: { value: "20000" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(screen.getByRole("heading", { name: "Pour vous répondre" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retour" }));
    expect(screen.getByLabelText("Minimum")).toHaveValue(12000);
    expect(screen.getByRole("button", { name: "Villa" })).toHaveAttribute("aria-pressed", "true");
  });

  it("does not carry a monthly budget into a nightly request when the project changes", () => {
    openRequest();
    fireEvent.change(screen.getByLabelText("Minimum"), { target: { value: "12000" } });
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon projet" }));
    expect(screen.getByRole("radio", { name: "Louer longue durée" })).toBeChecked();
    expect(screen.getByLabelText("Le quartier idéal")).toHaveValue("Hivernage");
    fireEvent.click(screen.getByRole("radio", { name: "Séjourner" }));
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    expect(screen.getByLabelText("Minimum")).toHaveValue(null);
    expect(screen.getByLabelText("Date d’arrivée souhaitée")).toBeVisible();
  });

  it("submits a short-stay request with its correct intent, then shows success (mocked database)", async () => {
    openRequest("Séjourner");
    fireEvent.click(screen.getByRole("button", { name: "Villa" }));
    fireEvent.change(screen.getByLabelText("Minimum"), { target: { value: "1500" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    fireEvent.change(screen.getByLabelText("Votre nom"), { target: { value: "Test Local" } });
    fireEvent.change(screen.getByLabelText("Téléphone WhatsApp"), { target: { value: "+212600000000" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma recherche" }));
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      transaction_type: "location-courte-duree", preferred_areas: ["Hivernage"],
      property_types: ["villa"], budget_min: 1500, source: "Site web", status: "nouveau",
    }));
    expect(await screen.findByRole("heading", { name: "Merci, votre recherche est bien reçue." })).toBeVisible();
    expect(screen.getByRole("link", { name: "Continuer sur WhatsApp" }).getAttribute("href")).toContain("S%C3%A9journer");
  });

  it("retains contact details on an error and allows a retry", async () => {
    insert.mockResolvedValueOnce({ error: { message: "Unavailable" } });
    openRequest("Acheter");
    fireEvent.click(screen.getByRole("button", { name: "Appartement" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    fireEvent.change(screen.getByLabelText("Votre nom"), { target: { value: "Test Local" } });
    fireEvent.change(screen.getByLabelText("Téléphone WhatsApp"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma recherche" }));
    expect(insert).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenLastCalledWith("Ajoutez un numéro WhatsApp valide.");
    fireEvent.change(screen.getByLabelText("Téléphone WhatsApp"), { target: { value: "+212600000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma recherche" }));
    await waitFor(() => expect(toastError).toHaveBeenLastCalledWith(expect.stringContaining("L’envoi n’a pas abouti")));
    expect(screen.getByLabelText("Votre nom")).toHaveValue("Test Local");
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma recherche" }));
    expect(await screen.findByRole("heading", { name: "Merci, votre recherche est bien reçue." })).toBeVisible();
  });

  it("preserves the selection across English and Arabic translations", () => {
    render(<MemoryRouter><PropertyRequest /></MemoryRouter>);
    fireEvent.click(screen.getByRole("radio", { name: "Séjourner" }));
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("radio", { name: "Short stay" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "AR" }));
    expect(screen.getByRole("radio", { name: "إقامة قصيرة" })).toBeChecked();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("dir", "rtl");
  });
});
