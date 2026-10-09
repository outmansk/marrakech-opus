import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SEOHead from "@/components/SEOHead";
import { PageTransition } from "@/components/motion/Animations";
import NotFound from "@/pages/NotFound";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { BASE_URL } from "@/hooks/useSEO";
import { LANDINGS, availableFor, findLanding, landingCopyQueryOptions, landingPath, listingsFor } from "@/content/landings";
import { isUnavailable } from "@/lib/propertyServices";
import { propertyPath } from "@/lib/propertyUrl";
import { propertyText } from "@/lib/propertyI18n";
import { LANGS, stripLang, type Lang } from "@/i18n/routing";
import type { Bien } from "@/types/property";
import type { Landing } from "@/content/landings";

const WHATSAPP_URL = "https://wa.me/212605387041";
// Same filter as the catalogue: the pre-render loads this list once for both pages.
const PUBLIC_STATUTS = ["publie", "vendu-loue"];

const priceOf = (property: Bien, landing: Landing) =>
  (landing.service === "vente" ? property.prix_vente : property.prix_location_longue) || null;

const absolute = (path: string) => `${BASE_URL}${path === "/" ? "" : path}`;

export default function ServiceLanding() {
  const { pathname } = useLocation();
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();
  const landing = findLanding(lang, stripLang(pathname));

  const { data: copies } = useQuery(landingCopyQueryOptions(lang));
  const { data: properties = [], isLoading } = useQuery(propertiesQueryOptions({ statut: PUBLIC_STATUTS }));

  const listed = useMemo(() => (landing ? listingsFor(landing, properties) : []), [properties, landing]);

  if (!landing) return <NotFound />;
  const copy = copies?.[landing.id];
  if (!copy) return <div className="min-h-screen bg-[#fbf8f2]"><Header /></div>;

  const available = listed.filter((property) => !isUnavailable(property));
  const hub = LANDINGS.find((other) => other.service === landing.service && !other.type)!;
  // Pages without stock are noindex: link only to the ones that list something.
  const siblings = LANDINGS.filter((other) => other.service === landing.service && other.type && availableFor(other, properties).length > 0);
  const empty = !isLoading && available.length === 0;
  const otherHub = LANDINGS.find((other) => other.service !== landing.service && !other.type)!;
  const alternates = Object.fromEntries(LANGS.map((l) => [l, landingPath(landing.id, l)])) as Record<Lang, string>;
  const selfPath = landingPath(landing.id, lang);

  // Facts from our own catalogue (no invented market figures).
  const prices = available.map((property) => ({ value: priceOf(property, landing), devise: property.devise || "MAD" })).filter((p) => p.value);
  const devise = prices[0]?.devise;
  const sameCurrency = prices.filter((p) => p.devise === devise).map((p) => p.value!);
  const format = (value: number) => `${new Intl.NumberFormat(lang).format(value)} ${devise}`;
  const priceRange = sameCurrency.length === 0 ? null
    : sameCurrency.length === 1 ? format(sameCurrency[0])
    : `${format(Math.min(...sameCurrency))} – ${format(Math.max(...sameCurrency))}`;
  const perMonth = landing.service === "location-longue-duree" ? tL(" / mois", " / month", " / mes") : "";
  const listedAreas = [...new Set(available.map((property) => property.quartier).filter(Boolean))] as string[];
  const lastUpdate = listed.length
    ? new Date(Math.max(...listed.map((property) => Date.parse(property.updated_at)))).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;

  const catalogueLink = (quartier?: string) => {
    const params = new URLSearchParams({ type: landing.service });
    if (landing.type) params.set("kind", landing.type);
    if (quartier) params.set("quartier", quartier);
    return lp(`/catalogue?${params}`);
  };

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    ...(landing.type ? [{ name: hub.label[lang], path: landingPath(hub.id, lang) }] : []),
    { name: copy.h1, path: selfPath },
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": crumbs.map((crumb, index) => ({ "@type": "ListItem", "position": index + 1, "name": crumb.name, "item": absolute(crumb.path) })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "inLanguage": lang,
      "mainEntity": copy.faq.map(({ q, a }) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    },
    ...(available.length ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": copy.h1,
      "numberOfItems": available.length,
      "itemListElement": available.map((property, index) => ({ "@type": "ListItem", "position": index + 1, "url": absolute(lp(propertyPath(property))), "name": propertyText(property, lang).titre })),
    }] : []),
  ];

  const facts = [
    { label: tL("Biens disponibles", "Available properties", "Inmuebles disponibles"), value: isLoading ? "…" : String(available.length) },
    ...(priceRange ? [{ label: landing.service === "vente" ? tL("Prix", "Prices", "Precios") : tL("Loyers", "Rents", "Alquileres"), value: priceRange + perMonth }] : []),
    ...(listedAreas.length ? [{ label: tL("Quartiers", "Areas", "Barrios"), value: listedAreas.join(", ") }] : []),
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fbf8f2] text-[#211f1b]">
        <SEOHead title={copy.title} withBrand={false} description={copy.description} alternates={alternates} schema={schema} noindex={empty} />
        <Header />

        <main className="pt-16">
          {/* ── Intro + short answer ─────────────────────────────── */}
          <section className="border-b border-[#2b2722]/12 bg-[#ede5d8]">
            <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-10 lg:py-16 xl:px-16">
              <nav aria-label={tL("Fil d’Ariane", "Breadcrumb", "Ruta de navegación")} className="mb-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#777065]">
                {crumbs.map((crumb, index) => (
                  <span key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {index < crumbs.length - 1 ? <Link to={crumb.path} className="hover:text-[#a4573e]">{crumb.name}</Link> : <span aria-current="page">{crumb.name}</span>}
                  </span>
                ))}
              </nav>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#a4573e]">{copy.eyebrow}</p>
              <h1 className="max-w-[900px] text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[56px]">{copy.h1}</h1>
              <p className="mt-6 max-w-[760px] text-[15px] leading-[1.75] text-[#4f4a43] md:text-base">
                {copy.answer}{" "}
                {empty
                  ? tL("Aucun bien de ce type n’est disponible pour le moment : décrivez votre recherche, nous vous envoyons une sélection.", "No property of this type is available right now: describe your search and we will send you a selection.", "No hay ningún inmueble de este tipo disponible ahora mismo: describa su búsqueda y le enviaremos una selección.")
                  : available.length > 0 && tL(
                    `Live In Marrakech propose actuellement ${available.length} ${available.length > 1 ? "biens" : "bien"} de ce type, présentés ci-dessous.`,
                    `Live In Marrakech currently offers ${available.length} ${available.length > 1 ? "properties" : "property"} of this type, shown below.`,
                    `Live In Marrakech ofrece actualmente ${available.length} ${available.length > 1 ? "inmuebles" : "inmueble"} de este tipo, que verá a continuación.`,
                  )}
              </p>

              <dl className="mt-8 grid max-w-[900px] gap-px overflow-hidden border border-[#2b2722]/12 bg-[#2b2722]/12 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="bg-[#f6f1e8] px-5 py-4">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777065]">{fact.label}</dt>
                    <dd className="mt-1.5 font-serif text-[22px] leading-tight">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              {lastUpdate && <p className="mt-3 text-xs text-[#777065]">{tL("Données de notre catalogue, mises à jour le ", "Figures from our catalogue, updated on ", "Datos de nuestro catálogo, actualizados el ")}{lastUpdate}.</p>}
            </div>
          </section>

          {/* ── Hub: one entry per property type ─────────────────── */}
          {!landing.type && (
            <section className="mx-auto max-w-[1320px] px-5 pt-10 md:px-10 xl:px-16">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {siblings.map((sibling) => {
                  const count = availableFor(sibling, properties).length;
                  return (
                    <li key={sibling.id}>
                      <Link to={landingPath(sibling.id, lang)} className="group flex min-h-[72px] items-center justify-between gap-4 border border-[#2b2722]/15 bg-white px-5 py-4 transition-colors hover:border-[#a4573e]">
                        <span>
                          <span className="block font-serif text-[24px] leading-tight">{sibling.label[lang]}</span>
                          <span className="text-xs text-[#777065]">{count} {tL(count > 1 ? "biens disponibles" : "bien disponible", count === 1 ? "available property" : "available properties", count === 1 ? "inmueble disponible" : "inmuebles disponibles")}</span>
                        </span>
                        <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" className="flex-none text-[#a4573e]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ── Listings ─────────────────────────────────────────── */}
          <section className="mx-auto max-w-[1320px] px-5 py-10 md:px-10 lg:py-14 xl:px-16">
            <h2 className="mb-6 text-[28px] leading-tight md:text-[34px]">{landing.label[lang]}{!isLoading && listed.length > 0 && ` (${available.length})`}</h2>
            {isLoading ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="aspect-[4/3] animate-pulse bg-[#e9e1d5]" />)}</div>
            ) : listed.length > 0 ? (
              <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {listed.map((property) => <PropertyCard key={property.id} property={property} activeType={landing.service} />)}
              </div>
            ) : (
              <div className="border-y border-[#2b2722]/12 py-14 text-center">
                <p className="font-serif text-3xl">{tL("Aucun bien disponible pour le moment — décrivez votre recherche", "No property available right now — describe your search", "Ningún inmueble disponible por ahora — describa su búsqueda")}</p>
                <p className="mx-auto mt-3 max-w-[560px] text-sm text-[#655f56]">{tL("Certains biens ne sont pas publiés. Décrivez votre recherche : nous vous envoyons une sélection.", "Some properties are not published. Describe your search and we will send you a selection.", "Algunos inmuebles no están publicados. Describa su búsqueda y le enviaremos una selección.")}</p>
              </div>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to={lp("/demande")} className="flex min-h-14 items-center gap-3 bg-[#211f1b] px-6 text-xs font-medium uppercase tracking-[0.16em] text-[#fbf8f2] transition-colors hover:bg-[#a4573e]">
                {tL("Décrire ma recherche", "Tell us what you need", "Cuéntenos qué busca")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 border border-[#5f6746]/50 px-6 text-xs font-medium uppercase tracking-[0.16em] text-[#5f6746] transition-colors hover:bg-[#5f6746] hover:text-white">
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp
              </a>
            </div>
          </section>

          {/* ── Guide ────────────────────────────────────────────── */}
          <section className="border-t border-[#2b2722]/12 bg-white">
            <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-[2fr_1fr] lg:py-20 xl:px-16">
              <article className="max-w-[760px]">
                {copy.sections.map((section) => (
                  <section key={section.heading} className="mb-12 last:mb-0">
                    <h2 className="mb-5 text-[30px] leading-tight md:text-[36px]">{section.heading}</h2>
                    {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 40)} className="mb-4 text-[15px] leading-[1.8] text-[#4f4a43] md:text-base">{paragraph}</p>)}
                  </section>
                ))}
              </article>

              <aside className="flex flex-col gap-10">
                {listedAreas.length > 0 && <div>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777065]">{tL("Par quartier", "By area", "Por barrio")}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {listedAreas.map((area) => (
                      <li key={area}><Link to={catalogueLink(area)} className="flex min-h-11 items-center border border-[#2b2722]/15 px-4 font-serif text-[18px] transition-colors hover:border-[#a4573e] hover:text-[#a4573e]">{area}</Link></li>
                    ))}
                  </ul>
                </div>}
                <div>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777065]">{tL("Voir aussi", "See also", "Ver también")}</h2>
                  <ul className="flex flex-col border-t border-[#2b2722]/12">
                    {[...(landing.type ? [hub] : []), ...siblings.filter((sibling) => sibling.id !== landing.id), otherHub].map((other) => (
                      <li key={other.id} className="border-b border-[#2b2722]/12">
                        <Link to={landingPath(other.id, lang)} className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm hover:text-[#a4573e]">
                          {other.label[lang]} <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                    <li className="border-b border-[#2b2722]/12">
                      <Link to={lp("/blog")} className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm hover:text-[#a4573e]">
                        {tL("Nos guides sur le blog", "Our guides on the blog", "Nuestras guías en el blog")} <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────── */}
          <section className="border-t border-[#2b2722]/12">
            <div className="mx-auto max-w-[900px] px-5 py-14 md:px-10 lg:py-20">
              <h2 className="mb-8 text-[32px] leading-tight md:text-[40px]">{tL("Questions fréquentes", "Frequently asked questions", "Preguntas frecuentes")}</h2>
              <div className="border-t border-[#2b2722]/15">
                {copy.faq.map(({ q, a }) => (
                  <details key={q} className="group border-b border-[#2b2722]/15">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-[20px] leading-snug [&::-webkit-details-marker]:hidden">
                      {q}
                      <ChevronDown size={18} aria-hidden="true" className="flex-none text-[#a4573e] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 text-[15px] leading-[1.75] text-[#4f4a43]">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
