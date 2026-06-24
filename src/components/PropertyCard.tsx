import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Bien, BienService } from "@/types/property";
import { MessageCircle, MapPin } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { EASE_LUXURY } from "@/components/motion/Animations";
import { ServiceTag, TypeBadge, PhotoCount, SoldBanner, SpecsBar, EquipmentMicroTags, QuartierTag } from "@/components/PropertyTags";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA").format(price) + " MAD";
};

interface PropertyCardProps {
  property: Bien;
  revealDelay?: number;
  activeType?: string;
}

const PropertyCard = ({ property, revealDelay = 0, activeType }: PropertyCardProps) => {
  const { t, i18n } = useTranslation();

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  const getDisplayPrice = (bien: Bien, activeService?: string) => {
    if (activeService === 'vente' && bien.prix_vente) 
      return `${formatPrice(bien.prix_vente)}`;
    
    if (activeService === 'location-longue-duree' && bien.prix_location_longue) 
      return `${formatPrice(bien.prix_location_longue)} ${tL("/ mois", "/ month", "/ mes")}`;
      
    if (activeService === 'location-courte-duree' && bien.prix_location_courte) 
      return `${formatPrice(bien.prix_location_courte)} ${tL("/ nuit", "/ night", "/ noche")}`;

    if (bien.services.includes('vente') && bien.prix_vente) 
      return `${formatPrice(bien.prix_vente)}`;
      
    if (bien.services.includes('location-longue-duree') && bien.prix_location_longue) 
      return `${formatPrice(bien.prix_location_longue)} ${tL("/ mois", "/ month", "/ mes")}`;
      
    if (bien.services.includes('location-courte-duree') && bien.prix_location_courte) 
      return `${formatPrice(bien.prix_location_courte)} ${tL("/ nuit", "/ night", "/ noche")}`;

    return bien.prix ? `${formatPrice(bien.prix)}` : tL("Prix sur demande", "Price on request", "Precio bajo petición");
  };

  const image = property.photos?.length ? property.photos[0] : "/placeholder.svg";

  const { ref: cardRef, inView } = useInView({ triggerOnce: true, threshold: 0.12 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: revealDelay * 0.001, ease: EASE_LUXURY }}
      whileHover={{ y: -6 }}
      className="group"
      style={{ contain: 'layout' }}
    >
    <Link
      to={`/bien/${property.id}`}
      className="block h-full flex flex-col overflow-hidden bg-white shadow-md hover:shadow-2xl transition-shadow duration-500"
    >
      {/* ═══ IMAGE SECTION — Infos superposées ═══════════════════════════════ */}
      <div className="overflow-hidden aspect-[16/11] relative bg-muted shrink-0">
        <OptimizedImage
          src={image}
          alt={property.titre}
          eager={false}
          size="card"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          wrapperClassName="absolute inset-0"
          style={{ willChange: 'none' }}
        />

        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />

        {/* Sold Banner */}
        {property.statut === 'vendu-loue' && <SoldBanner />}

        {/* ── Top Left: Service tags + New badge ──────────────────────────── */}
        <div className="absolute top-3 left-3 z-30 flex flex-wrap items-start gap-1.5">
          {property.services.map((s) => (
            <ServiceTag key={s} service={s} variant="overlay" />
          ))}

        </div>

        {/* ── Top Right: Type badge + WhatsApp + Photo count ──────────────── */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 items-end">
          <TypeBadge type={property.type} variant="overlay" />
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(`https://wa.me/212605387041?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property.titre} (Ref: ${property.reference || property.id})`)}`, '_blank');
            }}
            className="bg-[#25D366] hover:bg-[#20b858] text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center opacity-0 group-hover:opacity-100"
            title="Contacter par WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>

        {/* ── Bottom: Photo count ─────────────────────────────────────────── */}
        {property.photos?.length > 1 && (
          <div className="absolute bottom-3 right-3 z-30">
            <PhotoCount count={property.photos.length} />
          </div>
        )}

        {/* ── Bottom Left: Prix overlay ───────────────────────────────────── */}
        <div className="absolute bottom-3 left-3 z-30">
          <div className="backdrop-blur-md bg-black/40 border border-white/15 px-3 py-1.5 rounded-[3px]">
            <span className="text-white font-serif text-lg font-medium tracking-wide">
              {getDisplayPrice(property, activeType)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT SECTION — Titre, Specs, Équipements ═════════════════════ */}
      <div className="px-4 pt-4 pb-3 flex flex-col flex-1">
        {/* Titre */}
        <h3 className="text-lg font-serif mb-2 leading-tight line-clamp-1 group-hover:text-accent transition-colors duration-300">
          {property.titre}
        </h3>

        {/* Quartier */}
        {property.quartier && (
          <div className="mb-3">
            <QuartierTag quartier={property.quartier} />
          </div>
        )}

        {/* Specs bar — Chambres, SdB, Surface, Parking */}
        <div className="mb-3 pb-3 border-b border-border/30">
          <SpecsBar
            chambres={property.chambres}
            sallesDeBain={property.salles_de_bain}
            surface={property.surface_terrain}
            hasParking={property.equipements?.includes('Parking') ?? false}
          />
        </div>

        {/* Equipment micro tags */}
        {property.equipements && property.equipements.length > 0 && (
          <div className="mb-3">
            <EquipmentMicroTags equipements={property.equipements} max={3} />
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-auto">
          <div className="w-full text-center border border-foreground/80 py-2.5 text-[9px] tracking-[0.2em] uppercase font-sans font-medium
            hover:bg-foreground hover:text-background transition-all duration-300 group-hover:bg-foreground group-hover:text-background">
            {tL("Voir les détails", "View details", "Ver detalles")}
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  );
};

export default PropertyCard;
