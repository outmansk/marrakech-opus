import { useEffect, useState, useRef } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Bed, Car, MapPin, Clock, MessageCircle, CalendarDays, Bath, Maximize, ChevronLeft, ChevronRight, Share2, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitModal from "@/components/VisitModal";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/hooks/useBiens";
import type { Bien } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { BASE_URL } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { PageTransition, Reveal, EASE_LUXURY } from "@/components/motion/Animations";
import { ServiceTag, TypeBadge } from "@/components/PropertyTags";
import { isSoldOnly, isUnavailable } from "@/lib/propertyServices";
import { propertyIdFromParam, propertyPath } from "@/lib/propertyUrl";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { getImageUrl } from "@/lib/cloudinary";
import { zoneLabel } from "@/content/zones";
import FurnishedBadge from "@/components/FurnishedBadge";
import { landingFor, landingPath, type Landing } from "@/content/landings";
import { distanceLabel, equipmentName, placeName, propertyMetaDescription, propertySeoTitle, propertyText, serviceName, typeName } from "@/lib/propertyI18n";
import { LANGS, localizePath, type Lang } from "@/i18n/routing";

const formatPrice = (price: number, devise: string = 'MAD') => {
  return new Intl.NumberFormat("fr-MA").format(price) + " " + devise;
};

