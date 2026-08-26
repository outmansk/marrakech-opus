import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import { BIEN_TYPES, QUARTIERS, type Bien } from "@/types/property";
import SEOHead from "@/components/SEOHead";
import { PageTransition } from "@/components/motion/Animations";

const Catalogue = () => {
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const activeType = searchParams.get("type") || "all";
  const activeKind = searchParams.get("kind") || "all";
  const activeQuartier = searchParams.get("quartier") || "all";
  const queryText = searchParams.get("q") || "";

  const tL = (fr: string, en: string, es: string) => {
    const language = i18n.language?.slice(0, 2) ?? "fr";
    return language === "en" ? en : language === "es" ? es : fr;
  };

  useEffect(() => {
    let mounted = true;
    const fetchProperties = async () => {
      setLoading(true);
      let request = supabase.from("properties_v2").select("*").eq("statut", "publie").order("created_at", { ascending: false });
      if (activeType !== "all") request = request.contains("services", [activeType]);
      if (activeKind !== "all") request = request.eq("type", activeKind);
      if (activeQuartier !== "all") request = request.eq("quartier", activeQuartier);
      const { data } = await request;
      if (mounted) {
        setProperties((data as Bien[]) ?? []);
        setLoading(false);
      }
    };
    fetchProperties();
    return () => { mounted = false; };
  }, [activeType, activeKind, activeQuartier]);

  const visibleProperties = useMemo(() => {
    const needle = queryText.trim().toLocaleLowerCase("fr");
    if (!needle) return properties;
    return properties.filter((property) => [property.titre, property.quartier, property.type, property.description_courte].filter(Boolean).join(" ").toLocaleLowerCase("fr").includes(needle));
  }, [properties, queryText]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key); else params.set(key, value);
    setSearchParams(params, { replace: true });
  };

  const clear = () => setSearchParams({}, { replace: true });
  const countFilters = [activeType, activeKind, activeQuartier].filter((value) => value !== "all").length + (queryText ? 1 : 0);

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
        { label: tL("Projet", "Project", "Proyecto"), key: "type", value: activeType, options: [["all", tL("Tous", "All", "Todos")], ["vente", tL("Acheter", "Buy", "Comprar")], ["location-longue-duree", tL("Louer à l’année", "Long-term rent", "Alquiler anual")], ["location-courte-duree", tL("Séjourner", "Stay", "Estancia")]] },
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fbf8f2]">
        <SEOHead title={tL("Catalogue immobilier Marrakech", "Marrakech property catalogue", "Catálogo inmobiliario Marrakech")} description={tL("Découvrez nos villas, riads et appartements disponibles à Marrakech.", "Discover our available villas, riads and apartments in Marrakech.", "Descubra nuestras villas, riads y apartamentos disponibles en Marrakech.")} />
        <Header />
        <main className="pt-16">
          <section className="border-b border-[#2b2722]/12 bg-[#ede5d8] py-12 md:py-16">
            <div className="mx-auto max-w-[1320px] px-5 md:px-10 xl:px-16">
              <Link to="/" className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#777065] hover:text-[#a4573e]"><ArrowLeft size={14} />{tL("Accueil", "Home", "Inicio")}</Link>
              <div className="mt-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div><p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#a4573e]">{tL("Notre collection", "Our collection", "Nuestra colección")}</p><h1 className="mt-3 text-[48px] leading-none tracking-[-0.03em] text-[#211f1b] md:text-[64px]">{tL("Des adresses choisies", "Chosen addresses", "Direcciones elegidas")}</h1></div>
                <p className="max-w-md text-sm leading-6 text-[#655f56]">{tL("Une sélection courte de biens vérifiés, à acheter, louer ou habiter le temps d’un séjour.", "A concise selection of verified homes to buy, rent or enjoy for a stay.", "Una selección de propiedades verificadas para comprar, alquilar o disfrutar durante una estancia.")}</p>
              </div>
            </div>
          </section>

          <section className="sticky top-16 z-30 border-b border-[#2b2722]/12 bg-[#f6f1e8]/95 backdrop-blur-xl">
            <div className="mx-auto max-w-[1320px] px-5 py-4 md:px-10 xl:px-16">
              <div className="hidden lg:block"><FilterFields /></div>
              <button type="button" onClick={() => setMobileFilters(true)} className="flex h-12 w-full items-center justify-between border border-[#2b2722]/15 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.16em] lg:hidden"><span className="flex items-center gap-2"><SlidersHorizontal size={16} />{tL("Filtres", "Filters", "Filtros")}</span>{countFilters > 0 && <span className="grid h-6 w-6 place-items-center rounded-full bg-[#a4573e] text-white">{countFilters}</span>}</button>
            </div>
          </section>

          <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-10 md:py-14 xl:px-16">
            {!loading && <div className="mb-8 flex items-center gap-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#655f56]">{visibleProperties.length} {tL(visibleProperties.length > 1 ? "biens" : "bien", visibleProperties.length > 1 ? "properties" : "property", visibleProperties.length > 1 ? "propiedades" : "propiedad")}</p><span className="h-px flex-1 bg-[#2b2722]/12" /></div>}
            {loading ? <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[4/3] bg-[#e9e1d5]" /><div className="mt-4 h-6 w-2/3 bg-[#e9e1d5]" /></div>)}</div> : visibleProperties.length > 0 ? <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{visibleProperties.map((property, index) => <PropertyCard key={property.id} property={property} activeType={activeType} revealDelay={index * 50} />)}</div> : <div className="border-y border-[#2b2722]/12 py-20 text-center"><h2 className="text-4xl">{tL("Aucun bien trouvé", "No property found", "No se encontró ninguna propiedad")}</h2><p className="mt-3 text-sm text-[#655f56]">{tL("Essayez de modifier ou d’effacer vos filtres.", "Try changing or clearing your filters.", "Pruebe a cambiar o borrar los filtros.")}</p><button onClick={clear} className="mt-7 bg-[#a4573e] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-white">{tL("Effacer les filtres", "Clear filters", "Borrar filtros")}</button></div>}
          </div>
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
