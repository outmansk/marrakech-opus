import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bed, Maximize } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/lib/supabase";
import type { Bien, BienType } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/motion/Animations";
import { motion } from "framer-motion";

/* ── Mock data for fallback ───────────────────────────────────────────────── */
const MOCK_PROPERTIES: Array<{
  id: string;
  titre: string;
  type: BienType;
  prix: number;
  chambres: number;
  surface_terrain: number;
  photo_principale: string;
  photos: string[];
  services: Array<"vente" | "location-longue-duree">;
  statut: "publie";
}> = [
  {
    id: "mock-1", titre: "Villa Palmeraie Prestige", type: "villa",
    prix: 8500000, chambres: 5, surface_terrain: 1200,
    photo_principale: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format"],
    services: ["vente"], statut: "publie",
  },
  {
    id: "mock-2", titre: "Riad Authentique Médina", type: "riad",
    prix: 4200000, chambres: 4, surface_terrain: 280,
    photo_principale: "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800&q=80&auto=format"],
    services: ["vente"], statut: "publie",
  },
  {
    id: "mock-3", titre: "Villa Contemporaine Amelkis", type: "villa",
    prix: 35000, chambres: 4, surface_terrain: 800,
    photo_principale: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format"],
    services: ["location-longue-duree"], statut: "publie",
  },
  {
    id: "mock-4", titre: "Appartement Luxe Hivernage", type: "appartement",
    prix: 2800000, chambres: 3, surface_terrain: 180,
    photo_principale: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format"],
    services: ["vente"], statut: "publie",
  },
  {
    id: "mock-5", titre: "Villa Jardin Guéliz", type: "villa",
    prix: 6200000, chambres: 5, surface_terrain: 600,
    photo_principale: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format"],
    services: ["vente"], statut: "publie",
  },
  {
    id: "mock-6", titre: "Maison Traditionnelle Route Ourika", type: "maison",
    prix: 25000, chambres: 3, surface_terrain: 350,
    photo_principale: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format",
    photos: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format"],
    services: ["location-longue-duree"], statut: "publie",
  },
];

/* ── Filter tabs ─────────────────────────────────────────────────────────── */
type FilterKey = "all" | BienType | "vente" | "location";

interface FilterTab {
  key: FilterKey;
  labelFr: string;
  labelEn: string;
  labelEs: string;
}

