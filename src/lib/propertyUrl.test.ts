import { describe, expect, it } from "vitest";
import { FILE_PROPERTIES, fileProperty } from "./fileProperties";
import { propertyIdFromParam, propertyPath, shortSlug } from "./propertyUrl";

const id = "f15fbf1e-43b1-407d-a275-273457382ae1";
describe("permanent property URLs", () => {
  it("keeps the stored address when a title changes", () => {
    expect(propertyPath({ id, titre: "Nouveau titre", slug: "villa-apple-garden" })).toBe("/bien/villa-apple-garden");
  });
  it("resolves both historical formats and normalizes UUID casing", () => {
    expect(propertyIdFromParam(id.toUpperCase())).toBe(id);
    expect(propertyIdFromParam(`ancien-titre-${id}`)).toBe(id);
    expect(propertyIdFromParam("villa-apple-garden")).toBe("villa-apple-garden");
    expect(propertyIdFromParam(undefined)).toBeNull();
    expect(propertyIdFromParam(`prefix${id}`)).toBe(`prefix${id}`);
  });
  it("normalizes accents and cuts long titles on a word boundary", () => {
    expect(shortSlug("Élégante villa à Guéliz")).toBe("elegante-villa-a-gueliz");
    const slug = shortSlug("Villa Apple Garden avec piscine chauffée sans vis-à-vis");
    expect(slug).toBe("villa-apple-garden-avec-piscine-chauffee");
    expect(slug.length).toBeLessThanOrEqual(40);
  });
  it("all file properties have distinct slugs resolving to the same property as the UUID", () => {
    const slugs = FILE_PROPERTIES.map((property) => property.slug);
    expect(new Set(slugs).size).toBe(FILE_PROPERTIES.length);
    for (const property of FILE_PROPERTIES) {
      expect(property.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(fileProperty(property.slug!)).toBe(fileProperty(property.id));
    }
    expect(fileProperty(null)).toBeNull();
    expect(fileProperty("introuvable")).toBeNull();
  });
});
