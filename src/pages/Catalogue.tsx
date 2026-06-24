import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, Reveal, StaggerContainer, staggerItemVariants, EASE_LUXURY } from "@/components/motion/Animations";
import SEOHead from "@/components/SEOHead";

const Catalogue = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const activeType = DOMPurify.sanitize(searchParams.get("type") || "all");
  const activeKind = DOMPurify.sanitize(searchParams.get("kind") || "all");

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from("properties_v2")
        .select("*")
        .eq("statut", "publie")
        .order("created_at", { ascending: false });

      if (activeType !== "all") {
        query = query.contains("services", [activeType]);
      }

      if (activeKind !== "all") {
        query = query.eq("type", activeKind);
      }

      const { data } = await query;
      setProperties((data as Bien[]) || []);
      setLoading(false);
    };
    fetch();
  }, [activeType, activeKind]);

  const serviceFilters = [
    { key: "all", label: tL("Tous", "All", "Todos") },
    { key: "vente", label: t("services.vente") },
    { key: "location-longue-duree", label: t("services.location_longue") },
    { key: "location-courte-duree", label: t("services.location_courte") },
  ];

  const kindFilters = [
    { key: "all", label: tL("Tous types", "All types", "Todos los tipos") },
    { key: "villa", label: "Villas" },
    { key: "riad", label: "Riads" },
    { key: "appartement", label: tL("Appartements", "Apartments", "Apartamentos") },
    { key: "maison", label: tL("Maisons", "Houses", "Casas") },
    { key: "terrain", label: tL("Terrains", "Land", "Terrenos") },
  ];

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <PageTransition>
    <SEOHead
      title="Nos Biens — Villas, Riads & Appartements à Marrakech"
      description="Explorez notre collection de biens immobiliers de luxe à Marrakech. Villas, riads, appartements en vente et location."
    />
    <div className="min-h-screen">
      <Header />
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              {tL("Retour à l'accueil", "Back to home", "Volver al inicio")}
            </Link>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3 font-sans">
              {tL("Notre collection", "Our collection", "Nuestra colección")}
            </p>
            <div className="w-12 h-[1px] bg-foreground/20 mb-4" />
            <h1 className="mb-4">{t("nav.catalogue")}</h1>
            <p className="text-muted-foreground font-light text-base max-w-xl mb-8">
              {tL(
                "Découvrez notre sélection de biens d'exception à Marrakech. Villas, riads, appartements — chaque propriété est soigneusement sélectionnée.",
                "Discover our selection of exceptional properties in Marrakech. Villas, riads, apartments — each property is carefully selected.",
                "Descubra nuestra selección de propiedades excepcionales en Marrakech. Villas, riads, apartamentos — cada propiedad es cuidadosamente seleccionada."
              )}
            </p>
          </Reveal>

          {/* ── Service filter tabs ─────────────────────────────────── */}
          <Reveal delay={0.15}>
            <div className="relative mb-4">
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-medium mb-2">
                {tL("Service", "Service", "Servicio")}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {serviceFilters.map((f) => (
                  <motion.button
                    key={f.key}
                    onClick={() => setFilter("type", f.key)}
                    className={`px-5 py-2 text-[10px] tracking-[0.18em] uppercase font-sans font-medium transition-all whitespace-nowrap border rounded-sm ${
                      activeType === f.key
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/40 hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    layout
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── Type filter tabs ────────────────────────────────────── */}
          <Reveal delay={0.25}>
            <div className="relative mb-6">
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-medium mb-2">
                {tL("Type de bien", "Property type", "Tipo de propiedad")}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {kindFilters.map((f) => (
                  <motion.button
                    key={f.key}
                    onClick={() => setFilter("kind", f.key)}
                    className={`px-5 py-2 text-[10px] tracking-[0.18em] uppercase font-sans font-medium transition-all whitespace-nowrap border rounded-sm ${
                      activeKind === f.key
                        ? "bg-accent text-accent-foreground border-accent shadow-sm"
                        : "bg-transparent text-muted-foreground border-border/60 hover:border-accent/40 hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    layout
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>
              <div className="absolute right-0 top-6 bottom-3 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
            </div>
          </Reveal>

          {/* ── Results counter ─────────────────────────────────────── */}
          {!loading && (
            <Reveal delay={0.3}>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-8 h-[1px] bg-accent/40" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-medium">
                  {properties.length} {properties.length > 1 ? tL("biens trouvés", "properties found", "propiedades encontradas") : tL("bien trouvé", "property found", "propiedad encontrada")}
                </p>
                <div className="flex-1 h-[1px] bg-border/40" />
              </div>
            </Reveal>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="pt-5 space-y-3">
                       <div className="h-3 w-24 bg-muted rounded" />
                       <div className="h-5 w-48 bg-muted rounded" />
                       <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : properties.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
              >
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} activeType={activeType} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground font-light text-lg">{t("biens.aucun_bien")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default Catalogue;
