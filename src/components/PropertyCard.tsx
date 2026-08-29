import { Link } from "react-router-dom";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Bien } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface PropertyCardProps {
  property: Bien;
  revealDelay?: number;
  activeType?: string;
}

const formatPrice = (price: number) => new Intl.NumberFormat("fr-MA").format(price) + " MAD";

const PropertyCard = ({ property, revealDelay = 0, activeType }: PropertyCardProps) => {
  const { i18n } = useTranslation();
  const language = i18n.language?.slice(0, 2) ?? "fr";
  const tL = (fr: string, en: string, es: string) => language === "en" ? en : language === "es" ? es : fr;

  const price = (() => {
    if (activeType === "vente" && property.prix_vente) return formatPrice(property.prix_vente);
    if (activeType === "location-longue-duree" && property.prix_location_longue) return `${formatPrice(property.prix_location_longue)} ${tL("/ mois", "/ month", "/ mes")}`;
    if (activeType === "location-courte-duree" && property.prix_location_courte) return `${formatPrice(property.prix_location_courte)} ${tL("/ nuit", "/ night", "/ noche")}`;
    if (property.prix_vente) return formatPrice(property.prix_vente);
    if (property.prix_location_longue) return `${formatPrice(property.prix_location_longue)} ${tL("/ mois", "/ month", "/ mes")}`;
    if (property.prix_location_courte) return `${formatPrice(property.prix_location_courte)} ${tL("/ nuit", "/ night", "/ noche")}`;
    return property.prix ? formatPrice(property.prix) : tL("Prix sur demande", "Price on request", "Precio bajo petición");
  })();

  const image = property.photo_principale || property.photos?.[0] || "/placeholder.svg";
  const surface = property.surface_habitable || property.surface_terrain;
  const service = property.services?.[0];
  const serviceLabel = service === "vente" ? tL("À vendre", "For sale", "En venta") : service === "location-longue-duree" ? tL("Location annuelle", "Long-term rent", "Alquiler anual") : tL("Séjour", "Stay", "Estancia");

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45, delay: revealDelay / 1000 }} className="mobile-property-visible group">
      <Link to={`/bien/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e9e1d5] md:rounded-none">
          <OptimizedImage src={image} alt={property.titre} size="card" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" wrapperClassName="h-full w-full" />
          <div className="absolute left-4 top-4 bg-[#f6f1e8]/95 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4d493f]">{serviceLabel}</div>
          {property.statut === "vendu-loue" && <div className="absolute inset-0 grid place-items-center bg-[#211f1b]/50 text-xs font-semibold uppercase tracking-[0.2em] text-white">{tL("Vendu / Loué", "Sold / Rented", "Vendido / Alquilado")}</div>}
        </div>
        <div className="border-b border-[#2b2722]/15 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#777065]"><MapPin size={13} strokeWidth={1.4} />{property.quartier || "Marrakech"}</p>
              <h3 className="mt-2 line-clamp-2 text-[27px] leading-[1.02] tracking-[-0.02em] text-[#211f1b] transition-colors group-hover:text-[#a4573e]">{property.titre}</h3>
            </div>
            <span className="shrink-0 pt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#a4573e]">{property.type}</span>
          </div>
          <p className="mt-4 font-serif text-[22px] text-[#211f1b]">{price}</p>
          <div className="mt-4 flex min-h-5 flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#655f56]">
            {property.chambres != null && property.chambres > 0 && <span className="flex items-center gap-1.5"><Bed size={15} strokeWidth={1.3} />{property.chambres} {tL("ch.", "beds", "hab.")}</span>}
            {property.salles_de_bain != null && property.salles_de_bain > 0 && <span className="flex items-center gap-1.5"><Bath size={15} strokeWidth={1.3} />{property.salles_de_bain} {tL("sdb", "baths", "baños")}</span>}
            {surface != null && surface > 0 && <span className="flex items-center gap-1.5"><Maximize size={15} strokeWidth={1.3} />{surface} m²</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PropertyCard;
