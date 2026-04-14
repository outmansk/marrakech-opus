import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";

const Catalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const activeType = searchParams.get("type") || "all";

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from("properties").select("*").eq("is_available", true).order("created_at", { ascending: false });
      if (activeType !== "all") {
        query = query.contains("transaction_types", [activeType]);
      }
      const { data } = await query;
      setProperties((data as Property[]) || []);
      setLoading(false);
    };
    fetch();
  }, [activeType]);

  const filters = [
    { key: "all", label: "Tous" },
    { key: "vente", label: "Vente" },
    { key: "location_courte", label: "Location courte" },
    { key: "location_longue", label: "Location longue" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Notre collection</p>
          <h1 className="mb-12">Catalogue</h1>

          <div className="flex gap-1 mb-16 border-b border-border overflow-x-auto pb-px scrollbar-hide w-full max-w-full">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSearchParams(f.key === "all" ? {} : { type: f.key })}
                className={`px-6 py-3 text-xs tracking-widest uppercase font-sans font-medium transition-colors border-b-2 -mb-px ${
                  activeType === f.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
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
              <p className="text-muted-foreground font-light text-lg">Aucun bien disponible dans cette categorie.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalogue;
