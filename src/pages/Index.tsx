import { Link } from "react-router-dom";
import { ArrowUpRight, Home, Key, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import PropertiesCarousel from "@/components/PropertiesCarousel";
import lifestyleImage from "@/assets/slide4.jpg";
import SEOHead from "@/components/SEOHead";
import { PageTransition, Reveal } from "@/components/motion/Animations";
import { useLocalizedText } from "@/hooks/useLocalizedText";

const Index = () => {
  const tL = useLocalizedText();

  const services = [
    { icon: Home, title: tL("Acheter", "Buy", "Comprar"), text: tL("Une sélection précise, des visites privées et une négociation maîtrisée.", "A precise selection, private viewings and expert negotiation.", "Una selección precisa, visitas privadas y negociación experta."), to: "/catalogue?type=vente" },
    { icon: Key, title: tL("Louer", "Rent", "Alquilar"), text: tL("Des adresses adaptées à votre rythme de vie, pour un mois ou une année.", "Homes adapted to your lifestyle, for a month or a year.", "Hogares adaptados a su estilo de vida, por un mes o un año."), to: "/catalogue?type=location-longue-duree" },
    { icon: ShieldCheck, title: tL("Être accompagné", "Be advised", "Ser asesorado"), text: tL("Un interlocuteur unique, du premier échange jusqu’à la remise des clés.", "One dedicated advisor, from the first call to the key handover.", "Un asesor dedicado, desde la primera llamada hasta la entrega de llaves."), to: "/contact" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden">
        <SEOHead title={tL("Immobilier de luxe à Marrakech", "Luxury real estate in Marrakech", "Inmuebles de lujo en Marrakech")} description={tL("Villas, riads et appartements sélectionnés à Marrakech pour acheter, louer ou séjourner.", "Selected villas, riads and apartments in Marrakech to buy, rent or stay.", "Villas, riads y apartamentos seleccionados en Marrakech para comprar, alquilar o alojarse.")} />
        <Header />
        <HeroSlideshow />
        <PropertiesCarousel />

        <section className="bg-[#ede5d8] py-20 md:py-28">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center xl:px-16">
            <Reveal direction="left">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={lifestyleImage} alt="Intérieur contemporain ouvert sur un jardin à Marrakech" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-5 border border-white/35" />
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#a4573e]">{tL("Notre approche", "Our approach", "Nuestro enfoque")}</p>
                <h2 className="mt-4 max-w-[620px] text-[42px] leading-none tracking-[-0.02em] text-[#211f1b] md:text-[56px]">{tL("L’immobilier, avec plus d’écoute et moins de bruit.", "Real estate, with more attention and less noise.", "Inmuebles, con más atención y menos ruido.")}</h2>
                <p className="mt-6 max-w-[580px] text-[15px] leading-7 text-[#655f56]">{tL("Nous prenons le temps de comprendre votre projet, puis nous vous présentons uniquement les adresses qui ont du sens. Une expérience claire, confidentielle et profondément locale.", "We take time to understand your project, then show only the addresses that truly fit. A clear, confidential and deeply local experience.", "Nos tomamos el tiempo de comprender su proyecto y mostramos solo las propiedades que encajan. Una experiencia clara, confidencial y local.")}</p>
                <div className="mt-10 grid gap-px border-y border-[#2b2722]/15 bg-[#2b2722]/15 md:grid-cols-3">
                  {services.map(({ icon: Icon, title, text, to }) => (
                    <Link key={title} to={to} className="group bg-[#ede5d8] px-5 py-7 transition-colors duration-200 hover:bg-[#f6f1e8]">
                      <Icon size={21} strokeWidth={1.2} className="text-[#5f6746]" />
                      <h3 className="mt-5 text-2xl text-[#211f1b]">{title}</h3>
                      <p className="mt-3 text-xs leading-6 text-[#655f56]">{text}</p>
                      <ArrowUpRight size={16} className="mt-5 text-[#a4573e] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
