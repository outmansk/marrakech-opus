import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";

const Catalogue = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const activeType = searchParams.get("type") || "all";

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

      const { data } = await query;
      setProperties((data as Bien[]) || []);
      setLoading(false);
    };
    fetch();
  }, [activeType]);

  const filters = [
    { key: "all", label: "Tous" }, // Could add specific translations for this array
    { key: "vente", label: t("services.vente") },
    { key: "location-longue-duree", label: t("services.location_longue") },
    { key: "location-courte-duree", label: t("services.location_courte") },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Notre collection</p>
          <h1 className="mb-12">{t("nav.catalogue")}</h1>

          <div className="relative mb-12">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSearchParams(f.key === "all" ? {} : { type: f.key })}
                  className={`px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase font-sans font-medium transition-all whitespace-nowrap border ${
                    activeType === f.key
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} activeType={activeType} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light text-lg">{t("biens.aucun_bien")}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalogue;
