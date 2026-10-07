import type { Bien } from "@/types/property";

const UUID_AT_END = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Readable address of a property: /bien/villa-piscine-palmeraie-<uuid>. Old /bien/<uuid> links keep working. */
export function propertyPath(property: Pick<Bien, "id" | "titre">) {
  const slug = slugify(property.titre || "").slice(0, 70).replace(/-$/, "");
  return `/bien/${slug ? `${slug}-` : ""}${property.id}`;
}

/** The property id inside a /bien/:id parameter, with or without the readable prefix. */
export function propertyIdFromParam(param: string | undefined) {
  return param?.match(UUID_AT_END)?.[1] ?? null;
}
