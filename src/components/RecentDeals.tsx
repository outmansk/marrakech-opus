import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { RECENT_DEALS_QUERY, dealOf } from "@/lib/propertyDeals";

/** « Récemment loués et vendus » : biens conclus qui ont une fiche dans src/content/propertyDeals.json. */
export default function RecentDeals() {
  const tL = useLocalizedText();
  const { data = [] } = useQuery(propertiesQueryOptions(RECENT_DEALS_QUERY));
  const deals = data.filter((property) => dealOf(property)).slice(0, 3);
  if (!deals.length) return null;
  return (
    <section className="bg-[#fbf8f2] px-5 py-14 lg:px-0 lg:py-[96px]">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-8 lg:px-16">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#a4573e] lg:text-xs">{tL("Ils nous ont fait confiance", "They trusted us", "Confiaron en nosotros")}</p>
          <h2 className="m-0 text-[34px] leading-[1.08] lg:text-[48px]">{tL("Récemment loués et vendus", "Recently rented and sold", "Alquilados y vendidos recientemente")}</h2>
          <p className="m-0 max-w-[640px] text-[15px] leading-relaxed text-[#4f4a43]">
            {tL("Quelques biens que nous avons loués ou vendus. Par discrétion, nous ne publions que le profil de nos clients, jamais leur nom.",
              "A few homes we have rented or sold. Out of discretion, we only show our clients’ profile, never their name.",
              "Algunos inmuebles que hemos alquilado o vendido. Por discreción, solo mostramos el perfil de nuestros clientes, nunca su nombre.")}
          </p>
        </div>
        {/* Phones: one swipeable row (the next card peeks out); tablets and desktop: a grid. */}
        <div
          role="region"
          aria-label={tL("Biens loués et vendus", "Rented and sold homes", "Inmuebles alquilados y vendidos")}
          className="-mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain px-5 pb-1 scroll-pl-5 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
        >
          {deals.map((property) => (
            <div key={property.id} className="flex min-w-0 flex-[0_0_calc(100%-44px)] snap-start sm:block">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        {deals.length > 1 && (
          <p className="-mt-3 text-[13px] text-[#655f56] sm:hidden">{tL("Glissez pour voir les autres", "Swipe to see more", "Deslice para ver más")}</p>
        )}
      </div>
    </section>
  );
}
