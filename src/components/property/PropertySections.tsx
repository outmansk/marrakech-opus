import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown, Bath, BedDouble, Car, Check, Clock, CookingPot, Droplets, Dumbbell, FileText, Flame, Home, KeyRound,
  LandPlot, MapPin, MessageCircle, Route, Ruler, ShieldCheck, Snowflake, Sofa, Sparkles, Sprout, Sun, Thermometer, Trees, Video, Waves, Wifi,
} from "lucide-react";
import type { Bien } from "@/types/property";
import type { Lang } from "@/i18n/routing";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { distanceLabel, equipmentName, placeName } from "@/lib/propertyI18n";
import { ZONES, furnishedOf, zoneLabel, zoneOf } from "@/content/zones";
import { AGENCY } from "@/content/agency";
import { descriptionBlocks, formatPrice } from "@/lib/propertyDetail";

// Building blocks of the property page (src/pages/PropertyDetail.tsx). Only real data:
// the property row, the confirmed rental rules and the agency contact details.


const card = "rounded-xl border border-border/70 bg-card shadow-[0_2px_12px_-2px_rgba(33,31,27,0.04),0_1px_3px_rgba(33,31,27,0.02)]";
const sectionTitle = "font-serif text-[26px] leading-tight text-foreground md:text-[30px]";

export function SectionHeading({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className={sectionTitle}>{title}</h2>
      {aside && <span className="shrink-0 text-xs font-semibold text-primary">{aside}</span>}
    </div>
  );
}

