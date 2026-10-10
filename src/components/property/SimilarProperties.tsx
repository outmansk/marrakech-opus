import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import type { Bien } from "@/types/property";
import type { Lang } from "@/i18n/routing";
import PropertyCard from "@/components/PropertyCard";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { SIMILAR_QUERY, similarTo } from "@/lib/propertyDetail";
import { availableFor, landingFor, landingPath, type Landing } from "@/content/landings";
import { SectionHeading } from "./PropertySections";

export default function SimilarProperties({ property, lang }: { property: Bien; lang: Lang }) {
  const tL = useLocalizedText();
  const { data: all = [] } = useQuery(propertiesQueryOptions(SIMILAR_QUERY));
  const similar = similarTo(property, all);
  // Search pages for this type, only when they have listings (empty ones are noindex).
  const landings = (property.services.map((service) => landingFor(service, property.type)).filter(Boolean) as Landing[])
    .filter((landing) => availableFor(landing, all).length > 0);
  if (!similar.length && !landings.length) return null;
  return (
    <section>
      <SectionHeading title={tL("Biens similaires", "Similar properties", "Inmuebles similares")} />
      {similar.length > 0 && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {similar.map((other) => <PropertyCard key={other.id} property={other} />)}
        </div>
      )}
      {landings.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {landings.map((landing) => (
            <Link key={landing.id} to={landingPath(landing.id, lang)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:border-primary hover:text-primary">
              {tL("Voir tout :", "See all:", "Ver todo:")} {landing.label[lang]} <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
