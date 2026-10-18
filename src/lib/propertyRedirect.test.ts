// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import middleware from "../../middleware";
import { FILE_PROPERTIES } from "./fileProperties";
const origin = "https://liveinmarrakech.com";
const id = "f15fbf1e-43b1-407d-a275-273457382ae1";
const property = { id, titre: "Villa Apple Garden", slug: "villa-apple-garden" };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function mockDatabase(rows: unknown[] = [property]) {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-key");
  const fetcher = vi.fn().mockResolvedValue(Response.json(rows));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
describe("legacy property HTTP redirects", () => {
  for (const prefix of ["", "/en", "/es"]) {
    for (const param of [id, `ancien-titre-${id}`]) {
      it(`redirects ${prefix}/bien/${param} directly with tracking`, async () => {
        mockDatabase();
        const response = await middleware(new Request(`${origin}${prefix}/bien/${param}?src=fb&g=3&p=12&utm_source=test`));
        expect(response?.status).toBe(301);
        expect(response?.headers.get("location")).toBe(`${origin}${prefix}/bien/villa-apple-garden?src=fb&g=3&p=12&utm_source=test`);
      });
    }
  }
  it("does not look up or redirect canonical short URLs", async () => {
    const fetcher = mockDatabase();
    expect(await middleware(new Request(`${origin}/bien/villa-apple-garden`))).toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not redirect a legacy fallback to itself before SQL migration", async () => {
    mockDatabase([{ id, titre: "Villa Apple Garden", slug: null }]);
    expect(await middleware(new Request(`${origin}/bien/villa-apple-garden-${id}`))).toBeUndefined();
  });
  it("redirects file properties without a network lookup", async () => {
    const fetcher = mockDatabase();
    for (const file of FILE_PROPERTIES) {
      const response = await middleware(new Request(`${origin}/es/bien/ancien-${file.id}?src=fb&p=12`));
      expect(response?.headers.get("location")).toBe(`${origin}/es/bien/${file.slug}?src=fb&p=12`);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not send missing properties to the catalogue", async () => {
    mockDatabase([]);
    expect(await middleware(new Request(`${origin}/bien/${id}`))).toBeUndefined();
  });
  it("lets the browser load the legacy link on a network error", async () => {
    mockDatabase().mockRejectedValue(new Error("Offline"));
    expect(await middleware(new Request(`${origin}/bien/${id}`))).toBeUndefined();
  });
  it("lets the browser load the legacy link on an HTTP error", async () => {
    mockDatabase().mockResolvedValue(new Response(null, { status: 503 }));
    expect(await middleware(new Request(`${origin}/bien/${id}`))).toBeUndefined();
  });
});
