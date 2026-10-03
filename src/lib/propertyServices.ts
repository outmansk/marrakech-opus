import type { Bien, BienService } from "@/types/property";

/** Services offered for a listing, falling back to the legacy single `service` column. */
export const getServices = (property: Bien): BienService[] =>
  property.services?.length ? property.services : property.service ? [property.service] : [];
