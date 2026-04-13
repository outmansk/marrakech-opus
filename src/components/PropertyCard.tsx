import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Property } from "@/types/property";
import { Bed, Car, ArrowRight } from "lucide-react";

const formatPrice = (price: number, type: string) => {
  const formatted = new Intl.NumberFormat("fr-MA").format(price);
  switch (type) {
    case "vente":           return `${formatted} MAD`;
    case "location_courte": return `${formatted} MAD / nuit`;
    case "location_longue": return `${formatted} MAD / mois`;
    default:                return `${formatted} MAD`;
  }
};

const transactionLabel = (type: string) => {
  switch (type) {
    case "vente":           return "Vente";
    case "location_courte": return "Location courte durée";
    case "location_longue": return "Location longue durée";
    default:                return type;
  }
};

interface PropertyCardProps {
  property: Property;
  revealDelay?: number;
}

const PropertyCard = ({ property, revealDelay = 0 }: PropertyCardProps) => {
  const images = property.image_urls?.length ? property.image_urls : ["/placeholder.svg"];
  const hasMultiple = images.length > 1;

  // ── Slideshow automatique des photos ──────────────────────────────────
  const [activeIdx, setActiveIdx]   = useState(0);
  const [prevIdx,   setPrevIdx]     = useState<number | null>(null);
  const [fading,    setFading]      = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    if (!hasMultiple) return;

    const interval = setInterval(() => {
      const next = (activeRef.current + 1) % images.length;
      setPrevIdx(activeRef.current);   // garde l'ancienne photo visible en dessous
      setFading(true);                 // commence le fondu
      activeRef.current = next;
      setActiveIdx(next);

      // Après le fondu : on retire l'ancienne photo
      const t = setTimeout(() => {
        setPrevIdx(null);
        setFading(false);
      }, 700);
      return () => clearTimeout(t);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultiple, images.length]);

  // ── Scroll reveal ──────────────────────────────────────────────────────
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("is-visible"), revealDelay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealDelay]);

  return (
    <Link
      to={`/bien/${property.id}`}
      ref={cardRef}
      className="group block card-reveal-init"
    >
      {/* ── Zone image ── */}
      <div className="overflow-hidden aspect-[4/3] relative bg-muted">

        {/* Photo précédente (en dessous, toujours visible) */}
        {prevIdx !== null && (
          <img
            key={`prev-${prevIdx}`}
            src={images[prevIdx]}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Photo active (au-dessus, fade in) */}
        <img
          key={`active-${activeIdx}`}
          src={images[activeIdx]}
          alt={property.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 700ms ease-in-out, transform 700ms ease-out" }}
          loading="lazy"
        />

        {/* Indicateurs points (si plusieurs photos) */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all duration-300"
                style={{
                  width:   activeIdx === i ? "16px" : "6px",
                  height:  "6px",
                  backgroundColor: activeIdx === i ? "white" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}

        {/* Overlay luxe au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-500 ease-out z-20" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4
                        translate-y-3 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-500 ease-out z-20">
          <span className="text-white font-sans text-xs tracking-widest uppercase">
            Voir le bien
          </span>
          <ArrowRight size={16} strokeWidth={1.25} className="text-white" />
        </div>
      </div>

      {/* ── Infos propriété ── */}
      <div className="pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
            {transactionLabel(property.transaction_type)}
          </span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
            {property.property_type}
          </span>
        </div>
        <h3 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors duration-300">
          {property.title}
        </h3>
        <p className="text-accent font-serif text-lg">
          {formatPrice(property.price, property.transaction_type)}
        </p>
        <div className="flex items-center gap-4 mt-3 text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1.5">
              <Bed size={16} strokeWidth={1.25} />
              <span className="text-sm font-light">{property.bedrooms}</span>
            </div>
          )}
          {property.secure_parking && (
            <div className="flex items-center gap-1.5">
              <Car size={16} strokeWidth={1.25} />
              <span className="text-sm font-light">Parking</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
