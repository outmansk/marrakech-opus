import data from "@/content/fileProperties.json";
import type { Bien } from "@/types/property";

/** Properties written in src/content/fileProperties.json (not yet in the database). */
export const FILE_PROPERTIES = data.properties as unknown as Bien[];

export const fileProperty = (id: string | null) => FILE_PROPERTIES.find((property) => property.id === id) ?? null;

type Filters = { type?: string; service?: string; statut?: string | string[]; quartier?: string };

/**
 * Adds the file properties matching the same filters as the database query, newest first.
 * Public queries only (they always filter on statut): the admin lists database rows it can edit.
 */
export function withFileProperties(rows: Bien[], filters?: Filters): Bien[] {
  if (!filters?.statut) return rows;
  const statuts = Array.isArray(filters.statut) ? filters.statut : [filters.statut];
  const extra = FILE_PROPERTIES.filter((property) =>
    statuts.includes(property.statut) &&
    (!filters.type || property.type === filters.type) &&
    (!filters.service || property.services.includes(filters.service as Bien["services"][number])) &&
    (!filters.quartier || property.quartier === filters.quartier) &&
    !rows.some((row) => row.id === property.id));
  if (!extra.length) return rows;
  return [...rows, ...extra].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
