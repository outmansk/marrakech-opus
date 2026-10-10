import type { Bien } from "@/types/property";
import { furnishedOf } from "@/content/zones";
import { getServices } from "@/lib/propertyServices";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/** "Furnished · deposit 1 month" / "Unfurnished · deposit 1 month" on long-term rentals; nothing while not specified. */
export default function FurnishedBadge({ property, className = "" }: { property: Pick<Bien, "id" | "meuble" | "services" | "service">; className?: string }) {
  const tL = useLocalizedText();
  const furnished = furnishedOf(property);
  if (furnished === null || !getServices(property as Bien).includes("location-longue-duree")) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${className}`}>
      <span className="bg-[#5f6746] px-2 py-1 font-semibold uppercase tracking-[0.1em] text-white">
        {furnished ? tL("Meublé", "Furnished", "Amueblado") : tL("Vide", "Unfurnished", "Sin amueblar")}
      </span>
      <span className="text-[#655f56]">
        {tL("Caution : 1 mois", "Deposit: 1 month", "Fianza: 1 mes")}
      </span>
    </span>
  );
}
