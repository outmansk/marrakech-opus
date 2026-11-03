import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SEOHead from "@/components/SEOHead";
import { PageTransition } from "@/components/motion/Animations";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { BASE_URL } from "@/hooks/useSEO";
import { AREA_COPY, AREA_PAGES, areaAvailable, areaListings, areaPath, type AreaPage } from "@/content/areaPages";
import { LANDINGS, availableFor, landingPath } from "@/content/landings";
import { ZONES, zoneIn } from "@/content/zones";
import { rentalSections, whatsappFromPage } from "@/content/rentalCopy";
import { getServices, isUnavailable } from "@/lib/propertyServices";
import { propertyPath } from "@/lib/propertyUrl";
import { propertyText, typeName } from "@/lib/propertyI18n";
import { LANGS, type Lang } from "@/i18n/routing";
import type { Bien } from "@/types/property";

// Area page (/quartiers/route-de-sidi-rahal, /en/areas/…): every listing of one zone, for rent and
// for sale, with the figures computed from those listings. Rendered from ServiceLanding's routes.

const PUBLIC_STATUTS = ["publie", "vendu-loue"];

const absolute = (path: string) => `${BASE_URL}${path === "/" ? "" : path}`;

export default function AreaLanding({ page }: { page: AreaPage }) {
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();
  const { data: properties = [], isLoading } = useQuery(propertiesQueryOptions({ statut: PUBLIC_STATUTS }));

  const copy = AREA_COPY[page.zone][lang];
  const listed = areaListings(page, properties);
  const available = listed.filter((property) => !isUnavailable(property));
  const empty = !isLoading && available.length === 0;
  const where = zoneIn(page.zone, lang);
  const alternates = Object.fromEntries(LANGS.map((l) => [l, areaPath(page, l)])) as Record<Lang, string>;
  const selfPath = areaPath(page, lang);

  // Figures from our own listings (no market data).
  const format = (value: number, devise: string) => `${new Intl.NumberFormat(lang).format(value)} ${devise}`;
  const range = (items: Bien[], price: (property: Bien) => number | null | undefined) => {
    const values = items.map((property) => ({ value: price(property), devise: property.devise || "MAD" })).filter((p): p is typeof p & { value: number } => !!p.value);
    if (!values.length) return null;
    const devise = values[0].devise;
    const same = values.filter((p) => p.devise === devise).map((p) => p.value);
    const [low, high] = [Math.min(...same), Math.max(...same)].map((value) => format(value, devise));
    return { count: values.length, low, high, single: low === high, text: low === high ? low : `${low} – ${high}` };
  };
  const rentals = available.filter((property) => getServices(property).includes("location-longue-duree"));
  const sales = available.filter((property) => getServices(property).includes("vente"));
  const rents = range(rentals, (property) => property.prix_location_longue);
  const prices = range(sales, (property) => property.prix_vente);
  const types = [...new Set(available.map((property) => property.type))];
  const typesText = types.map((type) => typeName(type, lang).toLowerCase()).join(", ");
  const perMonth = tL(" / mois", " / month", " / mes");
  const lastUpdate = listed.length
    ? new Date(Math.max(...listed.map((property) => Date.parse(property.updated_at)))).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;

  const summary = empty
    ? tL(
      "Aucun bien n’est disponible dans ce secteur pour le moment : décrivez votre recherche, nous vous envoyons une sélection.",
      "No property is available in this area right now: describe your search and we will send you a selection.",
      "No hay ningún inmueble disponible en esta zona ahora mismo: describa su búsqueda y le enviaremos una selección.",
    )
    : available.length > 0 ? [
      tL(
        `Live In Marrakech propose actuellement ${available.length} ${available.length > 1 ? "biens" : "bien"} ${where} (${typesText}).`,
        `Live In Marrakech currently offers ${available.length} ${available.length > 1 ? "properties" : "property"} ${where} (${typesText}).`,
        `Live In Marrakech ofrece actualmente ${available.length} ${available.length > 1 ? "inmuebles" : "inmueble"} ${where} (${typesText}).`,
      ),
      rents && tL(`À louer à l’année : ${rents.text} par mois.`, `For long-term rent: ${rents.text} a month.`, `En alquiler de larga duración: ${rents.text} al mes.`),
      prices && tL(`À vendre : ${prices.text}.`, `For sale: ${prices.text}.`, `En venta: ${prices.text}.`),
    ].filter(Boolean).join(" ") : "";

  const facts = [
    { label: tL("Biens disponibles", "Available properties", "Inmuebles disponibles"), value: isLoading ? "…" : String(available.length) },
    ...(rents ? [{ label: tL("Loyers", "Rents", "Alquileres"), value: rents.text + perMonth }] : []),
    ...(prices ? [{ label: tL("Prix de vente", "Sale prices", "Precios de venta"), value: prices.text }] : []),
  ];

  // Confirmed rental rules (1-year lease, deposit 2 months furnished / 1 unfurnished, fee 1 month).
  const faq = [
    ...(rents ? [{
      q: tL(`Combien coûte une location ${where} ?`, `How much is a long-term rental ${where}?`, `¿Cuánto cuesta un alquiler ${where}?`),
      a: tL(
        `Dans notre catalogue, ${rents.single ? `le loyer ${where} est actuellement de ${rents.low}` : `les loyers ${where} vont actuellement de ${rents.low} à ${rents.high}`} par mois (${rents.count} ${rents.count > 1 ? "biens" : "bien"} à louer à l’année). Le bail est d’un an minimum, la caution est de deux mois de loyer pour un logement meublé et d’un mois pour un logement vide, et les frais d’agence sont d’un mois de loyer.`,
        `In our catalogue, ${rents.single ? `the rent ${where} is currently ${rents.low}` : `rents ${where} currently range from ${rents.low} to ${rents.high}`} a month (${rents.count} ${rents.count > 1 ? "properties" : "property"} for long-term rent). The lease is one year minimum, the deposit is two months’ rent furnished and one month unfurnished, and the agency fee is one month’s rent.`,
        `En nuestro catálogo, ${rents.single ? `el alquiler ${where} es actualmente de ${rents.low}` : `los alquileres ${where} van actualmente de ${rents.low} a ${rents.high}`} al mes (${rents.count} ${rents.count > 1 ? "inmuebles" : "inmueble"} en alquiler de larga duración). El contrato es de un año mínimo, la fianza es de dos meses amueblado y de un mes sin amueblar, y los honorarios de agencia son de un mes de alquiler.`,
      ),
    }] : []),
    ...(prices ? [{
      q: tL(`Y a-t-il des biens à vendre ${where} ?`, `Are there properties for sale ${where}?`, `¿Hay inmuebles en venta ${where}?`),
      a: tL(
        `Oui : ${prices.count} ${prices.count > 1 ? "biens sont" : "bien est"} à vendre ${where} dans notre catalogue, ${prices.single ? `à ${prices.low}` : `de ${prices.low} à ${prices.high}`}. Avant de signer, votre notaire vérifie le titre foncier et vous donne le détail écrit des frais.`,
        `Yes: ${prices.count} ${prices.count > 1 ? "properties are" : "property is"} for sale ${where} in our catalogue, ${prices.single ? `at ${prices.low}` : `from ${prices.low} to ${prices.high}`}. Before you sign, your notary checks the land title and gives you a written breakdown of the costs.`,
        `Sí: ${prices.count} ${prices.count > 1 ? "inmuebles están" : "inmueble está"} en venta ${where} en nuestro catálogo, ${prices.single ? `a ${prices.low}` : `de ${prices.low} a ${prices.high}`}. Antes de firmar, su notario comprueba el título de propiedad y le da el detalle de los gastos por escrito.`,
      ),
    }] : []),
    {
      q: tL(`Comment visiter un bien ${where} ?`, `How can I view a property ${where}?`, `¿Cómo visitar un inmueble ${where}?`),
      a: tL(
        "Écrivez-nous sur WhatsApp ou décrivez votre recherche : nous organisons la visite sur place, ou en vidéo si vous êtes encore à l’étranger.",
        "Message us on WhatsApp or describe your search: we arrange the viewing on site, or by video if you are still abroad.",
        "Escríbanos por WhatsApp o describa su búsqueda: organizamos la visita presencial, o por vídeo si todavía está en el extranjero.",
      ),
    },
  ];

  // Service pages that list something here, and other areas with available listings.
  const serviceLinks = LANDINGS.filter((landing) => landing.type && availableFor(landing, available).length > 0);
  const otherAreas = AREA_PAGES.filter((other) => other.zone !== page.zone && areaAvailable(other, properties).length > 0);
  const guide = rentalSections(lang).zonesGuide;
  const whatsappUrl = whatsappFromPage(lang, copy.h1);

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    { name: tL("Catalogue", "Catalogue", "Catálogo"), path: lp("/catalogue") },
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
      "mainEntity": faq.map(({ q, a }) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    },
    ...(available.length ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": copy.h1,
      "numberOfItems": available.length,
      "itemListElement": available.map((property, index) => ({ "@type": "ListItem", "position": index + 1, "url": absolute(lp(propertyPath(property))), "name": propertyText(property, lang).titre })),
    }] : []),
  ];

  const ctaRow = (className = "") => (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Link to={lp("/demande")} className="flex min-h-14 items-center gap-3 bg-[#211f1b] px-6 text-xs font-medium uppercase tracking-[0.16em] text-[#fbf8f2] transition-colors hover:bg-[#a4573e]">
        {tL("Décrire ma recherche", "Tell us what you need", "Cuéntenos qué busca")} <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 border border-[#5f6746]/50 px-6 text-xs font-medium uppercase tracking-[0.16em] text-[#5f6746] transition-colors hover:bg-[#5f6746] hover:text-white">
        <MessageCircle size={16} aria-hidden="true" /> WhatsApp
      </a>
    </div>
  );

  const linkList = (items: { key: string; label: string; path: string }[]) => (
    <ul className="flex flex-col border-t border-[#2b2722]/12">
      {items.map((item) => (
        <li key={item.key} className="border-b border-[#2b2722]/12">
          <Link to={item.path} className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm hover:text-[#a4573e]">
            {item.label} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fbf8f2] text-[#211f1b]">
        <SEOHead title={copy.title} withBrand={false} description={copy.description} alternates={alternates} schema={schema} noindex={empty} />
        <Header />

        <main className="pt-16">
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
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#a4573e]">{tL("Quartier", "Area", "Zona")} · {ZONES[page.zone].label[lang]}</p>
              <h1 className="max-w-[900px] text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[56px]">{copy.h1}</h1>
              <p className="mt-6 max-w-[760px] text-[15px] leading-[1.75] text-[#4f4a43] md:text-base">{summary}</p>
              {ctaRow("mt-6")}

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

          <section className="mx-auto max-w-[1320px] px-5 py-10 md:px-10 lg:py-14 xl:px-16">
            <h2 className="mb-6 text-[28px] leading-tight md:text-[34px]">
              {tL("Nos biens", "Our properties", "Nuestros inmuebles")} {where}{!isLoading && listed.length > 0 && ` (${available.length})`}
            </h2>
            {isLoading ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="aspect-[4/3] animate-pulse bg-[#e9e1d5]" />)}</div>
            ) : listed.length > 0 ? (
              <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {listed.map((property) => <PropertyCard key={property.id} property={property} />)}
              </div>
            ) : (
              <div className="border-y border-[#2b2722]/12 py-14 text-center">
                <p className="font-serif text-3xl">{tL("Aucun bien disponible pour le moment — décrivez votre recherche", "No property available right now — describe your search", "Ningún inmueble disponible por ahora — describa su búsqueda")}</p>
              </div>
            )}
          </section>

          <section className="border-t border-[#2b2722]/12 bg-white">
            <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-[2fr_1fr] lg:py-20 xl:px-16">
              <article className="max-w-[760px]">
                <h2 className="mb-5 text-[30px] leading-tight md:text-[36px]">{tL("Vivre", "Living", "Vivir")} {where}</h2>
                {copy.about.map((paragraph) => <p key={paragraph.slice(0, 40)} className="mb-4 text-[15px] leading-[1.8] text-[#4f4a43] md:text-base">{paragraph}</p>)}
                <p className="text-[15px] leading-[1.8] text-[#4f4a43] md:text-base">
                  {tL("Pour comparer avec les autres quartiers, lisez", "To compare with other areas, read", "Para compararla con otros barrios, lea")}{" "}
                  <Link to={guide.path} className="underline decoration-[#a4573e]/50 underline-offset-4 hover:text-[#a4573e]">{guide.label}</Link>.
                </p>
              </article>

              <aside className="flex flex-col gap-10">
                {serviceLinks.length > 0 && <div>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777065]">{tL("Dans tout Marrakech", "Across Marrakech", "En todo Marrakech")}</h2>
                  {linkList(serviceLinks.map((landing) => ({ key: landing.id, label: landing.label[lang], path: landingPath(landing.id, lang) })))}
                </div>}
                {otherAreas.length > 0 && <div>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777065]">{tL("Autres quartiers", "Other areas", "Otras zonas")}</h2>
                  {linkList(otherAreas.map((other) => ({ key: other.zone, label: ZONES[other.zone].label[lang], path: areaPath(other, lang) })))}
                </div>}
              </aside>
            </div>
          </section>

          <section className="border-t border-[#2b2722]/12">
            <div className="mx-auto max-w-[900px] px-5 py-14 md:px-10 lg:py-20">
              <h2 className="mb-8 text-[32px] leading-tight md:text-[40px]">{tL("Questions fréquentes", "Frequently asked questions", "Preguntas frecuentes")}</h2>
              <div className="border-t border-[#2b2722]/15">
                {faq.map(({ q, a }) => (
                  <div key={q} className="border-b border-[#2b2722]/15 py-5">
                    <h3 className="mb-2 font-serif text-[21px] leading-snug">{q}</h3>
                    <p className="text-[15px] leading-[1.75] text-[#4f4a43]">{a}</p>
                  </div>
                ))}
              </div>
              {ctaRow("mt-10")}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
