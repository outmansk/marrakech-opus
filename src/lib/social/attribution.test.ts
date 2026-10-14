import { beforeEach, describe, expect, it, vi } from "vitest";

const { insert, rpc } = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn(() => Promise.resolve({ error: null })) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ insert }), rpc } }));

import { captureAttribution, insertWithOrigin, originRef } from "./attribution";

describe("origine des visiteurs", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); insert.mockReset(); rpc.mockClear(); });

  it("mémorise la référence d'un lien suivi et compte le clic une fois par session", () => {
    captureAttribution("?src=fb&g=3&p=12", "/bien/villa-elhaj-x");
    captureAttribution("?src=fb&g=3&p=12", "/bien/villa-elhaj-x");
    expect(originRef()).toBe("FB-12");
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("track_social_click", { p_code: 12, p_path: "/bien/villa-elhaj-x" });
  });

  it("ignore les liens sans paramètres valides", () => {
    captureAttribution("?src=inconnu&p=12", "/");
    captureAttribution("?src=fb&p=abc", "/");
    expect(originRef()).toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("oublie l'origine après 30 jours", () => {
    localStorage.setItem("lim_origin", JSON.stringify({ ref: "FB-12", at: Date.now() - 31 * 24 * 3600 * 1000 }));
    expect(originRef()).toBeNull();
  });

  it("envoie la référence avec le formulaire", async () => {
    captureAttribution("?src=ig&p=7", "/");
    insert.mockResolvedValueOnce({ error: null });
    await insertWithOrigin("contact_messages", { name: "A" });
    expect(insert).toHaveBeenCalledWith({ name: "A", origine_ref: "IG-7" });
  });

  it("réessaie sans la référence tant que la colonne n'existe pas", async () => {
    captureAttribution("?src=fb&p=12", "/");
    insert.mockResolvedValueOnce({ error: { code: "PGRST204", message: "Could not find the 'origine_ref' column" } }).mockResolvedValueOnce({ error: null });
    const result = await insertWithOrigin("visit_requests", { client_name: "A" });
    expect(insert).toHaveBeenNthCalledWith(2, { client_name: "A" });
    expect(result.error).toBeNull();
  });
});
