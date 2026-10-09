import { Link } from "react-router-dom";
import { ArrowRight, Bath, Bed, MapPin, Maximize, MessageCircle } from "lucide-react";
import type { Bien } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { useLocalePath } from "@/hooks/useLocalePath";
import { propertyPath } from "@/lib/propertyUrl";
import { propertyText, typeName } from "@/lib/propertyI18n";
import { zoneLabel } from "@/content/zones";
import FurnishedBadge from "@/components/FurnishedBadge";
import { getServices, isSoldOnly, isUnavailable } from "@/lib/propertyServices";

interface PropertyCardProps {
  property: Bien;
  revealDelay?: number;
  activeType?: string;
}

type PriceKind = "vente" | "location-longue-duree" | "location-courte-duree";

const formatPrice = (price: number, devise: string = 'MAD') => new Intl.NumberFormat("fr-MA").format(price) + " " + devise;

const priceFor = (property: Bien, kind: PriceKind) =>
  kind === "vente" ? property.prix_vente : kind === "location-longue-duree" ? property.prix_location_longue : property.prix_location_courte;

const resolvePrice = (property: Bien, activeType?: string): { kind: PriceKind; amount: number | null } => {
  const kinds: PriceKind[] = ["vente", "location-longue-duree", "location-courte-duree"];
  const active = kinds.find((kind) => kind === activeType);
  if (active && priceFor(property, active)) return { kind: active, amount: priceFor(property, active) };
  const priced = kinds.find((kind) => priceFor(property, kind));
  if (priced) return { kind: priced, amount: priceFor(property, priced) };

  // No dedicated price: fall back to the listing's service and the legacy price.
  const services = getServices(property);
  const rents = services.includes("location-longue-duree") || services.includes("sous-location");
  const kind = active ?? (services.includes("vente") ? "vente" : rents ? "location-longue-duree" : services.includes("location-courte-duree") ? "location-courte-duree" : "vente");
  return { kind, amount: property.prix || null };
};

