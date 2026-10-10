import { useState } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitModal from "@/components/VisitModal";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/hooks/useBiens";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { BASE_URL } from "@/hooks/useSEO";
import { PageTransition } from "@/components/motion/Animations";
import { isSoldOnly, isUnavailable } from "@/lib/propertyServices";
import { propertyIdFromParam, propertyPath } from "@/lib/propertyUrl";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { getImageUrl } from "@/lib/cloudinary";
import { furnishedOf, zoneLabel } from "@/content/zones";
import { AGENCY } from "@/content/agency";
import { equipmentName, propertyMetaDescription, propertySeoTitle, propertyText, serviceName, typeName } from "@/lib/propertyI18n";
import { LANGS, localizePath, type Lang } from "@/i18n/routing";
import type { BienService } from "@/types/property";
import { formatPrice } from "@/lib/propertyDetail";
import PhotoGallery from "@/components/property/PhotoGallery";
import SimilarProperties from "@/components/property/SimilarProperties";
import { AmenitiesGrid, DescriptionSections, LocationBlock, Reassurance, RentalTerms, SpecsGrid } from "@/components/property/PropertySections";

const WHATSAPP_BUTTON = "bg-[#128C7E] text-white hover:bg-[#0f7a6e]";

const PropertyDetail = () => {
  const { t } = useTranslation();
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  const { pathname } = useLocation();
  const { id: param } = useParams();
  const { data: property, isLoading: loading } = useProperty(propertyIdFromParam(param));
  const [visitOpen, setVisitOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 md:pt-28 pb-24">
          <div className="animate-pulse">
            <div className="aspect-[4/3] bg-muted md:container md:mx-auto md:h-[460px] md:aspect-auto" />
            <div className="container mx-auto px-4 pt-5 md:px-12 space-y-4">
              <div className="h-7 w-3/4 bg-muted rounded" />
              <div className="h-5 w-1/2 bg-muted rounded" />
              <div className="h-20 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <SEOHead title={tL("Bien introuvable", "Property not found", "Propiedad no encontrada")} description="" noindex />
        <Header />
        <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 text-center">
          <h2 className="mb-6">{t('biens.aucun_bien')}</h2>
          <Link to={lp("/catalogue")}>
            <Button variant="luxury-ghost">{tL("Retour au catalogue", "Back to the catalogue", "Volver al catálogo")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.photos?.length > 0 ? property.photos : ["/placeholder.svg"];
  const shareImages = images.map((image) => {
    const url = getImageUrl(image, "full");
    return url.startsWith("/") ? `${BASE_URL}${url}` : url;
  });
  const unavailable = isUnavailable(property);
  const unavailableLabel = isSoldOnly(property) ? tL("Déjà vendu", "Already sold", "Ya vendido") : tL("Déjà loué", "Already rented", "Ya alquilado");
  // Texts in the page language; without a translation /en and /es show French and stay out of search results.
  const text = propertyText(property, lang);
  const translatedLangs = LANGS.filter((l) => propertyText(property, l).translated);
  const whatsappUrl = `https://wa.me/212605387041?text=${encodeURIComponent(tL(
    `Bonjour, je suis intéressé(e) par le bien : ${property.titre} (Réf. ${property.reference})`,
    `Hello, I am interested in this property: ${text.titre} (Ref. ${property.reference})`,
    `Hola, me interesa este inmueble: ${text.titre} (Ref. ${property.reference})`,
  ))}`;

  // Prix de l'offre (priorité à la vente, puis location)
  const offerPrice = property.prix_vente || property.prix_location_longue || property.prix_location_courte || property.prix || 0;
  // One address per property: old /bien/<id> links move to the readable one.
  const canonicalPath = lp(propertyPath(property));
  if (pathname !== canonicalPath) return <Navigate to={canonicalPath} replace />;
  const propertyUrl = `${BASE_URL}${canonicalPath}`;

  // Construction du JSON-LD RealEstateListing pour les LLMs (GEO) et Google
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": text.titre,
    "description": text.description_courte || text.description_longue || propertyMetaDescription(property, lang),
    "inLanguage": text.translated ? lang : "fr",
    "url": propertyUrl,
    "datePosted": property.created_at,
    // Photos are stored as Cloudinary ids: structured data needs absolute URLs.
    "image": shareImages,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": zoneLabel(property, lang),
      "addressRegion": "Marrakech-Safi",
      "addressCountry": "MA"
    },
    ...(property.latitude && property.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      }
    }),
    ...(property.chambres != null && { "numberOfRooms": property.chambres }),
    ...(property.salles_de_bain != null && { "numberOfBathroomsTotal": property.salles_de_bain }),
    ...((property.surface_habitable || property.surface_terrain) && {
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.surface_habitable || property.surface_terrain,
        "unitCode": "MTK"
      }
    }),
    "amenityFeature": property.equipements?.map(eq => ({
      "@type": "LocationFeatureSpecification",
      "name": equipmentName(eq, lang),
      "value": true
    })) || [],
    "offers": {
      "@type": "Offer",
      "priceCurrency": property.devise || "MAD",
      "price": offerPrice,
      "availability": unavailable ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "url": propertyUrl,
      "seller": {
        "@type": "RealEstateAgent",
        "name": "Live In Marrakech",
        "url": "https://liveinmarrakech.com"
      }
    }
  };

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    { name: tL("Nos biens", "Properties", "Propiedades"), path: lp("/catalogue") },
    { name: text.titre, path: lp(propertyPath(property)) },
  ];
  const breadcrumb = breadcrumbJsonLd(crumbs);

  const alternates = Object.fromEntries(translatedLangs.map((l: Lang) => [l, localizePath(propertyPath(property), l)]));

  // One price line per service offered (the service itself is shown once, on the photo).
  const prices = ([
    ["vente", property.prix_vente, null, tL("Prix de vente", "Sale price", "Precio de venta")],
    ["location-longue-duree", property.prix_location_longue, tL("/ mois", "/ month", "/ mes"), tL("Loyer mensuel", "Monthly rent", "Alquiler mensual")],
    ["location-courte-duree", property.prix_location_courte, tL("/ nuit", "/ night", "/ noche"), tL("Prix par nuit", "Price per night", "Precio por noche")],
  ] as [BienService, number | null, string | null, string][])
    .filter(([service, amount]) => property.services.includes(service) && amount)
    .map(([service, amount, suffix, label]) => ({ service, amount: amount as number, suffix, label }));
  if (!prices.length && property.prix) prices.push({ service: property.services[0], amount: property.prix, suffix: null, label: tL("Prix", "Price", "Precio") });
  const mainPrice = prices[0];
  const longTerm = property.services.includes("location-longue-duree");
  const furnished = longTerm ? furnishedOf(property) : null;
  const deposit = furnished === null || !property.prix_location_longue ? null : property.prix_location_longue * (furnished ? 2 : 1);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: text.titre, url: propertyUrl });
      else {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success(tL("Lien copié", "Link copied", "Enlace copiado"));
      }
    } catch { /* share sheet closed */ }
  };

  const badges = (
    <>
      {unavailable && <span className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-background">{unavailableLabel}</span>}
      {property.services.map((service, i) => (
        <span key={service} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-sm ${i === 0 ? "bg-primary text-primary-foreground" : "bg-background/95 text-primary backdrop-blur-md"}`}>
          {serviceName(service, lang)}
        </span>
      ))}
    </>
  );

  const iconButton = "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary hover:bg-primary-soft";
  const reference = property.reference?.trim();

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <SEOHead
        title={propertySeoTitle(property, lang)}
        withBrand={false}
        description={propertyMetaDescription(property, lang)}
        image={shareImages[0]}
        schema={[jsonLd, breadcrumb]}
        canonicalPath={canonicalPath}
        alternates={alternates}
        noindex={!text.translated}
      />

      <Header />

      <main className="pt-16 md:pt-24">
        {/* ── Reference, call and share ── */}
        <div className="bg-muted/60 md:bg-transparent">
          <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2 md:px-12 md:py-4">
            <Breadcrumbs crumbs={crumbs} className="hidden md:flex" />
            {reference && <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">{tL("Réf.", "Ref.", "Ref.")} {reference}</span>}
            <div className="flex items-center gap-2">
              {reference && <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:inline">{tL("Réf.", "Ref.", "Ref.")} {reference}</span>}
              <a href={`tel:${AGENCY.phone}`} className={iconButton} aria-label={tL("Appeler l’agence", "Call the agency", "Llamar a la agencia")}>
                <Phone size={17} strokeWidth={1.75} />
              </a>
              <button type="button" onClick={share} className={iconButton} aria-label={tL("Partager ce bien", "Share this property", "Compartir este inmueble")}>
                <Share2 size={17} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        <PhotoGallery images={images} alt={`${typeName(property.type, lang)} — ${text.titre}`} badges={badges} />

        <div className="container mx-auto px-4 py-6 md:px-12 md:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-14">
            <div className="flex flex-col gap-7 md:gap-10 lg:col-span-2">

              {/* ── Title, area, price ── */}
              <div className="flex flex-col gap-3">
                <Breadcrumbs crumbs={crumbs} className="md:hidden [&_[aria-current=page]]:line-clamp-1" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{typeName(property.type, lang)}</p>
                <h1 className="font-serif text-[30px] leading-[1.15] text-foreground md:text-5xl">{text.titre}</h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={16} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
                  {zoneLabel(property, lang)}, Marrakech
                </p>

                {mainPrice && (
                  <div className="mt-1 flex flex-col gap-2 rounded-xl bg-muted/60 p-4 md:p-5">
                    {prices.map((price) => (
                      <div key={price.service} className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">{formatPrice(price.amount, property.devise)}</span>
                        {price.suffix && <span className="text-sm text-muted-foreground">{price.suffix}</span>}
                        {prices.length > 1 && <span className="ml-auto text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{serviceName(price.service, lang)}</span>}
                      </div>
                    ))}
                    {furnished !== null && (
                      <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                          {furnished ? tL("Meublé", "Furnished", "Amueblado") : tL("Vide", "Unfurnished", "Sin amueblar")}
                        </span>
                        {furnished ? tL("Caution : 2 mois de loyer", "Deposit: 2 months’ rent", "Fianza: 2 meses de alquiler") : tL("Caution : 1 mois de loyer", "Deposit: 1 month’s rent", "Fianza: 1 mes de alquiler")}
                        {deposit && ` (${formatPrice(deposit, property.devise)})`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <SpecsGrid property={property} />
              {!unavailable && <Reassurance rental={longTerm} />}

              {(text.description_longue || text.description_courte) && (
                <DescriptionSections text={text.description_longue || text.description_courte} hideTerms={longTerm} />
              )}

              <AmenitiesGrid equipements={property.equipements ?? []} lang={lang} />
              <LocationBlock property={property} lang={lang} />
              {longTerm && !unavailable && <RentalTerms property={property} />}
            </div>

            {/* ── Desktop: book or visit ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-xl border border-border bg-card p-7 shadow-[0_16px_36px_-8px_rgba(33,31,27,0.08),0_4px_12px_-2px_rgba(33,31,27,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{unavailable ? unavailableLabel : tL("Réserver ou visiter", "Book or visit", "Reservar o visitar")}</p>
                {mainPrice && !unavailable && (
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-primary">{formatPrice(mainPrice.amount, property.devise)}</span>
                    {mainPrice.suffix && <span className="text-sm text-muted-foreground">{mainPrice.suffix}</span>}
                  </p>
                )}
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {unavailable
                    ? tL("Ce bien n'est plus disponible. Contactez-nous : nous vous proposerons des biens similaires.", "This property is no longer available. Contact us and we will suggest similar properties.", "Este inmueble ya no está disponible. Contáctenos y le propondremos inmuebles similares.")
                    : tL("Ce bien vous intéresse ? Nous organisons la visite, sur place ou en vidéo sur WhatsApp.", "Interested in this property? We arrange the viewing, in person or by video on WhatsApp.", "¿Le interesa este inmueble? Organizamos la visita, en persona o por vídeo en WhatsApp.")}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`flex h-12 items-center justify-center gap-2.5 rounded-lg text-sm font-semibold ${WHATSAPP_BUTTON}`}>
                    <MessageCircle size={18} strokeWidth={1.75} />
                    {tL("Écrire sur WhatsApp", "Message on WhatsApp", "Escribir por WhatsApp")}
                  </a>
                  {!unavailable && (
                    <button type="button" onClick={() => setVisitOpen(true)} className="flex h-12 items-center justify-center gap-2.5 rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-primary-soft">
                      <CalendarDays size={18} strokeWidth={1.75} />
                      {tL("Demander une visite", "Request a visit", "Solicitar una visita")}
                    </button>
                  )}
                  <a href={`tel:${AGENCY.phone}`} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
                    <Phone size={15} strokeWidth={1.75} />
                    {AGENCY.phoneDisplay}
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-10 md:mt-14">
            <SimilarProperties property={property} lang={lang} />
          </div>
        </div>
      </main>

      {/* ── Mobile: price + WhatsApp + visit, fixed at the bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {mainPrice && !unavailable && (
            <div className="hidden shrink-0 flex-col min-[360px]:flex">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{mainPrice.label}</span>
              <span className={`font-semibold leading-tight text-primary ${mainPrice.amount >= 1_000_000 ? "text-base" : "text-lg"}`}>{formatPrice(mainPrice.amount, property.devise)}</span>
            </div>
          )}
          <div className="flex flex-1 items-center justify-end gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold ${WHATSAPP_BUTTON}`}>
              <MessageCircle size={17} strokeWidth={1.75} />
              WhatsApp
            </a>
            {!unavailable && (
              <button type="button" onClick={() => setVisitOpen(true)} className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground">
                <CalendarDays size={16} strokeWidth={1.75} />
                {tL("Visiter", "Visit", "Visitar")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for the bottom bar */}
      <div className="h-24 lg:hidden" />

      <Footer />
      <VisitModal
        open={visitOpen}
        onOpenChange={setVisitOpen}
        propertyId={property.id}
        propertyTitle={text.titre}
      />
    </div>
    </PageTransition>
  );
};

export default PropertyDetail;
