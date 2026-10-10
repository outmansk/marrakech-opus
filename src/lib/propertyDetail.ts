import type { Bien } from "@/types/property";
import { getServices, isUnavailable } from "@/lib/propertyServices";
import { zoneOf } from "@/content/zones";

// Helpers of the property page (src/pages/PropertyDetail.tsx, src/components/property/).

export const formatPrice = (price: number, devise = "MAD") => `${new Intl.NumberFormat("fr-MA").format(price)} ${devise}`;

type Block = { title: string | null; body: string };

/** Splits a description into blocks; a short first line without final punctuation is the block's heading. */
export function descriptionBlocks(text: string): Block[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      const heading = rest.length > 0 && first.trim().length <= 60 && !/[.:!?]$/.test(first.trim()) && !first.trim().startsWith("•");
      return heading ? { title: first.trim(), body: rest.join("\n").trim() } : { title: null, body: block };
    });
}

// Same query as the catalogue (prefetched for the pre-render in entry-server.tsx).
export const SIMILAR_QUERY = { statut: ["publie", "vendu-loue"] };

/** Up to 3 available properties offered for the same service, same type and area first. */
export function similarTo(property: Bien, all: Bien[]) {
  const services = getServices(property);
  const zone = zoneOf(property);
  return all
    .filter((other) => other.id !== property.id && !isUnavailable(other) && getServices(other).some((s) => services.includes(s)))
    .map((other) => ({ other, score: (other.type === property.type ? 2 : 0) + (zone && zoneOf(other) === zone ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ other }) => other);
}

