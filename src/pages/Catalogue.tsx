import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useBiens";
import { isUnavailable } from "@/lib/propertyServices";
import { BIEN_TYPES, QUARTIERS } from "@/types/property";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { PageTransition } from "@/components/motion/Animations";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { useLocalePath } from "@/hooks/useLocalePath";
import { LANDINGS, availableFor, landingPath } from "@/content/landings";
import { useQuery } from "@tanstack/react-query";
import { propertiesQueryOptions } from "@/hooks/useBiens";

const Catalogue = () => {
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  // Unfiltered list (same query as the pre-render) to link only to search pages that have stock.
  const { data: allProperties = [] } = useQuery(propertiesQueryOptions({ statut: ["publie", "vendu-loue"] }));
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilters, setMobileFilters] = useState(false);

  const activeType = searchParams.get("type") || "all";
  const activeKind = searchParams.get("kind") || "all";
  const activeQuartier = searchParams.get("quartier") || "all";
  const queryText = searchParams.get("q") || "";

  // Use React Query via the shared hook — cached, retried, deduped
  const { data: properties = [], isLoading: loading } = useProperties({
    service: activeType !== "all" ? activeType : undefined,
    type: activeKind !== "all" ? activeKind : undefined,
    quartier: activeQuartier !== "all" ? activeQuartier : undefined,
    statut: ["publie", "vendu-loue"],
  });

  const visibleProperties = useMemo(() => {
    const needle = queryText.trim().toLocaleLowerCase("fr");
    // Available listings first, sold/rented ones at the end (sort is stable).
    const ordered = [...properties].sort((a, b) => Number(isUnavailable(a)) - Number(isUnavailable(b)));
    if (!needle) return ordered;
    return ordered.filter((property) => [property.titre, property.quartier, property.type, property.description_courte, property.reference].filter(Boolean).join(" ").toLocaleLowerCase("fr").includes(needle));
  }, [properties, queryText]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key); else params.set(key, value);
    setSearchParams(params, { replace: true });
  };

  const clear = () => setSearchParams({}, { replace: true });
  const countFilters = [activeType, activeKind, activeQuartier].filter((value) => value !== "all").length + (queryText ? 1 : 0);
  const resultCount = `${visibleProperties.length} ${tL(visibleProperties.length > 1 ? "biens" : "bien", visibleProperties.length > 1 ? "properties" : "property", visibleProperties.length > 1 ? "propiedades" : "propiedad")}`;

  const FilterFields = () => (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="block">
        <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.17em] text-[#777065]">{tL("Recherche", "Search", "Buscar")}</span>
        <span className="flex h-12 items-center border border-[#2b2722]/15 bg-white px-4">
          <Search size={16} strokeWidth={1.4} className="mr-3 text-[#a4573e]" />
          <input value={queryText} onChange={(event) => update("q", event.target.value)} placeholder={tL("Quartier, riad, villa…", "Area, riad, villa…", "Barrio, riad, villa…")} className="w-full bg-transparent text-sm outline-none placeholder:text-[#918b82]" />
        </span>
      </label>
      {[
        { label: tL("Projet", "Project", "Proyecto"), key: "type", value: activeType, options: [["all", tL("Tous", "All", "Todos")], ["vente", tL("Acheter", "Buy", "Comprar")], ["location-longue-duree", tL("Louer à l'année", "Long-term rent", "Alquiler anual")], ["location-courte-duree", tL("Séjourner", "Stay", "Estancia")]] },
        { label: tL("Type de bien", "Property type", "Tipo"), key: "kind", value: activeKind, options: [["all", tL("Tous les types", "All types", "Todos los tipos")], ...BIEN_TYPES.map((type) => [type, type.charAt(0).toUpperCase() + type.slice(1)])] },
        { label: tL("Quartier", "Neighborhood", "Barrio"), key: "quartier", value: activeQuartier, options: [["all", tL("Tous les quartiers", "All neighborhoods", "Todos los barrios")], ...QUARTIERS.map((quartier) => [quartier, quartier])] },
      ].map((field) => (
        <label key={field.key} className="block">
          <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.17em] text-[#777065]">{field.label}</span>
          <span className="relative flex h-12 items-center border border-[#2b2722]/15 bg-white px-4">
            <select value={field.value} onChange={(event) => update(field.key, event.target.value)} className="h-full w-full appearance-none bg-transparent pr-7 text-sm capitalize outline-none">
              {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-4 text-[#777065]" />
          </span>
        </label>
      ))}
      <button type="button" onClick={clear} className="h-12 px-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#777065] transition-colors hover:text-[#a4573e]">{tL("Effacer", "Clear", "Borrar")}</button>
    </div>
  );

  const crumbs = [{ name: tL("Accueil", "Home", "Inicio"), path: lp("/") }, { name: tL("Nos biens", "Properties", "Propiedades"), path: lp("/catalogue") }];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fbf8f2]">
        <SEOHead title={tL("Catalogue immobilier Marrakech", "Marrakech property catalogue", "Catálogo inmobiliario Marrakech")} description={tL("Découvrez nos villas, riads et appartements disponibles à Marrakech.", "Discover our available villas, riads and apartments in Marrakech.", "Descubra nuestras villas, riads y apartamentos disponibles en Marrakech.")} schema={breadcrumbJsonLd(crumbs)} />
        <Header />
        <main className="pt-16">
          <section className="border-b border-[#2b2722]/12 bg-[#ede5d8] py-5 md:py-8">
            <div className="mx-auto max-w-[1320px] px-5 md:px-10 xl:px-16">
              <Breadcrumbs crumbs={crumbs} className="mb-3" />
              <h1 className="text-[32px] leading-tight tracking-[-0.025em] text-[#211f1b] md:text-[44px]">{tL("Nos biens", "Properties", "Propiedades")}</h1>
            </div>
          </section>

          <section className="sticky top-16 z-30 border-b border-[#2b2722]/12 bg-[#f6f1e8]/95 backdrop-blur-xl">
            <div className="mx-auto max-w-[1320px] px-5 py-3 md:px-10 lg:py-4 xl:px-16">
              <div className="hidden lg:block"><FilterFields /></div>
              <div className="flex items-center justify-between gap-4 lg:hidden">
                <p aria-live="polite" className="text-xs font-medium text-[#655f56]">{loading ? tL("Chargement…", "Loading…", "Cargando…") : resultCount}</p>
                <button type="button" onClick={() => setMobileFilters(true)} aria-expanded={mobileFilters} className="flex min-h-11 shrink-0 items-center justify-between gap-3 border border-[#2b2722]/15 bg-white px-4 text-xs font-medium"><span className="flex items-center gap-2"><SlidersHorizontal size={16} />{tL("Filtres", "Filters", "Filtros")}</span>{countFilters > 0 && <span className="grid h-6 w-6 place-items-center rounded-full bg-[#a4573e] text-white">{countFilters}</span>}</button>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-5 md:px-10 lg:py-8 xl:px-16">
            <h2 className="sr-only">{tL("Biens correspondant à votre recherche", "Properties matching your search", "Inmuebles que coinciden con su búsqueda")}</h2>
            {!loading && <div className="mb-5 hidden items-center gap-4 lg:flex"><p aria-live="polite" className="text-xs font-medium text-[#655f56]">{resultCount}</p><span className="h-px flex-1 bg-[#2b2722]/12" /></div>}
            {loading ? <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[4/3] bg-[#e9e1d5]" /><div className="mt-4 h-6 w-2/3 bg-[#e9e1d5]" /></div>)}</div> : visibleProperties.length > 0 ? <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{visibleProperties.map((property, index) => <PropertyCard key={property.id} property={property} activeType={activeType} revealDelay={index * 50} />)}</div> : <div className="border-y border-[#2b2722]/12 py-20 text-center"><h2 className="text-4xl">{tL("Aucun bien trouvé", "No property found", "No se encontró ninguna propiedad")}</h2><p className="mt-3 text-sm text-[#655f56]">{tL("Essayez de modifier ou d'effacer vos filtres.", "Try changing or clearing your filters.", "Pruebe a cambiar o borrar los filtros.")}</p><button onClick={clear} className="mt-7 bg-[#a4573e] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-white">{tL("Effacer les filtres", "Clear filters", "Borrar filtros")}</button></div>}
          </div>
          {/* Search pages: give crawlers (and visitors) a path to every listing page */}
          <nav aria-label={tL("Recherches fréquentes", "Popular searches", "Búsquedas frecuentes")} className="mx-auto max-w-[1320px] border-t border-[#2b2722]/12 px-5 py-10 md:px-10 xl:px-16">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777065]">{tL("Recherches fréquentes", "Popular searches", "Búsquedas frecuentes")}</h2>
            <ul className="flex flex-wrap gap-2">
              {LANDINGS.filter((landing) => landing.type && availableFor(landing, allProperties).length > 0).map((landing) => (
                <li key={landing.id}><Link to={landingPath(landing.id, lang)} className="flex min-h-11 items-center border border-[#2b2722]/15 bg-white px-4 text-sm transition-colors hover:border-[#a4573e] hover:text-[#a4573e]">{landing.label[lang]}</Link></li>
              ))}
            </ul>
          </nav>
        </main>
        <Footer />

        <AnimatePresence>
          {mobileFilters && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-[#f6f1e8] px-5 pb-8 pt-6 lg:hidden"><div className="mb-8 flex items-center justify-between"><h2 className="text-4xl">{tL("Affiner", "Refine", "Filtrar")}</h2><button onClick={() => setMobileFilters(false)} className="grid h-11 w-11 place-items-center" aria-label="Fermer"><X /></button></div><FilterFields /><button onClick={() => setMobileFilters(false)} className="mt-8 h-14 w-full bg-[#a4573e] text-[10px] font-semibold uppercase tracking-[0.17em] text-white">{tL(`Voir ${visibleProperties.length} biens`, `View ${visibleProperties.length} properties`, `Ver ${visibleProperties.length} propiedades`)}</button></motion.div>}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Catalogue;