/** Bedrooms, bathrooms, living area, plot: icon cards (2 columns on mobile, 4 on desktop). */
export function SpecsGrid({ property }: { property: Bien }) {
  const tL = useLocalizedText();
  const specs: { icon: LucideIcon; value: string; label: string }[] = [];
  if (property.chambres != null) specs.push({ icon: BedDouble, value: String(property.chambres), label: property.chambres > 1 ? tL("Chambres", "Bedrooms", "Dormitorios") : tL("Chambre", "Bedroom", "Dormitorio") });
  if (property.salles_de_bain != null) specs.push({ icon: Bath, value: String(property.salles_de_bain), label: property.salles_de_bain > 1 ? tL("Salles de bain", "Bathrooms", "Baños") : tL("Salle de bain", "Bathroom", "Baño") });
  if (property.surface_habitable) specs.push({ icon: Ruler, value: `${property.surface_habitable} m²`, label: tL("Surface habitable", "Living area", "Superficie habitable") });
  if (property.surface_terrain && property.surface_terrain !== property.surface_habitable) specs.push({ icon: LandPlot, value: `${property.surface_terrain} m²`, label: tL("Terrain", "Plot", "Parcela") });
  if (!specs.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
      {specs.map(({ icon: Icon, value, label }) => (
        <div key={label} className={`${card} flex items-center gap-3 p-3 md:p-4`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap text-[15px] font-semibold text-foreground">{value}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** What the agency actually offers: confirmed facts only. */
export function Reassurance({ rental }: { rental: boolean }) {
  const tL = useLocalizedText();
  const items: { icon: LucideIcon; strong: string; text: string }[] = [
    { icon: Video, strong: tL("Visite sur place ou en vidéo", "In-person or video viewing", "Visita en persona o por vídeo"), text: tL("organisée avec vous sur WhatsApp.", "arranged with you on WhatsApp.", "organizada con usted por WhatsApp.") },
    { icon: MessageCircle, strong: tL("Un seul contact", "One point of contact", "Un único contacto"), text: tL(`téléphone et WhatsApp au ${AGENCY.phoneDisplay}.`, `phone and WhatsApp on ${AGENCY.phoneDisplay}.`, `teléfono y WhatsApp en el ${AGENCY.phoneDisplay}.`) },
    rental
      ? { icon: FileText, strong: tL("Dossier simple", "Simple paperwork", "Trámites sencillos"), text: tL("un passeport ou une carte d’identité suffit.", "a passport or national ID card is all you need.", "basta con un pasaporte o un documento de identidad.") }
      : { icon: KeyRound, strong: tL("Accompagnement", "Support", "Acompañamiento"), text: tL("de la visite jusqu’à la signature chez le notaire.", "from the viewing to signing at the notary.", "desde la visita hasta la firma ante notario.") },
  ];
  return (
    <div className="rounded-xl bg-primary-soft p-4 md:p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {rental ? tL("Louer avec Live In Marrakech", "Renting with Live In Marrakech", "Alquilar con Live In Marrakech") : tL("Acheter avec Live In Marrakech", "Buying with Live In Marrakech", "Comprar con Live In Marrakech")}
      </p>
      <ul className="grid gap-2.5 text-sm text-foreground/85 md:grid-cols-3 md:gap-4">
        {items.map(({ icon: Icon, strong, text }) => (
          <li key={strong} className="flex items-start gap-2.5">
            <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span><strong className="font-semibold">{strong} :</strong> {text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Description in sections ───────────────────────────────────────────────

const TERMS_HEADING = /^(conditions|terms|condiciones)$/i;

const blockIcon = (title: string): LucideIcon => {
  const t = title.toLowerCase();
  if (/ferme|farm|finca/.test(t)) return Sprout;
  if (/ext[ée]rieur|outside|exterior|jardin|garden|piscine|pool/.test(t)) return Trees;
  if (/r[ée]sidence|urbanizaci|s[ée]curit|security/.test(t)) return ShieldCheck;
  if (/acc[eè]s|access|acceso/.test(t)) return Route;
  if (/villa|maison|house|appartement|apartment|piso|riad|casa/.test(t)) return Home;
  return Sparkles;
};

function BlockBody({ body }: { body: string }) {
  const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => line.startsWith("•"));
  if (bullets.length === lines.length) {
    return (
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {bullets.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Check size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
            <span>{line.replace(/^•\s*/, "")}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="whitespace-pre-line">{body}</p>;
}

/** "About this property": lead paragraph, then one card per titled section of the description. */
export function DescriptionSections({ text, hideTerms }: { text: string; hideTerms: boolean }) {
  const tL = useLocalizedText();
  const blocks = descriptionBlocks(text).filter((block) => !(hideTerms && block.title && TERMS_HEADING.test(block.title)));
  if (!blocks.length) return null;
  const titled = blocks.filter((block) => block.title);
  return (
    <section>
      <SectionHeading title={tL("À propos de ce bien", "About this property", "Sobre este inmueble")} />
      {titled.length < 2 ? (
        <div className="whitespace-pre-line text-[15px] font-light leading-relaxed text-foreground/80 md:text-base">{text}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, i) =>
            block.title ? (
              <div key={i} className={`${card} p-4 md:p-5`}>
                <h3 className="mb-2.5 flex items-center gap-2.5 font-serif text-xl text-foreground">
                  {(() => { const Icon = blockIcon(block.title); return <Icon size={20} strokeWidth={1.5} className="text-primary" aria-hidden="true" />; })()}
                  {block.title}
                </h3>
                <div className="text-[15px] font-light leading-relaxed text-foreground/80"><BlockBody body={block.body} /></div>
              </div>
            ) : (
              <p key={i} className="whitespace-pre-line text-[15px] font-light leading-relaxed text-foreground/80 md:text-base">{block.body}</p>
            ),
          )}
        </div>
      )}
    </section>
  );
}

// ─── Amenities ─────────────────────────────────────────────────────────────

const AMENITY_ICONS: Record<string, LucideIcon> = {
  Piscine: Waves, Jardin: Trees, Climatisation: Snowflake, "Chauffage central": Thermometer, "Cuisine équipée": CookingPot,
  Parking: Car, "Gardiennage 24/7": ShieldCheck, Ascenseur: ArrowUpDown, "Salle de sport": Dumbbell, Terrasse: Sun,
  Hammam: Droplets, Cheminée: Flame, "Internet Fibre": Wifi, Meublé: Sofa,
};

export function AmenitiesGrid({ equipements, lang }: { equipements: string[]; lang: Lang }) {
  const tL = useLocalizedText();
  if (!equipements.length) return null;
  return (
    <section>
      <SectionHeading title={tL("Équipements et prestations", "Features and amenities", "Equipamiento y servicios")} />
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {equipements.map((eq) => {
          const Icon = AMENITY_ICONS[eq] ?? Check;
          return (
            <li key={eq} className="flex min-h-12 items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
              <Icon size={19} strokeWidth={1.5} className="shrink-0 text-primary" aria-hidden="true" />
              <span className="text-[13px] font-medium text-foreground/85">{equipmentName(eq, lang)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Location ──────────────────────────────────────────────────────────────

/** Area text (from src/content/zones.ts) and the travel times saved on the property. No map: no coordinates yet. */
export function LocationBlock({ property, lang }: { property: Bien; lang: Lang }) {
  const tL = useLocalizedText();
  const zone = zoneOf(property);
  const nearby = property.proximites ?? [];
  if (!zone && !nearby.length) return null;
  return (
    <section>
      <SectionHeading title={tL("Situation", "Location", "Ubicación")} aside={<span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} aria-hidden="true" />{zoneLabel(property, lang)}</span>} />
      {zone && <p className="mb-3 text-[15px] font-light leading-relaxed text-foreground/80">{ZONES[zone].text[lang]}</p>}
      {nearby.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {nearby.map((prox) => (
            <li key={`${prox.place}-${prox.time}`} className="rounded-lg bg-muted/50 p-3 text-center">
              <span className="block truncate text-[12px] text-muted-foreground">{placeName(prox.place, lang)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                {distanceLabel(prox.time, lang)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Rental terms ──────────────────────────────────────────────────────────

/** Confirmed long-term rental rules, with the deposit amount computed from the rent. */
export function RentalTerms({ property }: { property: Bien }) {
  const tL = useLocalizedText();
  const rent = property.prix_location_longue;
  const furnished = furnishedOf(property);
  // Confirmed rule: one month's rent, furnished or not.
  const deposit = `${tL("1 mois de loyer", "1 month’s rent", "1 mes de alquiler")}${rent ? ` (${formatPrice(rent, property.devise)})` : ""}`;
  const rows = [
    { label: tL("Durée du bail", "Lease", "Contrato"), value: tL("1 an minimum", "1 year minimum", "1 año como mínimo") },
    ...(furnished !== null ? [{ label: tL("Logement", "Home", "Vivienda"), value: furnished ? tL("Meublé", "Furnished", "Amueblado") : tL("Vide (non meublé)", "Unfurnished", "Sin amueblar") }] : []),
    { label: tL("Dépôt de garantie", "Security deposit", "Fianza"), value: deposit, strong: true },
    { label: tL("Pièces à fournir", "Documents", "Documentos"), value: tL("Passeport ou carte d’identité", "Passport or national ID card", "Pasaporte o documento de identidad") },
    { label: tL("Visite", "Viewing", "Visita"), value: tL("Sur place ou en vidéo", "In person or by video", "En persona o por vídeo") },
  ];
  return (
    <section className="rounded-xl bg-muted/50 p-4 md:p-5">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-[24px] text-foreground">
        <FileText size={20} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
        {tL("Conditions de location", "Rental terms", "Condiciones de alquiler")}
      </h2>
      <dl className="flex flex-col text-sm">
        {rows.map((row, i) => (
          <div key={row.label} className={`flex items-baseline justify-between gap-4 rounded px-2.5 py-2 ${i % 2 ? "bg-card" : ""}`}>
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className={`text-right font-semibold ${row.strong ? "text-primary" : "text-foreground"}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
