import overrides from "@/content/propertyOverrides.json";
import type { Bien } from "@/types/property";

type Override = { dbUpdatedAt: string; fields: Partial<Bien> };
const OVERRIDES = overrides as unknown as Record<string, Override>;

/**
 * Applies the agency's confirmed corrections (src/content/propertyOverrides.json) to a row,
 * as long as the row has not been edited in the admin since the correction was written.
 */
export function withOverrides<T extends Pick<Bien, "id" | "updated_at">>(bien: T): T {
  const override = OVERRIDES[bien.id];
  if (!override || !bien.updated_at) return bien;
  if (new Date(bien.updated_at).getTime() > new Date(override.dbUpdatedAt).getTime()) return bien;
  return { ...bien, ...override.fields };
}
