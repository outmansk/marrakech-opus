import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import type { Bien } from "@/types/property";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useBiens";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { getServices } from "@/lib/propertyServices";

type ServiceFilter = "all" | "sale" | "rent";

const SLIDE_GAP = 14;
const DEFAULT_FILTERS = { svc: "all" as ServiceFilter, type: "all", loc: "all" };

const locationOf = (property: Bien) => property.quartier || "Marrakech";
const matchesService = (property: Bien, svc: ServiceFilter) => {
  if (svc === "all") return true;
  const services = getServices(property);
  return svc === "sale" ? services.includes("vente") : services.includes("location-longue-duree") || services.includes("sous-location");
};

const PropertiesCarousel = () => {
  const tL = useLocalizedText();

  // Use React Query via the shared hook — cached, retried, deduped
  const { data: properties = [], isLoading: loading } = useProperties({ statut: "publie" });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const typeOptions = useMemo(() => [...new Set(properties.map((p) => p.type).filter(Boolean))], [properties]);
  const locOptions = useMemo(() => [...new Set(properties.map(locationOf))], [properties]);
  const visible = useMemo(
    () => properties.filter((p) => matchesService(p, filters.svc) && (filters.type === "all" || p.type === filters.type) && (filters.loc === "all" || locationOf(p) === filters.loc)),
    [properties, filters],
  );

  const total = visible.length;
  const current = Math.min(slide, Math.max(0, total - 1));
  const isFiltered = filters.svc !== "all" || filters.type !== "all" || filters.loc !== "all";
  const activeType = filters.svc === "sale" ? "vente" : filters.svc === "rent" ? "location-longue-duree" : undefined;

  const resetTrack = () => {
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
  };
  const setFilter = <K extends keyof typeof DEFAULT_FILTERS>(key: K, value: (typeof DEFAULT_FILTERS)[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    resetTrack();
  };
  const clear = () => {
    setFilters(DEFAULT_FILTERS);
    resetTrack();
  };

  const stepWidth = () => {
    const first = trackRef.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + SLIDE_GAP : 0;
  };
  const onScroll = () => {
    const el = trackRef.current;
    const step = stepWidth();
    if (!el || !step) return;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    const next = atEnd ? el.children.length - 1 : Math.round(el.scrollLeft / step);
    if (next !== slide) setSlide(next);
  };
  const go = (delta: number) => {
    const step = stepWidth();
    if (!trackRef.current || !step) return;
    const next = Math.max(0, Math.min(total - 1, current + delta));
    trackRef.current.scrollTo({ left: next * step, behavior: "smooth" });
    setSlide(next);
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const serviceOptions: { value: ServiceFilter; label: string }[] = [
    { value: "all", label: tL("Tout", "All", "Todo") },
    { value: "sale", label: tL("À vendre", "For sale", "En venta") },
    { value: "rent", label: tL("À louer", "For rent", "En alquiler") },
  ];
  const selectClass = "h-[54px] w-full cursor-pointer appearance-none truncate rounded-none border border-[#d9cebd] bg-[#fffdf9] pl-3.5 pr-10 text-sm font-medium leading-none text-[#211f1b] transition-colors hover:border-[#211f1b]";

  return (
    <section
      aria-labelledby="home-selection-title"
      className="bg-[#fbf8f2] px-[var(--gutter)] pb-[clamp(56px,6.6vw,104px)] pt-[clamp(52px,6.6vw,104px)] text-[#211f1b]"
      style={{ "--gutter": "clamp(20px, 4.45vw, 64px)" } as CSSProperties}
    >
      <div className="mx-auto flex max-w-[1312px] flex-col gap-[clamp(26px,2.6vw,40px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3.5">
            <p className="text-xs font-medium uppercase leading-none tracking-[0.22em] text-[#a4573e]">{tL("Notre sélection", "Our selection", "Nuestra selección")}</p>
            <h2 id="home-selection-title" className="m-0 max-w-[16ch] text-[clamp(37px,3.9vw,58px)] font-medium leading-[1.02] tracking-[-0.015em] [text-wrap:balance]">
              {tL("Des biens d’exception, choisis pour vous.", "Exceptional homes, chosen for you.", "Propiedades excepcionales, elegidas para usted.")}
            </h2>
          </div>
          <p className="flex-[0_1_380px] text-[15px] leading-[1.6] text-[#655f56] [text-wrap:pretty]">
            {tL("Villas, riads et appartements d'exception en vente et location à Marrakech.", "Exceptional villas, riads and apartments for sale and rent in Marrakech.", "Villas, riads y apartamentos excepcionales en venta y alquiler en Marrakech.")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-[clamp(22px,2.2vw,32px)]">
            {[0, 1, 2].map((item) => <div key={item} className="animate-pulse border border-[#e6ddd0] bg-[#fffdf9]"><div className="aspect-[4/3] bg-[#e9e1d5]" /><div className="m-6 h-6 w-2/3 bg-[#e9e1d5]" /><div className="mx-6 mb-6 h-8 w-1/2 bg-[#e9e1d5]" /></div>)}
          </div>
        ) : properties.length === 0 ? (
          <div className="border border-[#e6ddd0] bg-[#fffdf9] p-8 text-center text-sm text-[#655f56]">
            {tL("Notre prochaine sélection arrive bientôt.", "Our next selection is coming soon.", "Nuestra próxima selección llegará pronto.")}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-t border-[#e3d9ca] pt-[clamp(20px,2vw,28px)]">
              <div role="group" aria-label={tL("Type de transaction", "Transaction type", "Tipo de operación")} className="flex max-w-[420px] flex-[1_1_300px] gap-1 border border-[#d9cebd] bg-[#fffdf9] p-1">
                {serviceOptions.map(({ value, label }) => {
                  const pressed = filters.svc === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setFilter("svc", value)}
                      className={`min-h-11 min-w-0 flex-1 whitespace-nowrap rounded-none px-2.5 text-sm font-medium leading-[1.1] transition-colors duration-200 hover:shadow-[inset_0_0_0_1px_#211f1b] ${pressed ? "bg-[#211f1b] text-[#fbf8f2]" : "bg-transparent text-[#211f1b]"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="grid max-w-[460px] flex-[1_1_300px] grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
                <div className="relative flex">
                  <select aria-label={tL("Type de bien", "Property type", "Tipo de propiedad")} value={filters.type} onChange={(e) => setFilter("type", e.target.value)} className={selectClass}>
                    <option value="all">{tL("Tous les types", "All types", "Todos los tipos")}</option>
                    {typeOptions.map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                  </select>
                  <ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-[19px] text-[#655f56]" />
                </div>
                <div className="relative flex">
                  <select aria-label={tL("Quartier", "Neighborhood", "Barrio")} value={filters.loc} onChange={(e) => setFilter("loc", e.target.value)} className={selectClass}>
                    <option value="all">{tL("Tous les quartiers", "All neighborhoods", "Todos los barrios")}</option>
                    {locOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-[19px] text-[#655f56]" />
                </div>
              </div>
              <div className="flex min-h-11 flex-auto items-center justify-end gap-4">
                <p aria-live="polite" className="mr-auto text-sm leading-[1.3] text-[#655f56]">
                  <span className="font-medium text-[#211f1b]">{total}</span> {total > 1 ? tL("biens", "properties", "propiedades") : tL("bien", "property", "propiedad")}
                </p>
                {isFiltered && (
                  <button type="button" onClick={clear} className="min-h-11 text-sm font-medium leading-none text-[#a4573e] underline decoration-1 underline-offset-[5px] hover:text-[#211f1b]">
                    {tL("Effacer les filtres", "Clear filters", "Borrar filtros")}
                  </button>
                )}
              </div>
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-start gap-4 border border-[#e6ddd0] bg-[#fffdf9] px-7 py-10">
                <p className="font-serif text-[28px] font-medium leading-[1.15]">{tL("Aucun bien trouvé", "No property found", "No se encontró ninguna propiedad")}</p>
                <p className="text-[15px] leading-normal text-[#655f56]">{tL("Essayez de modifier ou d'effacer vos filtres.", "Try changing or clearing your filters.", "Pruebe a cambiar o borrar los filtros.")}</p>
                <button type="button" onClick={clear} className="min-h-[50px] rounded-none bg-[#a4573e] px-5 text-sm font-medium leading-none text-white hover:bg-[#8c4631]">
                  {tL("Effacer les filtres", "Clear filters", "Borrar filtros")}
                </button>
              </div>
            ) : (
              <>
                {/* Mobile: swipe carousel */}
                <div role="region" aria-roledescription="carrousel" aria-label={tL("Biens sélectionnés", "Selected properties", "Propiedades seleccionadas")} className="flex flex-col gap-[18px] md:hidden">
                  <div
                    ref={trackRef}
                    onScroll={onScroll}
                    className="-mx-[var(--gutter)] flex snap-x snap-mandatory items-stretch gap-3.5 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-0.5 scroll-pl-[var(--gutter)] scrollbar-hide"
                  >
                    {visible.map((property, index) => (
                      <div key={property.id} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} ${tL("sur", "of", "de")} ${total}`} className="flex min-w-0 flex-[0_0_calc(100%-22px)] snap-start">
                        <PropertyCard property={property} activeType={activeType} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                      <div aria-hidden="true" className="flex gap-1">
                        {visible.map((property, index) => <span key={property.id} className={`h-0.5 flex-1 transition-colors duration-200 ${index === current ? "bg-[#a4573e]" : "bg-[#ddd2c2]"}`} />)}
                      </div>
                      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] leading-[1.3] text-[#655f56]">
                        <span className="font-medium text-[#211f1b]">{pad(current + 1)} / {pad(total)}</span>
                        <span>{tL("Glissez pour voir les autres biens", "Swipe to see more properties", "Desliza para ver más propiedades")}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" aria-label={tL("Bien précédent", "Previous property", "Propiedad anterior")} onClick={() => go(-1)} disabled={current === 0} className="flex h-12 w-12 items-center justify-center rounded-none border border-[#211f1b] bg-transparent text-[#211f1b] hover:bg-[#211f1b] hover:text-[#fbf8f2] disabled:pointer-events-none disabled:opacity-35">
                        <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                      <button type="button" aria-label={tL("Bien suivant", "Next property", "Propiedad siguiente")} onClick={() => go(1)} disabled={current >= total - 1} className="flex h-12 w-12 items-center justify-center rounded-none border border-[#211f1b] bg-[#211f1b] text-[#fbf8f2] hover:border-[#a4573e] hover:bg-[#a4573e] hover:text-white disabled:pointer-events-none disabled:opacity-35">
                        <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablet & desktop: grid */}
                <div role="list" className="hidden grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-[clamp(22px,2.2vw,32px)] md:grid">
                  {visible.map((property) => (
                    <div key={property.id} role="listitem" className="flex min-w-0">
                      <PropertyCard property={property} activeType={activeType} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-[#e3d9ca] pt-[clamp(24px,2.4vw,34px)]">
          <p className="flex-[1_1_300px] text-[15px] leading-[1.6] text-[#655f56] [text-wrap:pretty]">
            {tL("Recherche par quartier, type de bien ou mot-clé dans le catalogue complet.", "Search by neighborhood, property type or keyword in the full catalogue.", "Busque por barrio, tipo de propiedad o palabra clave en el catálogo completo.")}
          </p>
          <Link to="/catalogue" className="flex min-h-[52px] max-w-[min(100%,360px)] flex-[1_1_260px] items-center justify-between gap-3 border border-[#211f1b] px-[18px] text-sm font-medium leading-none tracking-[0.02em] text-[#211f1b] transition-colors duration-200 hover:bg-[#211f1b] hover:text-[#fbf8f2]">
            <span>{tL("Voir tout le catalogue", "View the full catalogue", "Ver todo el catálogo")}</span>
            <ArrowRight size={18} strokeWidth={1.5} className="flex-none" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-px border-y border-[#e3d9ca] bg-[#e3d9ca]">
          {[
            { icon: ShieldCheck, text: tL("Biens vérifiés", "Verified properties", "Propiedades verificadas") },
            { icon: Check, text: tL("Accompagnement sur mesure", "Tailored support", "Atención personalizada") },
            { icon: MessageCircle, text: tL("Réponse rapide sur WhatsApp", "Fast WhatsApp reply", "Respuesta rápida por WhatsApp") },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 bg-[#fbf8f2] px-1 py-[18px] text-xs font-medium uppercase leading-[1.3] tracking-[0.12em] text-[#4f4a43]">
              <Icon size={18} strokeWidth={1.4} className="flex-none text-[#a4573e]" aria-hidden="true" />{text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PropertiesCarousel;
