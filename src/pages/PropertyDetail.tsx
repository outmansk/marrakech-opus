import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bed, Car, MapPin, Clock, MessageCircle, CalendarDays } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitModal from "@/components/VisitModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";

const formatPrice = (price: number, type: string) => {
  const formatted = new Intl.NumberFormat("fr-MA").format(price);
  switch (type) {
    case "vente": return `${formatted} MAD`;
    case "location_courte": return `${formatted} MAD / nuit`;
    case "location_longue": return `${formatted} MAD / mois`;
    default: return `${formatted} MAD`;
  }
};

const transactionLabel = (type: string) => {
  switch (type) {
    case "vente": return "Vente";
    case "location_courte": return "Location courte duree";
    case "location_longue": return "Location longue duree";
    default: return type;
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [visitOpen, setVisitOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) setProperty(data as Property);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

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
          <h2 className="mb-6">Bien introuvable</h2>
          <Link to="/catalogue">
            <Button variant="luxury-ghost">Retour au catalogue</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.image_urls?.length > 0 ? property.image_urls : ["/placeholder.svg"];
  const whatsappUrl = `https://wa.me/212600000000?text=${encodeURIComponent(`Bonjour, je suis interesse(e) par le bien : ${property.title}`)}`;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24">
        {/* Gallery */}
        <div className="container mx-auto px-6 md:px-12 mb-4">
          <Link to="/catalogue" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
            <ArrowLeft size={16} strokeWidth={1.25} />
            Retour
          </Link>
        </div>

        <div className="container mx-auto px-6 md:px-12">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden mb-4">
            <img
              src={images[selectedImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-24 h-16 overflow-hidden transition-opacity ${
                    selectedImage === i ? "opacity-100 ring-1 ring-foreground" : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
                  {transactionLabel(property.transaction_type)} — {property.property_type}
                </p>
                <h1 className="mb-4">{property.title}</h1>
                <p className="text-accent font-serif text-2xl">
                  {formatPrice(property.price, property.transaction_type)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 py-6 border-y border-border">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed size={20} strokeWidth={1} />
                    <span className="font-light">{property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {property.secure_parking && (
                  <div className="flex items-center gap-2">
                    <Car size={20} strokeWidth={1} />
                    <span className="font-light">Parking securise</span>
                  </div>
                )}
                {property.environment_type && (
                  <div className="flex items-center gap-2">
                    <MapPin size={20} strokeWidth={1} />
                    <span className="font-light">{property.environment_type}</span>
                  </div>
                )}
              </div>

              {property.description && (
                <div>
                  <h3 className="text-xl mb-4">Description</h3>
                  <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {property.proximities && property.proximities.length > 0 && (
                <div>
                  <h3 className="text-xl mb-6">Proximites</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.proximities.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50">
                        <MapPin size={16} strokeWidth={1.25} className="text-muted-foreground flex-shrink-0" />
                        <span className="font-light">{p.place}</span>
                        <div className="flex items-center gap-1 ml-auto text-muted-foreground">
                          <Clock size={14} strokeWidth={1.25} />
                          <span className="text-sm font-light">{p.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar CTAs */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="luxury" size="lg" className="w-full h-14 gap-3">
                    <MessageCircle size={18} strokeWidth={1.25} />
                    Contacter sur WhatsApp
                  </Button>
                </a>
                <Button
                  variant="luxury-ghost"
                  size="lg"
                  className="w-full h-14 gap-3"
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

      <Footer />
      <VisitModal
        open={visitOpen}
        onOpenChange={setVisitOpen}
        propertyId={property.id}
        propertyTitle={property.title}
      />
    </div>
  );
};

export default PropertyDetail;
