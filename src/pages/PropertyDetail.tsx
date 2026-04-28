import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bed, Car, MapPin, Clock, MessageCircle, CalendarDays, Bath, Maximize } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitModal from "@/components/VisitModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import LazyImage from "@/components/LazyImage";
import { Helmet } from "react-helmet-async";

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

  // Définition dynamique du type de bien pour le Schema.org
  const schemaType = property.type.toLowerCase().includes('appartement') ? 'Apartment' : 'SingleFamilyResidence';
  
  // Prix de l'offre (priorité à la vente, puis location)
  let offerPrice = property.prix_vente || property.prix_location_longue || property.prix_location_courte || property.prix || 0;
  
  // Construction du JSON-LD pour les LLMs (GEO) et Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": property.titre,
    "description": property.description_courte || property.description_longue || "Magnifique bien immobilier à Marrakech",
    "image": images,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Marrakech",
      "addressRegion": "Marrakech-Safi",
      "addressCountry": "MA",
      "streetAddress": property.quartier || "Marrakech"
    },
    ...(property.chambres && { "numberOfRooms": property.chambres }),
    ...(property.salles_de_bain && { "numberOfBathroomsTotal": property.salles_de_bain }),
    ...(property.surface_terrain && { 
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.surface_terrain,
        "unitCode": "MTK" // Mètre carré
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
      "url": window.location.href,
      "seller": {
        "@type": "RealEstateAgent",
        "name": "Live In Marrakech",
        "image": "https://liveinmarrakech.com/logo.png"
      }
    }
  };

  const metaTitle = `${property.titre} | Live In Marrakech`;
  const metaDescription = property.description_courte || `Découvrez ce magnifique bien immobilier (${property.type}) à ${property.quartier || 'Marrakech'}. Exclusivité Live In Marrakech.`;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={images[0]} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={images[0]} />

        {/* JSON-LD GEO/SEO Script */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Header />

      <div className="pt-24">
        <div className="container mx-auto px-6 md:px-12 mb-4">
          <Link to="/catalogue" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
            <ArrowLeft size={16} strokeWidth={1.25} />
            {t("nav.catalogue")}
          </Link>
        </div>

        <div className="container mx-auto px-6 md:px-12">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden mb-4 bg-muted">
          <LazyImage
              src={images[selectedImage]}
              alt={property.titre}
              eager
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
            />
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
                  <LazyImage
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
                <div className="flex flex-col mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs tracking-widest uppercase font-sans text-accent font-semibold">
                      {property.services.map(s => transactionLabel(s)).join(' • ')}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs tracking-widest uppercase font-sans text-muted-foreground">
                      {property.type}
                    </span>
                    {property.reference && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs tracking-widest uppercase font-sans text-muted-foreground">
                          Réf: {property.reference}
                        </span>
                      </>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                    {property.equipements.map((eq, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
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
  );
};

export default PropertyDetail;
