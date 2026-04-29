import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Bien, BienService } from "@/types/property";
import { Bed, Car, Bath, Maximize, MessageCircle } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA").format(price) + " MAD";
};

const getDisplayPrice = (bien: Bien, activeService?: string) => {
  if (activeService === 'vente' && bien.prix_vente) 
    return `${formatPrice(bien.prix_vente)}`;
  
  if (activeService === 'location-longue-duree' && bien.prix_location_longue) 
    return `${formatPrice(bien.prix_location_longue)} / mois`;
    
  if (activeService === 'location-courte-duree' && bien.prix_location_courte) 
    return `${formatPrice(bien.prix_location_courte)} / nuit`;

  if (bien.services.includes('vente') && bien.prix_vente) 
    return `${formatPrice(bien.prix_vente)}`;
    
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
  const { t } = useTranslation();
  const image = property.photos?.length ? property.photos[0] : "/placeholder.svg";

  const transactionLabel = (service: BienService) => {
    switch (service) {
      case "vente":                   return t('services.vente');
      case "location-courte-duree":   return t('services.location_courte');
      case "location-longue-duree":   return t('services.location_longue');
      case "sous-location":           return t('services.sous_location');
      default:                        return service;
    }
  };

  const statusLabel = () => {
    if (property.statut === 'vendu-loue') return t('biens.vendu');
    if (property.statut === 'brouillon') return t('biens.brouillon');
    return t('biens.disponible');
  };

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
      className="block card-reveal-init property-card h-full flex flex-col group"
      style={{ contain: 'layout' }}
    >
      <div className="overflow-hidden aspect-[16/10] relative bg-muted rounded-0 border-b border-border/10 shrink-0">
        <OptimizedImage
          src={image}
          alt={property.titre}
          eager={false}
          size="card"
          className="absolute inset-0 w-full h-full object-cover"
          wrapperClassName="absolute inset-0"
          style={{ willChange: 'none' }}
        />

        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
          {property.statut === 'vendu-loue' && (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-white text-[10px] tracking-widest uppercase font-medium">{statusLabel()}</span>
            </div>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(`https://wa.me/212605387041?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property.titre} (Ref: ${property.reference || property.id})`)}`, '_blank');
            }}
            className="bg-[#25D366] hover:bg-[#20b858] text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            title="Contacter par WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>

      <div className="pt-5 pb-2 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2 text-muted-foreground">
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
        
        <h3 className="text-xl font-serif mb-1 leading-tight line-clamp-2">
          {property.titre}
        </h3>

        <p className="text-accent font-serif text-lg mb-4">
          {getDisplayPrice(property, activeType)}
        </p>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground border-t border-border/40 py-4">
            {property.chambres !== null && (
              <div className="flex items-center gap-2">
                <Bed size={16} strokeWidth={1} />
                <span className="text-xs font-light tracking-wide">{property.chambres} {t('biens.chambres_plural')}</span>
              </div>
            )}
            {property.salles_de_bain !== null && (
              <div className="flex items-center gap-2">
                <Bath size={16} strokeWidth={1} />
                <span className="text-xs font-light tracking-wide">{property.salles_de_bain} Sdb</span>
              </div>
            )}
            {property.surface_terrain !== null && (
              <div className="flex items-center gap-2">
                <Maximize size={16} strokeWidth={1} />
                <span className="text-xs font-light tracking-wide">{property.surface_terrain} {t('biens.surface')}</span>
              </div>
            )}
            {property.equipements?.includes('Parking') && (
              <div className="flex items-center gap-2">
                <Car size={16} strokeWidth={1} />
                <span className="text-xs font-light tracking-wide">Pk.</span>
              </div>
            )}
          </div>

          <div className="w-full text-center border border-border/60 py-3 text-[10px] tracking-widest uppercase font-sans font-medium hover:bg-foreground hover:text-background transition-colors duration-300">
            Voir les détails
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
