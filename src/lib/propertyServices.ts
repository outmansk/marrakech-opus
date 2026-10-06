import type { Bien, BienService } from "@/types/property";

/** Services offered for a listing, falling back to the legacy single `service` column. */
export const getServices = (property: Bien): BienService[] =>
  property.services?.length ? property.services : property.service ? [property.service] : [];

/** True when the listing is no longer available (statut "vendu-loue"). */
export const isUnavailable = (property: Pick<Bien, "statut">): boolean => property.statut === "vendu-loue";

/** A listing offered only for sale reads as "sold"; anything with a rental service reads as "rented". */
export const isSoldOnly = (property: Bien): boolean => {
  const services = getServices(property);
  return services.length > 0 && services.every((s) => s === "vente");
};