const FILTERS: FilterTab[] = [
  { key: "all", labelFr: "Tous", labelEn: "All", labelEs: "Todos" },
  { key: "villa", labelFr: "Villas", labelEn: "Villas", labelEs: "Villas" },
  { key: "riad", labelFr: "Riads", labelEn: "Riads", labelEs: "Riads" },
  { key: "appartement", labelFr: "Appartements", labelEn: "Apartments", labelEs: "Apartamentos" },
  { key: "vente", labelFr: "À vendre", labelEn: "For Sale", labelEs: "En Venta" },
  { key: "location", labelFr: "À louer", labelEn: "For Rent", labelEs: "En Alquiler" },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-MA").format(price) + " MAD";

const PropertiesCarousel = () => {
  const { t, i18n } = useTranslation();

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  const [properties, setProperties] = useState<Bien[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    loop: false,
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  /* Fetch from Supabase */
  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties_v2")
        .select("*")
        .eq("statut", "publie")
        .order("created_at", { ascending: false })
        .limit(12);

      if (data && data.length > 0) {
        setProperties(data as Bien[]);
      }
    };
    fetchProperties();
  }, []);

  /* Embla scroll state */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  /* Re-init embla when filter changes */
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, true);
      // Small delay to let DOM update
      setTimeout(() => emblaApi.reInit(), 50);
    }
  }, [activeFilter, emblaApi]);

  /* Determine data source */
  const sourceData: Bien[] = properties.length > 0
    ? properties
    : (MOCK_PROPERTIES as unknown as Bien[]);

  /* Filter logic */
  const filtered = sourceData.filter((p) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "vente") return p.services?.includes("vente");
    if (activeFilter === "location")
      return p.services?.includes("location-longue-duree") || p.services?.includes("location-courte-duree");
    return p.type === activeFilter;
  });

  const getImage = (p: Bien) => {
    if (p.photo_principale) return p.photo_principale;
    if (p.photos?.length > 0) return p.photos[0];
    return "/placeholder.svg";
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        {/* ── Section header ──────────────────────────────────────── */}
        <Reveal className="mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground text-center mb-3 font-sans">
            {tL("NOS BIENS D'EXCEPTION", "OUR PROPERTIES", "NUESTRAS PROPIEDADES")}
          </p>
          <div className="w-12 h-[1px] bg-[#0A0A0A] mx-auto mb-5" />
          <div className="flex items-center justify-between">
            <h2 className="font-serif">
              {tL("Découvrez nos propriétés", "Discover our properties", "Descubra nuestras propiedades")}
            </h2>
            {/* Desktop arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className={`w-10 h-10 border border-[#0A0A0A]/20 flex items-center justify-center transition-all duration-300 ${
                  canScrollPrev ? "hover:bg-[#0A0A0A] hover:text-white" : "opacity-30 cursor-not-allowed"
                }`}
                aria-label="Previous"
              >
                <ChevronLeft size={18} strokeWidth={1.25} />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className={`w-10 h-10 border border-[#0A0A0A]/20 flex items-center justify-center transition-all duration-300 ${
                  canScrollNext ? "hover:bg-[#0A0A0A] hover:text-white" : "opacity-30 cursor-not-allowed"
                }`}
                aria-label="Next"
              >
                <ChevronRight size={18} strokeWidth={1.25} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* ── Horizontal filters ──────────────────────────────────── */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto border-b border-[#0A0A0A]/10 pb-px scrollbar-hide -mx-2 px-2 mb-12">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`relative pb-3 text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-sans font-medium
                  transition-colors duration-300 shrink-0 ${
                  isActive ? "text-[#0A0A0A]" : "text-[#0A0A0A]/40 hover:text-[#0A0A0A]/70"
                }`}
              >
                {(() => {
                  const lang = i18n.language?.slice(0, 2) ?? 'fr';
                  if (lang === 'en') return f.labelEn;
                  if (lang === 'es') return f.labelEs;
                  return f.labelFr;
                })()}
                {isActive && (
                  <motion.div
                    layoutId="activeFilterUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0A0A0A]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Embla Carousel ──────────────────────────────────────── */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y" ref={emblaRef}>
          <div className="flex gap-5">
            {filtered.map((property) => (
              <div
                key={property.id}
                className="flex-[0_0_82%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_28%] min-w-0"
              >
                <Link to={`/bien/${property.id}`} className="group block relative">
                  {/* Image */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-muted mb-4 shadow-md group-hover:shadow-2xl transition-all duration-500">
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-10 bg-[#0A0A0A] text-white px-3 py-1 transition-opacity duration-300 group-hover:opacity-0">
                      <span className="text-[9px] tracking-[0.2em] uppercase font-sans font-medium">
                        {property.type}
                      </span>
                    </div>

                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                      <OptimizedImage
                        src={getImage(property)}
                        alt={property.titre}
                        size="card"
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none"
                        wrapperClassName="w-full h-full"
                      />
                    </div>

                    {/* Dark/Blur elegant backdrop overlay on hover */}
                    <div className="absolute inset-0 bg-[#0A0A0A]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                    {/* FOUR SEASONS SIGNATURE OVERLAPPING DETAIL CARD */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 px-3 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none md:pointer-events-auto">
                      <div className="w-[108%] ml-[-4%] bg-white shadow-2xl p-5 md:p-6 text-center border border-[#0A0A0A]/5 pointer-events-auto">
                        <span className="text-[8px] tracking-[0.25em] text-muted-foreground uppercase font-sans mb-1.5 block">
                          {property.type}
                        </span>
                        
                        <h4 className="font-serif text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.15em] text-[#0A0A0A] leading-snug line-clamp-2 mb-2">
                          {property.titre}
                        </h4>

                        <div className="w-8 h-[1px] bg-[#0A0A0A]/25 mx-auto mb-3" />

                        <p className="text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground font-sans font-light mb-4 max-w-[95%] mx-auto">
                          {tL(
                            `Prestigieuse propriété comprenant ${property.chambres ?? 3} chambres raffinées et une surface habitable de ${property.surface_terrain ?? 250} m² dans un emplacement idéal.`,
                            `Prestigious property featuring ${property.chambres ?? 3} refined bedrooms and a living area of ${property.surface_terrain ?? 250} sqm in an ideal location.`,
                            `Prestigiosa propiedad que cuenta con ${property.chambres ?? 3} habitaciones refinadas y un área habitable de ${property.surface_terrain ?? 250} m² en una ubicación ideal.`
                          )}
                        </p>

                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`https://wa.me/212605387041?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property.titre} (Ref: ${property.id})`)}`, '_blank');
                            }}
                            className="w-full bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-white py-2.5 text-[9px] tracking-[0.2em] uppercase font-sans font-medium transition-all duration-300 block text-center"
                          >
                            {tL("RESERVER CHAT", "CHAT VIA WHATSAPP", "CONTACTAR CHAT")}
                          </button>

                          <Link
                            to={`/bien/${property.id}`}
                            className="w-full border border-[#0A0A0A] text-[#0A0A0A] py-2.5 text-[9px] tracking-[0.2em] uppercase font-sans font-medium hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 block text-center"
                          >
                            {tL("DÉTAILS", "DETAILS", "DETALLES")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-sm tracking-[0.08em] uppercase leading-snug line-clamp-2">
                      {property.titre}
                    </h3>
                    <p className="font-sans text-sm font-medium text-[#0A0A0A]">
                      {property.prix
                        ? formatPrice(property.prix)
                        : property.prix_vente
                          ? formatPrice(property.prix_vente)
                          : property.prix_location_longue
                            ? `${formatPrice(property.prix_location_longue)} ${tL("/ mois", "/ month", "/ mes")}`
                            : tL("Prix sur demande", "Price on request", "Precio bajo petición")}
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs font-light">
                      {property.chambres !== null && (
                        <span className="flex items-center gap-1.5">
                          <Bed size={14} strokeWidth={1} />
                          {property.chambres} {t("biens.chambres_plural")}
                        </span>
                      )}
                      {property.surface_terrain !== null && (
                        <span className="flex items-center gap-1.5">
                          <Maximize size={14} strokeWidth={1} />
                          {property.surface_terrain} {t("biens.surface")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── See all CTA ────────────────────────────────────────── */}
        <div className="text-center mt-12">
          <Link
            to="/catalogue"
            className="inline-block border border-[#0A0A0A] text-[#0A0A0A] px-10 py-3.5
              text-[10px] tracking-[0.25em] uppercase font-sans font-medium
              hover:bg-[#0A0A0A] hover:text-white transition-all duration-300"
          >
            {t("biens.voir_catalogue")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PropertiesCarousel;