const PropertyCard = ({ property, activeType }: PropertyCardProps) => {
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  const titre = propertyText(property, lang).titre;

  const devise = property.devise || 'MAD';
  const { kind, amount } = resolvePrice(property, activeType);
  const isSale = kind === "vente";
  const isSublet = !isSale && getServices(property).includes("sous-location");

  const badge = isSale
    ? tL("À vendre", "For sale", "En venta")
    : kind === "location-longue-duree"
      ? tL("Location longue durée", "Long-term rent", "Alquiler de larga duración")
      : tL("Séjour", "Stay", "Estancia");
  const priceLabel = isSale
    ? tL("Prix de vente", "Sale price", "Precio de venta")
    : kind === "location-longue-duree"
      ? tL("Loyer mensuel", "Monthly rent", "Alquiler mensual")
      : tL("Prix par nuit", "Price per night", "Precio por noche");
  const priceSuffix = kind === "location-longue-duree" ? tL("/ mois", "/ month", "/ mes") : kind === "location-courte-duree" ? tL("/ nuit", "/ night", "/ noche") : null;

  const image = property.photo_principale || property.photos?.[0] || "/placeholder.svg";
  const surface = property.surface_habitable || property.surface_terrain;
  const typeLabel = property.type ? typeName(property.type, lang) : null;
  const href = lp(propertyPath(property));
  const viewLabel = tL("Voir le bien", "View property", "Ver la propiedad");
  const whatsappUrl = `https://wa.me/212605387041?text=${encodeURIComponent(tL(
    `Bonjour, je suis intéressé(e) par le bien : ${property.titre}${property.reference ? ` (Réf. ${property.reference})` : ""}`,
    `Hello, I am interested in this property: ${titre}${property.reference ? ` (Ref. ${property.reference})` : ""}`,
    `Hola, me interesa este inmueble: ${titre}${property.reference ? ` (Ref. ${property.reference})` : ""}`,
  ))}`;

  const specs = [
    property.chambres != null && property.chambres > 0 && { icon: Bed, value: String(property.chambres), label: property.chambres > 1 ? tL("Chambres", "Bedrooms", "Dormitorios") : tL("Chambre", "Bedroom", "Dormitorio") },
    property.salles_de_bain != null && property.salles_de_bain > 0 && { icon: Bath, value: String(property.salles_de_bain), label: property.salles_de_bain > 1 ? tL("Salles de bain", "Bathrooms", "Baños") : tL("Salle de bain", "Bathroom", "Baño") },
    surface != null && surface > 0 && { icon: Maximize, value: `${surface} m²`, label: tL("Surface", "Area", "Superficie") },
  ].filter(Boolean) as { icon: typeof Bed; value: string; label: string }[];

  return (
    <div className="mobile-property-visible h-full w-full [container-type:inline-size]">
      <article className="group flex h-full flex-col border border-[#e6ddd0] bg-[#fffdf9] text-[#211f1b] transition-[box-shadow,border-color] duration-300 hover:border-[#d6c9b6] hover:shadow-[0_24px_44px_-30px_rgba(33,31,27,0.45)]">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] flex-none overflow-hidden bg-[#e9e1d5]">
          <OptimizedImage src={image} alt={`${typeLabel ?? ""} — ${titre}`} size="card" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" wrapperClassName="h-full w-full" />
          <span className={`pointer-events-none absolute left-3.5 top-3.5 z-[1] px-3 pb-2 pt-[9px] text-xs font-medium uppercase leading-none tracking-[0.12em] ${isSale ? "bg-[#211f1b] text-[#fbf8f2]" : "bg-[#a4573e] text-white"}`}>{badge}</span>
          {isUnavailable(property) && (
            <span className="absolute inset-0 z-[2] grid place-items-center bg-[#211f1b]/45">
              <span className="bg-[#fbf8f2] px-4 pb-2.5 pt-3 text-xs font-semibold uppercase leading-none tracking-[0.2em] text-[#211f1b]">
                {isSoldOnly(property) ? tL("Déjà vendu", "Already sold", "Ya vendido") : tL("Déjà loué", "Already rented", "Ya alquilado")}
              </span>
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-5 p-[clamp(18px,6cqi,26px)]">
          <div className="flex flex-col gap-2.5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium uppercase leading-[1.35] tracking-[0.12em]">
              {typeLabel && <span className="text-[#a4573e]">{typeLabel}</span>}
              <span className="flex items-center gap-[5px] text-[#655f56]"><MapPin size={14} strokeWidth={1.6} className="flex-none" aria-hidden="true" />{zoneLabel(property, lang)}</span>
            </p>
            <FurnishedBadge property={property} />
            <h3 className="m-0 text-[clamp(25px,7.4cqi,29px)] font-medium leading-[1.12] tracking-[-0.005em] [text-wrap:pretty]">
              <Link to={href} className="text-[#211f1b] transition-colors duration-200 hover:text-[#a4573e]">{titre}</Link>
            </h3>
          </div>

          <div className="mt-auto flex flex-col gap-[18px]">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase leading-[1.35] tracking-[0.1em] text-[#655f56]">
                {isSublet ? `${priceLabel} · ${tL("Sous-location autorisée", "Subletting allowed", "Subarriendo permitido")}` : priceLabel}
              </span>
              {amount ? (
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="whitespace-nowrap font-serif text-[31px] font-medium leading-[1.05]">{formatPrice(amount, devise)}</span>
                  {priceSuffix && <span className="text-[15px] leading-[1.2] text-[#655f56]">{priceSuffix}</span>}
                </p>
              ) : (
                <p className="font-serif text-[27px] font-medium leading-[1.1]">{tL("Prix sur demande", "Price on request", "Precio bajo petición")}</p>
              )}
            </div>

            {specs.length > 0 && (
              <ul className="flex flex-wrap gap-x-[26px] gap-y-3.5 border-t border-[#ece4d8] pt-4">
                {specs.map(({ icon: Icon, value, label }) => (
                  <li key={label} className="flex flex-col gap-1">
                    <span className="flex items-center gap-[7px] whitespace-nowrap text-base font-medium leading-[1.1]"><Icon size={18} strokeWidth={1.5} className="flex-none text-[#8b6f5c]" aria-hidden="true" />{value}</span>
                    <span className="text-xs leading-[1.2] text-[#655f56]">{label}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              <Link to={href} aria-label={`${viewLabel} : ${titre}`} className="flex min-h-[50px] flex-[1_1_150px] items-center justify-between gap-2.5 whitespace-nowrap bg-[#211f1b] px-[15px] text-sm font-medium leading-none tracking-[0.02em] text-[#fbf8f2] transition-colors duration-200 hover:bg-[#a4573e] hover:text-white">
                <span>{viewLabel}</span>
                <ArrowRight size={18} strokeWidth={1.5} className="flex-none" aria-hidden="true" />
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`${tL("Se renseigner sur WhatsApp", "Ask on WhatsApp", "Consultar por WhatsApp")} : ${titre}`} className="flex min-h-[50px] flex-[1_1_110px] items-center justify-center gap-2 whitespace-nowrap border border-[#211f1b] px-3.5 text-sm font-medium leading-none tracking-[0.02em] text-[#211f1b] transition-colors duration-200 hover:bg-[#211f1b] hover:text-[#fbf8f2]">
                <MessageCircle size={18} strokeWidth={1.5} className="flex-none" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PropertyCard;
