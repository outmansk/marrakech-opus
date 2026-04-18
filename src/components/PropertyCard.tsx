import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Bien, BienService } from "@/types/property";
import { Bed, Car, ArrowRight, Bath } from "lucide-react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA").format(price) + " MAD";
};

const transactionLabel = (service: BienService) => {
  switch (service) {
    case "vente":                   return "Vente";
    case "location-courte-duree":   return "Location courte";
    case "location-longue-duree":   return "Location longue";
    case "sous-location":           return "Sous-location";
    default:                        return service;
  }
};

const getDisplayPrice = (bien: Bien, activeService?: string) => {
  // Si un filtre spécifique est actif, on affiche le prix correspondant
  if (activeService === 'vente' && bien.prix_vente) 
    return `${formatPrice(bien.prix_vente)}`;
  
  if (activeService === 'location-longue-duree' && bien.prix_location_longue) 
    return `${formatPrice(bien.prix_location_longue)} / mois`;
    
  if (activeService === 'location-courte-duree' && bien.prix_location_courte) 
    return `${formatPrice(bien.prix_location_courte)} / nuit`;

  // Valeur par défaut si aucun filtre ou service non trouvé : on prend le premier disponible
  if (bien.services.includes('vente') && bien.prix_vente) 
    return `${formatPrice(bien.prix_vente)} (Vente)`;
    
  if (bien.services.includes('location-longue-duree') && bien.prix_location_longue) 
    return `${formatPrice(bien.prix_location_longue)} / mois`;
    
  if (bien.services.includes('location-courte-duree') && bien.prix_location_courte) 
    return `${formatPrice(bien.prix_location_courte)} / nuit`;

  return bien.prix ? `${formatPrice(bien.prix)}` : "Prix sur demande";
};

interface PropertyCardProps {
  property: Bien;
  revealDelay?: number;
  activeType?: string;
}

const PropertyCard = ({ property, revealDelay = 0, activeType }: PropertyCardProps) => {
  const images = property.photos?.length ? property.photos : ["/placeholder.svg"];
  const hasMultiple = images.length > 1;

  // ── Slideshow automatique des photos ──────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    if (!hasMultiple) return;

    const interval = setInterval(() => {
      const next = (activeRef.current + 1) % images.length;
      setPrevIdx(activeRef.current);
      setFading(true);
      activeRef.current = next;
      setActiveIdx(next);

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
      <div className="overflow-hidden aspect-[4/3] relative bg-muted rounded-0 border-b border-border/10">
        {prevIdx !== null && (
          <img
            key={`prev-${prevIdx}`}
            src={images[prevIdx]}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <img
          key={`active-${activeIdx}`}
          src={images[activeIdx]}
          alt={property.titre}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 700ms ease-in-out, transform 700ms ease-out" }}
          loading="lazy"
        />

        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all duration-300"
                style={{
                  width: activeIdx === i ? "16px" : "6px",
                  height: "6px",
                  backgroundColor: activeIdx === i ? "white" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}

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

        {/* Badge Vendu/Loué */}
        {property.statut === 'vendu-loue' && (
          <div className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-white text-[10px] tracking-widest uppercase font-medium">Vendu / Loué</span>
          </div>
        )}
      </div>

      {/* ── Infos propriété ── */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between mb-3 text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            {property.services.map((s) => (
              <span key={s} className="text-[10px] tracking-widest uppercase font-sans font-medium bg-muted px-2 py-0.5 rounded-sm">
                {transactionLabel(s)}
              </span>
            ))}
          </div>
          <span className="text-[10px] tracking-widest uppercase font-sans">
            {property.type}
          </span>
        </div>
        
        <h3 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">
          {property.titre}
        </h3>

        <p className="text-accent font-serif text-lg mb-4">
          {getDisplayPrice(property, activeType)}
        </p>

        <div className="flex items-center gap-6 text-muted-foreground border-t border-border/40 pt-4">
          {property.chambres && (
            <div className="flex items-center gap-2">
              <Bed size={16} strokeWidth={1} />
              <span className="text-xs font-light tracking-wide">{property.chambres} Ch.</span>
            </div>
          )}
          {property.salles_de_bain && (
            <div className="flex items-center gap-2">
              <Bath size={16} strokeWidth={1} />
              <span className="text-xs font-light tracking-wide">{property.salles_de_bain} Sdb</span>
            </div>
          )}
          {property.equipements?.includes('Parking') && (
            <div className="flex items-center gap-2">
              <Car size={16} strokeWidth={1} />
              <span className="text-xs font-light tracking-wide">Pk.</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
