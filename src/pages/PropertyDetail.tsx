import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bed, Car, MapPin, Clock, MessageCircle, CalendarDays, Bath, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitModal from "@/components/VisitModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SEOHead from "@/components/SEOHead";
import { BASE_URL } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { PageTransition, Reveal, EASE_LUXURY } from "@/components/motion/Animations";
import { ServiceTag, TypeBadge, EquipmentMicroTags } from "@/components/PropertyTags";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA").format(price) + " MAD";
};

const PropertyDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [property, setProperty] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [visitOpen, setVisitOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties_v2").select("*").eq("id", id).single();
      if (data) setProperty(data as Bien);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const transactionLabel = (service: string) => {
    switch (service) {
      case "vente": return t('services.vente');
      case "location-courte-duree": return t('services.location_courte');
      case "location-longue-duree": return t('services.location_longue');
      case "sous-location": return t('services.sous_location');
      default: return service;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-24 container mx-auto px-6 md:px-12">
          <div className="animate-pulse space-y-8">
            <div className="h-[60vh] bg-muted" />
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 text-center">
          <h2 className="mb-6">{t('biens.aucun_bien')}</h2>
          <Link to="/catalogue">
            <Button variant="luxury-ghost">Retour au catalogue</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.photos?.length > 0 ? property.photos : ["/placeholder.svg"];
  const whatsappUrl = `https://wa.me/212605387041?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property?.titre} (Ref: ${property?.reference})`)}`;

  // Prix de l'offre (priorité à la vente, puis location)
  const offerPrice = property.prix_vente || property.prix_location_longue || property.prix_location_courte || property.prix || 0;
  const propertyUrl = `${BASE_URL}/bien/${property.id}`;

  // Construction du JSON-LD RealEstateListing pour les LLMs (GEO) et Google
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.titre,
    "description": property.description_courte || property.description_longue || "Magnifique bien immobilier à Marrakech",
    "url": propertyUrl,
    "datePosted": property.created_at,
    "image": images,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.quartier || "Marrakech",
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
      "name": eq,
      "value": true
    })) || [],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "MAD",
      "price": offerPrice,
      "availability": "https://schema.org/InStock",
      "url": propertyUrl,
      "seller": {
        "@type": "RealEstateAgent",
        "name": "Live In Marrakech",
        "url": "https://liveinmarrakech.com"
      }
    }
  };

  const metaDescription = property.description_courte || `Découvrez ce magnifique bien immobilier (${property.type}) à ${property.quartier || 'Marrakech'}. Exclusivité Live In Marrakech.`;

  return (
    <PageTransition>
    <div className="min-h-screen">
      <SEOHead
        title={property.titre}
        description={metaDescription}
        image={images[0]}
        schema={jsonLd}
      />

      <Header />

      <div className="pt-24">
        <div className="container mx-auto px-6 md:px-12 mb-4">
          <Link to="/catalogue" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
            <ArrowLeft size={16} strokeWidth={1.25} />
            {t("nav.catalogue")}
          </Link>
        </div>

        <Reveal>
        <div className="container mx-auto px-6 md:px-12">
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden mb-4 bg-muted group">
          <OptimizedImage
              src={images[selectedImage]}
              alt={property.titre}
              eager
              size="hero"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
              wrapperClassName="w-full h-full"
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? "bg-white scale-125" : "bg-white/50"}`}
                      aria-label={`Aller à l'image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-24 h-16 overflow-hidden transition-all ${
                    selectedImage === i ? "opacity-100 ring-2 ring-accent" : "opacity-40 hover:opacity-70"
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
        </Reveal>

        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
                <div className="flex flex-col mb-12">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {property.services.map(s => (
                      <ServiceTag key={s} service={s} variant="detail" />
                    ))}
                    <TypeBadge type={property.type} />

                    {property.reference && (
                      <span className="text-xs tracking-widest uppercase font-sans text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                        Réf: {property.reference}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">
                    {property.titre}
                  </h1>

                  <div className="flex flex-col gap-3">
                    {property.services.includes('vente') && property.prix_vente && (
                      <div className="flex items-baseline gap-4">
                        <p className="text-3xl font-serif text-accent">{formatPrice(property.prix_vente)}</p>
                        <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-sans border border-border px-2 py-0.5">{t('services.vente')}</span>
                      </div>
                    )}
                    {property.services.includes('location-longue-duree') && property.prix_location_longue && (
                      <div className="flex items-baseline gap-4">
                        <p className="text-3xl font-serif text-accent">{formatPrice(property.prix_location_longue)} / mois</p>
                        <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-sans border border-border px-2 py-0.5">{t('services.location_longue')}</span>
                      </div>
                    )}
                    {property.services.includes('location-courte-duree') && property.prix_location_courte && (
                      <div className="flex items-baseline gap-4">
                        <p className="text-3xl font-serif text-accent">{formatPrice(property.prix_location_courte)} / nuit</p>
                        <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-sans border border-border px-2 py-0.5">{t('services.location_courte')}</span>
                      </div>
                    )}
                    {!property.prix_vente && !property.prix_location_longue && !property.prix_location_courte && property.prix && (
                       <p className="text-3xl font-serif text-accent">{formatPrice(property.prix)}</p>
                    )}
                  </div>
                </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 py-8 border-y border-border">
                {property.chambres !== null && (
                  <div className="flex items-center gap-3">
                    <Bed size={22} strokeWidth={1} className="text-muted-foreground" />
                    <span className="font-light tracking-wide">{property.chambres} {t('biens.chambres_plural')}</span>
                  </div>
                )}
                {property.salles_de_bain !== null && (
                  <div className="flex items-center gap-3">
                    <Bath size={22} strokeWidth={1} className="text-muted-foreground" />
                    <span className="font-light tracking-wide">{property.salles_de_bain} Sdb</span>
                  </div>
                )}
                {property.surface_terrain !== null && (
                  <div className="flex items-center gap-3">
                    <Maximize size={22} strokeWidth={1} className="text-muted-foreground" />
                    <span className="font-light tracking-wide">{property.surface_terrain} {t('biens.surface')}</span>
                  </div>
                )}
                {property.equipements?.includes('Parking') && (
                  <div className="flex items-center gap-3">
                    <Car size={22} strokeWidth={1} className="text-muted-foreground" />
                    <span className="font-light tracking-wide">Parking</span>
                  </div>
                )}
                {property.quartier && (
                  <div className="flex items-center gap-3">
                    <MapPin size={22} strokeWidth={1} className="text-muted-foreground" />
                    <span className="font-light tracking-wide">{property.quartier}</span>
                  </div>
                )}
              </div>

              {property.description_longue || property.description_courte ? (
                <div className="max-w-none">
                  <h3 className="text-xl mb-6 font-serif">À propos de ce bien</h3>
                  <p className="text-muted-foreground font-light leading-relaxed text-lg whitespace-pre-line font-sans">
                    {property.description_longue || property.description_courte}
                  </p>
                </div>
              ) : null}

              {property.proximites && property.proximites.length > 0 && (
                <div>
                  <h3 className="text-xl mb-6 font-serif">Points d'intérêt & Proximité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.proximites.map((prox, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-sm">
                        <div className="flex items-center gap-3">
                          <MapPin size={18} strokeWidth={1} className="text-accent" />
                          <span className="font-light tracking-wide">{prox.place}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={14} strokeWidth={1.5} />
                          <span className="text-xs uppercase tracking-tighter">{prox.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.equipements && property.equipements.length > 0 && (
                <div>
                  <h3 className="text-xl mb-6 font-serif">Équipements & Prestations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.equipements.map((eq, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 border border-border/30 rounded-sm hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-accent/60 shrink-0" />
                        <span className="font-light text-muted-foreground text-sm tracking-wide">{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="bg-card border border-border p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">Réserver ou Visiter</p>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">
                      Ce bien vous intéresse ? Nos experts sont à votre disposition pour organiser une visite privée.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="luxury" size="lg" className="w-full h-14 gap-3 text-xs tracking-[0.2em]">
                        <MessageCircle size={18} strokeWidth={1.25} />
                        WhatsApp
                      </Button>
                    </a>
                    <Button
                      variant="luxury-ghost"
                      size="lg"
                      className="w-full h-14 gap-3 text-xs tracking-[0.2em]"
                      onClick={() => setVisitOpen(true)}
                    >
                      <CalendarDays size={18} strokeWidth={1.25} />
                      Demander une visite
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40 animate-fade-in-up">
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 p-3 shadow-2xl flex gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="luxury" className="w-full h-12 gap-2 text-[10px] tracking-widest px-2">
              <MessageCircle size={16} strokeWidth={1.25} />
              WHATSAPP
            </Button>
          </a>
          <Button
            variant="luxury-ghost"
            className="flex-1 h-12 gap-2 text-[10px] tracking-widest px-2"
            onClick={() => setVisitOpen(true)}
          >
            <CalendarDays size={16} strokeWidth={1.25} />
            VISITER
          </Button>
        </div>
      </div>

      <div className="h-24 lg:hidden" />

      <Footer />
      <VisitModal
        open={visitOpen}
        onOpenChange={setVisitOpen}
        propertyId={property.id}
        propertyTitle={property.titre}
      />
    </div>
    </PageTransition>
  );
};

export default PropertyDetail;
