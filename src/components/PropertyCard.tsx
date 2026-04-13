import { Link } from "react-router-dom";
import type { Property } from "@/types/property";
import { Bed, Car } from "lucide-react";

const formatPrice = (price: number, type: string) => {
  const formatted = new Intl.NumberFormat("fr-MA").format(price);
  switch (type) {
    case "vente":
      return `${formatted} MAD`;
    case "location_courte":
      return `${formatted} MAD / nuit`;
    case "location_longue":
      return `${formatted} MAD / mois`;
    default:
      return `${formatted} MAD`;
  }
};

const transactionLabel = (type: string) => {
  switch (type) {
    case "vente": return "Vente";
    case "location_courte": return "Location courte duree";
    case "location_longue": return "Location longue duree";
    default: return type;
  }
};

const PropertyCard = ({ property }: { property: Property }) => {
  const mainImage = property.image_urls?.[0] || "/placeholder.svg";

  return (
    <Link to={`/bien/${property.id}`} className="group block">
      <div className="overflow-hidden aspect-[4/3]">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
            {transactionLabel(property.transaction_type)}
          </span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
            {property.property_type}
          </span>
        </div>
        <h3 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors">
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
