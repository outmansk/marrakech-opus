import { MapPin, Bed, Bath, Maximize, Car, Waves, TreePine, Armchair, Camera, Sparkles, Home, Building2, Building, LandPlot, Castle } from "lucide-react";
import type { BienService, BienType } from "@/types/property";
import { useTranslation } from "react-i18next";

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTY TAGS — Composants réutilisables pour les tags premium
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Couleurs par service ─────────────────────────────────────────────────── */
const SERVICE_STYLES: Record<BienService, { bg: string; text: string; border: string }> = {
  'vente':                  { bg: 'bg-amber-700/15',   text: 'text-amber-800',    border: 'border-amber-700/20' },
  'location-longue-duree':  { bg: 'bg-emerald-600/15', text: 'text-emerald-700',  border: 'border-emerald-600/20' },
  'location-courte-duree':  { bg: 'bg-blue-600/15',    text: 'text-blue-700',     border: 'border-blue-600/20' },
  'sous-location':          { bg: 'bg-violet-600/15',   text: 'text-violet-700',   border: 'border-violet-600/20' },
};

/* ── Couleurs par type de bien ────────────────────────────────────────────── */
const TYPE_STYLES: Record<BienType, { bg: string; text: string; icon: typeof Home }> = {
  'villa':        { bg: 'bg-orange-800/12', text: 'text-orange-800', icon: Home },
  'riad':         { bg: 'bg-red-800/12',    text: 'text-red-800',    icon: Castle },
  'appartement':  { bg: 'bg-blue-800/12',   text: 'text-blue-800',   icon: Building2 },
  'maison':       { bg: 'bg-teal-800/12',   text: 'text-teal-800',   icon: Building },
  'terrain':      { bg: 'bg-yellow-800/12', text: 'text-yellow-800', icon: LandPlot },
};

/* ── Icônes pour équipements clés ─────────────────────────────────────────── */
const EQUIPMENT_ICONS: Record<string, typeof Waves> = {
  'Piscine': Waves,
  'Jardin': TreePine,
  'Meublé': Armchair,
};

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE TAG — Tag coloré pour le type de service (Vente, Location...)
   ═══════════════════════════════════════════════════════════════════════════ */
export const ServiceTag = ({ service, variant = 'default' }: { service: BienService; variant?: 'default' | 'overlay' | 'detail' }) => {
  const { t } = useTranslation();
  const style = SERVICE_STYLES[service];
  
  const label = (() => {
    switch (service) {
      case 'vente':                  return t('services.vente');
      case 'location-courte-duree':  return t('services.location_courte');
      case 'location-longue-duree':  return t('services.location_longue');
      case 'sous-location':          return t('services.sous_location');
      default:                       return service;
    }
  })();

  if (variant === 'overlay') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-sans font-semibold
        backdrop-blur-md bg-white/85 border border-white/40 text-[#0A0A0A] shadow-sm rounded-[3px]`}>
        {label}
      </span>
    );
  }

  if (variant === 'detail') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-sans font-semibold
        ${style.bg} ${style.text} border ${style.border} rounded-sm`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase font-sans font-semibold
      ${style.bg} ${style.text} border ${style.border} rounded-sm`}>
      {label}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE BADGE — Badge type de bien avec icône
   ═══════════════════════════════════════════════════════════════════════════ */