const PropertyDetail = () => {
  const { t } = useTranslation();
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  const { pathname } = useLocation();
  const { id: param } = useParams();
  const { data: property, isLoading: loading } = useProperty(propertyIdFromParam(param));
  const [selectedImage, setSelectedImage] = useState(0);
  const [visitOpen, setVisitOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Scroll thumbnail into view when selecting an image
  useEffect(() => {
    if (thumbsRef.current) {
      const activeThumb = thumbsRef.current.children[selectedImage] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 md:pt-32 pb-24">
          {/* Mobile skeleton */}
          <div className="md:hidden">
            <div className="animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="px-5 pt-5 space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-5 w-1/2 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
          {/* Desktop skeleton */}
          <div className="hidden md:block container mx-auto px-12">
            <div className="animate-pulse space-y-8">
              <div className="h-[60vh] bg-muted" />
              <div className="h-8 w-64 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
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
  const relatedLandings = property.services.map((service) => landingFor(service, property.type)).filter(Boolean) as Landing[];
  const unavailableLabel = isSoldOnly(property) ? tL("Déjà vendu", "Already sold", "Ya vendido") : tL("Déjà loué", "Already rented", "Ya alquilado");
  // Texts in the page language; without a translation /en and /es show French and stay out of search results.
  const text = propertyText(property, lang);
  const translatedLangs = LANGS.filter((l) => propertyText(property, l).translated);
  // Living area and plot, each with its own label (the plot alone used to be shown as "surface").
  const areas = [
    property.surface_habitable ? { value: property.surface_habitable, label: tL("Habitables", "Living area", "Habitables") } : null,
    property.surface_terrain && property.surface_terrain !== property.surface_habitable ? { value: property.surface_terrain, label: tL("Terrain", "Plot", "Parcela") } : null,
  ].filter(Boolean) as { value: number; label: string }[];
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

  const goToPrev = () => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
  const goToNext = () => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);

  return (
    <PageTransition>
    <div className="min-h-screen">
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

      <div className="pt-20 md:pt-24">
        {/* ── Back link (desktop only — mobile uses floating back button) ── */}
        <div className="hidden md:block container mx-auto px-6 md:px-12 mb-4">
          <Link to={lp("/catalogue")} className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
            <ArrowLeft size={16} strokeWidth={1.25} />
            {t("nav.catalogue")}
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            GALLERY — Mobile: edge-to-edge immersive / Desktop: contained
           ══════════════════════════════════════════════════════════════════ */}
        <Reveal>
        {/* Mobile Gallery — edge-to-edge */}
        <div className="md:hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <OptimizedImage
              src={images[selectedImage]}
              alt={`${typeName(property.type, lang)} — ${text.titre}`}
              eager
              size="hero"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
              wrapperClassName="w-full h-full"
            />

            {/* Floating back button */}
            <Link
              to={lp("/catalogue")}
              className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>

            {/* Share button */}
            <button
              onClick={() => navigator.share?.({ title: text.titre, url: propertyUrl }).catch(() => {})}
              aria-label={tL("Partager ce bien", "Share this property", "Compartir este inmueble")}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Share2 size={16} strokeWidth={1.5} />
            </button>

            {/* Navigation arrows — always visible on mobile */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); goToPrev(); }}
                  aria-label={tL("Photo précédente", "Previous photo", "Foto anterior")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/25 backdrop-blur-sm active:bg-black/50 text-white w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); goToNext(); }}
                  aria-label={tL("Photo suivante", "Next photo", "Foto siguiente")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/25 backdrop-blur-sm active:bg-black/50 text-white w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* Photo counter pill */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-sans font-medium tracking-wide">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && images.length <= 8 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      selectedImage === idx
                        ? "w-5 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50"
                    }`}
                    aria-label={tL(`Afficher la photo ${idx + 1}`, `Show photo ${idx + 1}`, `Ver la foto ${idx + 1}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails strip — mobile */}
          {images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={tL(`Afficher la photo ${i + 1}`, `Show photo ${i + 1}`, `Ver la foto ${i + 1}`)}
                  aria-pressed={selectedImage === i}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImage === i
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-background opacity-100 scale-105"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <OptimizedImage
                    src={url}
                    alt=""
                    size="thumb"
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Gallery — editorial mosaic */}
        <div className="hidden md:block container mx-auto px-6 md:px-12">
          <div className="grid h-[410px] grid-cols-[2fr_1fr] gap-2 overflow-hidden bg-muted">
          <div className="relative overflow-hidden bg-muted group">
            <OptimizedImage
              src={images[selectedImage]}
              alt={`${typeName(property.type, lang)} — ${text.titre}`}
              eager
              size="hero"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
              wrapperClassName="w-full h-full"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); goToPrev(); }}
                  aria-label={tL("Photo précédente", "Previous photo", "Foto anterior")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); goToNext(); }}
                  aria-label={tL("Photo suivante", "Next photo", "Foto siguiente")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 right-4 bg-black/45 px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] text-white backdrop-blur-sm">{selectedImage + 1} / {images.length}</div>
              </>
            )}
          </div>
          <div className="grid grid-rows-2 gap-2 overflow-hidden">
            {[images[1] || images[0], images[2] || images[0]].map((url, offset) => {
              const index = Math.min(offset + 1, images.length - 1);
              return (
                <button
                  key={`${url}-${offset}`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={tL(`Afficher la photo ${index + 1}`, `Show photo ${index + 1}`, `Ver la foto ${index + 1}`)}
                  className={`relative overflow-hidden transition-opacity ${selectedImage === index ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                >
                  <OptimizedImage
                    src={url}
                    alt={`${text.titre} — ${tL("vue", "view", "vista")} ${index + 1}`}
                    size="card"
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                  />
                </button>
              );
            })}
          </div>
          </div>
        </div>
        </Reveal>

        {/* ══════════════════════════════════════════════════════════════════
            CONTENT — Mobile-first reorganized layout
           ══════════════════════════════════════════════════════════════════ */}
        <div className="container mx-auto px-5 md:px-12 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">
            <div className="lg:col-span-2 space-y-6 md:space-y-10">

              {/* ── Title & Location (Mobile: shown first) ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE_LUXURY }}
              >
                <Breadcrumbs crumbs={crumbs} className="mb-3 md:mb-4" />
                {(
                  <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                    <MapPin size={14} strokeWidth={1.5} className="text-accent" />
                    <span className="text-xs md:text-sm tracking-wide font-sans text-muted-foreground">{zoneLabel(property, lang)}</span>
                  </div>
                )}
                <h1 className="text-2xl md:text-5xl font-serif text-foreground leading-tight mb-0">
                  {text.titre}
                </h1>
              </motion.div>

              {/* ── Price Card (Mobile: prominent) ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: EASE_LUXURY }}
                className="bg-gradient-to-r from-muted/60 to-muted/30 border border-border/50 rounded-lg p-4 md:p-5"
              >
                <div className="flex flex-col gap-2">
                  {property.services.includes('vente') && property.prix_vente && (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <p className="text-2xl md:text-3xl font-serif text-foreground">{formatPrice(property.prix_vente, property.devise)}</p>
                      <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-muted-foreground font-sans bg-background/80 border border-border px-2 py-0.5 rounded">{serviceName("vente", lang)}</span>
                    </div>
                  )}
                  {property.services.includes('location-longue-duree') && property.prix_location_longue && (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <p className="text-2xl md:text-3xl font-serif text-foreground">{formatPrice(property.prix_location_longue, property.devise)}<span className="text-base text-muted-foreground font-sans"> {tL("/ mois", "per month", "al mes")}</span></p>
                      <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-muted-foreground font-sans bg-background/80 border border-border px-2 py-0.5 rounded">{serviceName("location-longue-duree", lang)}</span>
                    </div>
                  )}
                  {property.services.includes('location-courte-duree') && property.prix_location_courte && (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <p className="text-2xl md:text-3xl font-serif text-foreground">{formatPrice(property.prix_location_courte, property.devise)}<span className="text-base text-muted-foreground font-sans"> {tL("/ nuit", "per night", "por noche")}</span></p>
                      <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-muted-foreground font-sans bg-background/80 border border-border px-2 py-0.5 rounded">{serviceName("location-courte-duree", lang)}</span>
                    </div>
                  )}
                  <FurnishedBadge property={property} className="mt-1" />
                  {!property.prix_vente && !property.prix_location_longue && !property.prix_location_courte && property.prix && (
                    <p className="text-2xl md:text-3xl font-serif text-foreground">{formatPrice(property.prix, property.devise)}</p>
                  )}
                </div>
              </motion.div>

              {/* ── Tags row (Mobile: after price) ── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: EASE_LUXURY }}
                className="flex items-center gap-2 flex-wrap"
              >
                {property.services.map(s => (
                  <ServiceTag key={s} service={s} variant="detail" />
                ))}
                <TypeBadge type={property.type} />
                {unavailable && (
                  <span className="text-[10px] tracking-widest uppercase font-sans font-semibold bg-foreground text-background px-2 py-1 rounded">
                    {unavailableLabel}
                  </span>
                )}
                {property.reference && (
                  <span className="text-[10px] tracking-widest uppercase font-sans text-muted-foreground border border-border px-2 py-1 rounded">
                    {tL("Réf.", "Ref.", "Ref.")} {property.reference}
                  </span>
                )}
              </motion.div>

              {/* ── Specs — Cards on mobile, inline on desktop ── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: EASE_LUXURY }}
              >
                {/* Mobile: grid of cards */}
                <div className="grid grid-cols-2 gap-3 md:hidden">
                  {property.chambres !== null && (
                    <div className="flex flex-col items-center justify-center py-4 px-3 bg-muted/40 border border-border/40 rounded-lg">
                      <Bed size={22} strokeWidth={1} className="text-accent mb-2" />
                      <span className="text-lg font-serif text-foreground">{property.chambres}</span>
                      <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-sans mt-0.5">{t('biens.chambres_plural')}</span>
                    </div>
                  )}
                  {property.salles_de_bain !== null && (
                    <div className="flex flex-col items-center justify-center py-4 px-3 bg-muted/40 border border-border/40 rounded-lg">
                      <Bath size={22} strokeWidth={1} className="text-accent mb-2" />
                      <span className="text-lg font-serif text-foreground">{property.salles_de_bain}</span>
                      <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-sans mt-0.5">{property.salles_de_bain > 1 ? tL("Salles de bain", "Bathrooms", "Baños") : tL("Salle de bain", "Bathroom", "Baño")}</span>
                    </div>
                  )}
                  {areas.map((area) => (
                    <div key={area.label} className="flex flex-col items-center justify-center py-4 px-3 bg-muted/40 border border-border/40 rounded-lg">
                      <Maximize size={22} strokeWidth={1} className="text-accent mb-2" />
                      <span className="text-lg font-serif text-foreground">{area.value} m²</span>
                      <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-sans mt-0.5">{area.label}</span>
                    </div>
                  ))}
                  {property.equipements?.includes('Parking') && (
                    <div className="flex flex-col items-center justify-center py-4 px-3 bg-muted/40 border border-border/40 rounded-lg">
                      <Car size={22} strokeWidth={1} className="text-accent mb-2" />
                      <span className="text-lg font-serif text-foreground">✓</span>
                      <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-sans mt-0.5">{equipmentName("Parking", lang)}</span>
                    </div>
                  )}
                </div>

                {/* Desktop: inline specs bar */}
                <div className="hidden md:flex flex-wrap items-center gap-x-8 gap-y-4 py-8 border-y border-border">
                  {property.chambres !== null && (
                    <div className="flex items-center gap-3">
                      <Bed size={22} strokeWidth={1} className="text-muted-foreground" />
                      <span className="font-light tracking-wide">{property.chambres} {t('biens.chambres_plural')}</span>
                    </div>
                  )}
                  {property.salles_de_bain !== null && (
                    <div className="flex items-center gap-3">
                      <Bath size={22} strokeWidth={1} className="text-muted-foreground" />
                      <span className="font-light tracking-wide">{property.salles_de_bain} {property.salles_de_bain > 1 ? tL("salles de bain", "bathrooms", "baños") : tL("salle de bain", "bathroom", "baño")}</span>
                    </div>
                  )}
                  {areas.map((area) => (
                    <div key={area.label} className="flex items-center gap-3">
                      <Maximize size={22} strokeWidth={1} className="text-muted-foreground" />
                      <span className="font-light tracking-wide">{area.value} m² {area.label.toLowerCase()}</span>
                    </div>
                  ))}
                  {property.equipements?.includes('Parking') && (
                    <div className="flex items-center gap-3">
                      <Car size={22} strokeWidth={1} className="text-muted-foreground" />
                      <span className="font-light tracking-wide">{equipmentName("Parking", lang)}</span>
                    </div>
                  )}
                  {(
                    <div className="flex items-center gap-3">
                      <MapPin size={22} strokeWidth={1} className="text-muted-foreground" />
                      <span className="font-light tracking-wide">{zoneLabel(property, lang)}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── Description ── */}
              {text.description_longue || text.description_courte ? (
                <div className="max-w-none">
                  <h2 className="text-lg md:text-xl mb-4 md:mb-6 font-serif">{tL("À propos de ce bien", "About this property", "Sobre este inmueble")}</h2>
                  <p className="text-muted-foreground font-light leading-relaxed text-[15px] md:text-lg whitespace-pre-line font-sans">
                    {text.description_longue || text.description_courte}
                  </p>
                </div>
              ) : null}

              {/* ── Proximités ── */}
              {property.proximites && property.proximites.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-xl mb-4 md:mb-6 font-serif">{tL("Points d'intérêt et proximité", "Nearby", "Alrededores")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.proximites.map((prox, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 md:p-4 bg-muted/20 border border-border/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <MapPin size={14} strokeWidth={1.5} className="text-accent" />
                          </div>
                          <span className="font-light tracking-wide text-sm md:text-base">{placeName(prox.place, lang)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground ml-3">
                          <Clock size={12} strokeWidth={1.5} />
                          <span className="text-[11px] uppercase tracking-tight font-sans">{distanceLabel(prox.time, lang)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Équipements ── */}
              {property.equipements && property.equipements.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-xl mb-4 md:mb-6 font-serif">{tL("Équipements et prestations", "Features and amenities", "Equipamiento y servicios")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                    {property.equipements.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-3 bg-muted/30 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                        <span className="font-light text-muted-foreground text-[13px] md:text-sm tracking-wide">{equipmentName(eq, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Similar properties: the search pages for this type ── */}
              {relatedLandings.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-xl mb-4 md:mb-6 font-serif">{tL("Biens similaires", "Similar properties", "Inmuebles similares")}</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {relatedLandings.map((landing) => (
                      <Link key={landing.id} to={landingPath(landing.id, lang)} className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-accent hover:text-accent transition-colors">
                        {landing.label[lang]} <ArrowRight size={14} strokeWidth={1.5} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Desktop sidebar CTA ── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">{unavailable ? unavailableLabel : tL("Réserver ou visiter", "Book or visit", "Reservar o visitar")}</p>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">
                      {unavailable
                        ? tL("Ce bien n'est plus disponible. Contactez-nous : nous vous proposerons des biens similaires.", "This property is no longer available. Contact us and we will suggest similar properties.", "Este inmueble ya no está disponible. Contáctenos y le propondremos inmuebles similares.")
                        : tL("Ce bien vous intéresse ? Nous organisons la visite, sur place ou en vidéo sur WhatsApp.", "Interested in this property? We arrange the viewing, in person or by video on WhatsApp.", "¿Le interesa este inmueble? Organizamos la visita, en persona o por vídeo en WhatsApp.")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="luxury" size="lg" className="w-full h-14 gap-3 text-xs tracking-[0.2em]">
                        <MessageCircle size={18} strokeWidth={1.25} />
                        WhatsApp
                      </Button>
                    </a>
                    {!unavailable && (
                      <Button
                        variant="luxury-ghost"
                        size="lg"
                        className="w-full h-14 gap-3 text-xs tracking-[0.2em]"
                        onClick={() => setVisitOpen(true)}
                      >
                        <CalendarDays size={18} strokeWidth={1.25} />
                        {tL("Demander une visite", "Request a visit", "Solicitar una visita")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-background/95 backdrop-blur-xl border-t border-border/60 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex gap-2.5 max-w-lg mx-auto">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="luxury" className="w-full h-[46px] gap-2 text-[10px] tracking-[0.15em] rounded-lg px-3">
                <MessageCircle size={16} strokeWidth={1.25} />
                WHATSAPP
              </Button>
            </a>
            {!unavailable && (
              <Button
                variant="luxury-ghost"
                className="flex-1 h-[46px] gap-2 text-[10px] tracking-[0.15em] rounded-lg px-3"
                onClick={() => setVisitOpen(true)}
              >
                <CalendarDays size={16} strokeWidth={1.25} />
                {tL("VISITER", "VISIT", "VISITAR")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for bottom bar */}
      <div className="h-20 lg:hidden" />

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
