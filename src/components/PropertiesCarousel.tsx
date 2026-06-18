import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bed, Maximize } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/lib/supabase";
import type { Bien, BienType } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";
import { Reveal, ScaleReveal } from "@/components/motion/Animations";
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
    dragFree: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
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
          <h2 className="font-serif">
            {tL("Découvrez nos propriétés", "Discover our properties", "Descubra nuestras propiedades")}
          </h2>
        </Reveal>

        {/* ── Horizontal filters ──────────────────────────────────── */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto border-b border-[#0A0A0A]/10 pb-px scrollbar-hide -mx-2 px-2 mb-6">
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
        <div className="relative group/carousel">
          {/* Side arrow — Previous */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`flex absolute left-0 top-0 bottom-24 w-10 md:w-16 z-30 items-center justify-start pl-1 md:pl-2
              bg-gradient-to-r from-white/80 to-transparent
              transition-opacity duration-300 ${
              canScrollPrev
                ? "opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            aria-label="Previous"
          >
            <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 md:bg-white shadow-lg flex items-center justify-center border border-[#0A0A0A]/10 hover:bg-[#0A0A0A] hover:text-white transition-all duration-300">
              <ChevronLeft size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
            </span>
          </button>

          {/* Side arrow — Next */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`flex absolute right-0 top-0 bottom-24 w-10 md:w-16 z-30 items-center justify-end pr-1 md:pr-2
              bg-gradient-to-l from-white/80 to-transparent
              transition-opacity duration-300 ${
              canScrollNext
                ? "opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            aria-label="Next"
          >
            <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 md:bg-white shadow-lg flex items-center justify-center border border-[#0A0A0A]/10 hover:bg-[#0A0A0A] hover:text-white transition-all duration-300">
              <ChevronRight size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
            </span>
          </button>

          <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none" ref={emblaRef}>
            <div className="flex gap-5">
              {filtered.map((property, index) => (
                <div
                  key={property.id}
                  className="flex-[0_0_78%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_28%] min-w-0"
                >
                  <ScaleReveal delay={index * 0.1}>
                    <Link to={`/bien/${property.id}`} className="group block relative select-none">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-muted mb-0 shadow-md group-hover:shadow-lg transition-all duration-500">
                      {/* Category badge — minimal luxury tag */}
                      <div className="absolute top-3 left-3 z-10 bg-white/75 backdrop-blur-md text-[#0A0A0A] px-2.5 py-[5px] rounded-[3px] transition-opacity duration-300 group-hover:opacity-0">
                        <span className="text-[8px] tracking-[0.25em] uppercase font-sans font-medium">
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

                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-[#0A0A0A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                    </div>

                    {/* SIGNATURE OVERLAPPING CARD CONTAINER */}
                    <div className="relative bg-white pt-5 pb-5 px-4 md:px-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20 w-full left-0 border-t border-border/10
                      group-hover:-translate-y-16 group-hover:w-[108%] group-hover:-ml-[4%] group-hover:shadow-2xl group-hover:z-30 text-center">
                      
                      {/* Category */}
                      <span className="text-[8px] tracking-[0.25em] text-muted-foreground uppercase font-sans mb-1.5 block">
                        {property.type}
                      </span>
                      
                      {/* Title */}
                      <h4 className="font-serif text-[12px] sm:text-xs md:text-sm uppercase tracking-[0.12em] text-[#0A0A0A] leading-snug line-clamp-2 mb-2 font-medium">
                        {property.titre}
                      </h4>

                      {/* Bed / surface info */}
                      <div className="flex items-center justify-center gap-4 text-muted-foreground text-[10px] tracking-wide font-sans font-light mt-1 mb-1 transition-all duration-300 group-hover:opacity-0 group-hover:h-0 group-hover:overflow-hidden group-hover:my-0">
                        {property.chambres !== null && (
                          <span className="flex items-center gap-1.5">
                            <Bed size={12} strokeWidth={1} />
                            {property.chambres} {t("biens.chambres_plural")}
                          </span>
                        )}
                        {property.surface_terrain !== null && (
                          <span className="flex items-center gap-1.5">
                            <Maximize size={12} strokeWidth={1} />
                            {property.surface_terrain} {t("biens.surface")}
                          </span>
                        )}
                      </div>

                      {/* Separator */}
                      <div className="w-8 h-[1px] bg-[#0A0A0A]/20 mx-auto my-0 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-hover:my-3 transition-all duration-500" />

                      {/* Description */}
                      <p className="text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground font-sans font-light max-w-[95%] mx-auto opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-24 group-hover:mb-4 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        {tL(
                          `Prestigieuse propriété comprenant ${property.chambres ?? 3} chambres raffinées et une surface habitable de ${property.surface_terrain ?? 250} m² dans un emplacement idéal.`,
                          `Prestigious property featuring ${property.chambres ?? 3} refined bedrooms and a living area of ${property.surface_terrain ?? 250} sqm in an ideal location.`,
                          `Prestigiosa propiedad que cuenta con ${property.chambres ?? 3} habitaciones refinadas y un área habitable de ${property.surface_terrain ?? 250} m² en una ubicación ideal.`
                        )}
                      </p>

                      {/* Buttons container */}
                      <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-32 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] space-y-2 pointer-events-none group-hover:pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://wa.me/212605387041?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property.titre} (Ref: ${property.id})`)}`, '_blank');
                          }}
                          className="w-full bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-white py-3 text-[9px] tracking-[0.2em] uppercase font-sans font-medium transition-all duration-300 block text-center shadow-sm"
                        >
                          {tL("RESERVER CHAT", "CHAT VIA WHATSAPP", "CONTACTAR CHAT")}
                        </button>

                        <Link
                          to={`/bien/${property.id}`}
                          className="w-full border border-[#0A0A0A] text-[#0A0A0A] py-3 text-[9px] tracking-[0.2em] uppercase font-sans font-medium hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 block text-center"
                        >
                          {tL("DÉTAILS", "DETAILS", "DETALLES")}
                        </Link>
                      </div>
                    </div>
                  </Link>
                </ScaleReveal>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dot indicators ──────────────────────────────────────── */}
          {scrollSnaps.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? "w-6 h-1.5 bg-[#0A0A0A]"
                      : "w-1.5 h-1.5 bg-[#0A0A0A]/20 hover:bg-[#0A0A0A]/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
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
