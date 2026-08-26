import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import OptimizedImage from "@/components/ui/OptimizedImage";

import slide1 from "@/assets/slide1_koutoubia.png";
import slide2 from "@/assets/slide2.jpg";
import slide3 from "@/assets/hero-marrakech.jpg";
import slide4 from "@/assets/slide4.jpg";
import slide5 from "@/assets/slide1.jpg";

/* Marrakech ambiance images — mixed with property photos */
const MARRAKECH_SLIDES = [
  { src: slide1, caption: "Palmeraie", subtitle: "Villas d'exception" },
  { src: slide2, caption: "Koutoubia", subtitle: "Au cœur de la ville ocre" },
  { src: slide3, caption: "Riad Traditionnel", subtitle: "L'art de vivre marocain" },
  { src: slide4, caption: "Design Contemporain", subtitle: "Luxe et modernité" },
  { src: slide5, caption: "Vue Panoramique", subtitle: "Marrakech & l'Atlas" },
];

const GalleryCarousel = () => {
  const { t } = useTranslation();
  const [propertyImages, setPropertyImages] = useState<{ src: string; caption: string; subtitle: string }[]>([]);
  const sectionRef = useScrollReveal<HTMLElement>();

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("properties_v2")
        .select("titre, photo_principale, photos, quartier")
        .eq("statut", "publie")
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) {
        const imgs = data
          .filter((property) => property.photo_principale || (property.photos?.length ?? 0) > 0)
          .map((property) => ({
            src: property.photo_principale ?? property.photos![0],
            caption: property.titre,
            subtitle: property.quartier || "Marrakech",
          }));
        setPropertyImages(imgs);
      }
    };
    fetchImages();
  }, []);

  /* Merge: property photos + Marrakech ambiance */
  const baseSlides = [...MARRAKECH_SLIDES];
  propertyImages.forEach((img, i) => {
    const insertAt = Math.min(i * 2 + 1, baseSlides.length);
    baseSlides.splice(insertAt, 0, img);
  });

  // Duplicate slides exactly once for the pure CSS -50% translateX loop
  const allSlides = [...baseSlides, ...baseSlides];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 overflow-hidden reveal-up">
      <div className="container mx-auto px-6 md:px-12 mb-12 md:mb-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
              Galerie
            </p>
            <h2>Marrakech & Nos Biens</h2>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground font-light max-w-xs text-right leading-relaxed">
            Découvrez la beauté de Marrakech et notre sélection de propriétés d'exception.
          </p>
        </div>
      </div>

      {/* Pure CSS Infinite Marquee */}
      <div className="w-full overflow-hidden relative">
        {/* Overlay gradients pour adoucir les bords */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* The Track: Uses pure CSS keyframes (animate-marquee) for perfect, CPU-friendly looping */}
        <div className="flex w-max animate-marquee">
          {allSlides.map((slide, index) => (
            <div
              key={index}
              className="relative shrink-0 w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[25vw] aspect-[3/4] overflow-hidden group mx-2 md:mx-3"
            >
              {/* Image with hover zoom */}
              <OptimizedImage
                src={slide.src}
                alt={slide.caption}
                size="card"
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                wrapperClassName="w-full h-full"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-6 h-6 md:w-8 md:h-8 border-l border-t border-white/30
                opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-10 group-hover:h-10" />
              <div className="absolute bottom-4 right-4 w-6 h-6 md:w-8 md:h-8 border-r border-b border-white/30
                opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-10 group-hover:h-10" />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white/70 text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-sans mb-2">
                  {slide.subtitle}
                </p>
                <h3 className="text-white font-serif text-lg md:text-xl font-light leading-snug line-clamp-2">
                  {slide.caption}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryCarousel;
