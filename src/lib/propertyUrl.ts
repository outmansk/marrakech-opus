import type { Bien } from "@/types/property";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Short slug for a new property (≤ 40 characters, cut at a word boundary): villa-golf-atlas. */
export function shortSlug(title: string) {
  const full = slugify(title);
  if (full.length <= 40) return full;
  const cut = full.slice(0, 40);
  return (cut.includes("-") && full[40] !== "-" ? cut.slice(0, cut.lastIndexOf("-")) : cut).replace(/-$/, "");
}

/**
 * Address of a property. New properties have a short stored slug: /bien/villa-golf-atlas.
 * Older ones (no slug) keep /bien/<title>-<uuid>; old /bien/<uuid> links still work.
 */
export function propertyPath(property: Pick<Bien, "id" | "titre"> & { slug?: string | null }) {
  if (property.slug) return `/bien/${property.slug}`;
  const slug = slugify(property.titre || "").slice(0, 70).replace(/-$/, "");
  return `/bien/${slug ? `${slug}-` : ""}${property.id}`;
}

/** What identifies the property in a /bien/:id parameter: its id (UUID, with or without prefix) or its short slug. */
export function propertyIdFromParam(param: string | undefined) {
  if (!param) return null;
  return (isUuid(param) ? param : param.match(new RegExp(`-(${UUID.source})$`, "i"))?.[1])?.toLowerCase() ?? param;
}

export const isUuid = (value: string) => new RegExp(`^${UUID.source}$`, "i").test(value);