export const TypeBadge = ({ type, variant = 'default' }: { type: BienType; variant?: 'default' | 'overlay' }) => {
  const config = TYPE_STYLES[type];
  const Icon = config.icon;

  if (variant === 'overlay') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] tracking-[0.2em] uppercase font-sans font-medium
        backdrop-blur-md bg-white/80 text-[#0A0A0A] rounded-[3px] shadow-sm border border-white/30">
        <Icon size={10} strokeWidth={1.5} />
        {type}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase font-sans font-medium
      ${config.bg} ${config.text} rounded-sm`}>
      <Icon size={10} strokeWidth={1.5} />
      {type}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUARTIER TAG — Tag localisation avec icône MapPin
   ═══════════════════════════════════════════════════════════════════════════ */
export const QuartierTag = ({ quartier, variant = 'default' }: { quartier: string; variant?: 'default' | 'overlay' }) => {
  if (variant === 'overlay') {
    return (
      <span className="inline-flex items-center gap-1 text-white/90 text-[10px] tracking-wide font-sans font-light">
        <MapPin size={11} strokeWidth={1.5} />
        {quartier}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-[10px] tracking-wide font-sans font-light">
      <MapPin size={11} strokeWidth={1.5} className="text-accent" />
      {quartier}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW BADGE — Badge "Nouveau" animé (< 14 jours)
   ═══════════════════════════════════════════════════════════════════════════ */
export const NewBadge = ({ createdAt }: { createdAt: string }) => {
  const daysSince = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince > 14) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] tracking-[0.2em] uppercase font-sans font-bold
      bg-red-600 text-white rounded-[3px] shadow-md animate-pulse">
      <Sparkles size={9} strokeWidth={2} />
      NEW
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPMENT MICRO TAGS — Piscine, Jardin, Meublé
   ═══════════════════════════════════════════════════════════════════════════ */
export const EquipmentMicroTags = ({ equipements, max = 3 }: { equipements: string[]; max?: number }) => {
  const displayable = equipements.filter(eq => EQUIPMENT_ICONS[eq]).slice(0, max);
  if (displayable.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {displayable.map((eq) => {
        const Icon = EQUIPMENT_ICONS[eq];
        return (
          <span key={eq} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] tracking-wider uppercase font-sans
            bg-[#0A0A0A]/5 text-muted-foreground rounded-sm border border-[#0A0A0A]/5">
            <Icon size={10} strokeWidth={1.25} />
            {eq}
          </span>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PHOTO COUNT — Compteur de photos
   ═══════════════════════════════════════════════════════════════════════════ */
export const PhotoCount = ({ count }: { count: number }) => {
  if (count <= 1) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-sans font-medium
      backdrop-blur-md bg-black/50 text-white rounded-[3px] border border-white/10">
      <Camera size={11} strokeWidth={1.5} />
      {count}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SOLD BANNER — Ruban "Vendu / Loué"
   ═══════════════════════════════════════════════════════════════════════════ */
export const SoldBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-0 right-0 overflow-hidden w-28 h-28">
        <div className="absolute top-[14px] right-[-34px] w-[170px] bg-red-700/90 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase font-sans font-bold
          text-center py-1.5 rotate-45 shadow-lg border-y border-red-600/50">
          {t('biens.vendu')}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SPECS BAR — Barre de spécifications compacte (chambres, sdb, surface, parking)
   ═══════════════════════════════════════════════════════════════════════════ */
export const SpecsBar = ({ 
  chambres, 
  sallesDeBain, 
  surface, 
  hasParking,
  variant = 'default'
}: { 
  chambres: number | null; 
  sallesDeBain: number | null; 
  surface: number | null;
  hasParking: boolean;
  variant?: 'default' | 'overlay';
}) => {
  const { t } = useTranslation();
  
  const specs = [
    chambres !== null && { icon: Bed, value: `${chambres}`, label: t('biens.chambres_plural') },
    sallesDeBain !== null && { icon: Bath, value: `${sallesDeBain}`, label: 'Sdb' },
    surface !== null && { icon: Maximize, value: `${surface}`, label: t('biens.surface') },
    hasParking && { icon: Car, value: '', label: 'Parking' },
  ].filter(Boolean) as Array<{ icon: typeof Bed; value: string; label: string }>;

  if (specs.length === 0) return null;

  if (variant === 'overlay') {
    return (
      <div className="flex items-center gap-3">
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-1 text-white/90">
            <spec.icon size={13} strokeWidth={1.25} />
            <span className="text-[10px] font-sans font-light tracking-wide">
              {spec.value} {spec.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-muted-foreground">
      {specs.map((spec, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <spec.icon size={14} strokeWidth={1} />
          <span className="text-[11px] font-light tracking-wide font-sans">
            {spec.value} {spec.label}
          </span>
        </div>
      ))}
    </div>
  );
};
