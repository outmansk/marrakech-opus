import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import PropertiesCarousel from "@/components/PropertiesCarousel";
import servicesImage from "@/assets/slide1.jpg";
import approachImage from "@/assets/slide4.jpg";
import districtsImage from "@/assets/slide2.jpg";
import customSearchImage from "@/assets/slide1_koutoubia.png";
import SEOHead from "@/components/SEOHead";
import { PageTransition, Reveal } from "@/components/motion/Animations";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { QUARTIERS } from "@/types/property";

const WHATSAPP_URL = "https://wa.me/212605387041?text=Bonjour%2C%20je%20souhaite%20%C3%AAtre%20conseill%C3%A9%20pour%20un%20bien%20%C3%A0%20Marrakech.";
const PHONE = { href: "tel:+212605387041", label: "+212 6 05 38 70 41" };

const eyebrowClass = "text-[11px] font-medium uppercase leading-none tracking-[0.24em] lg:text-xs lg:tracking-[0.26em]";
const sectionTitleClass = "text-[40px] font-normal leading-[1.02] tracking-[-0.02em] lg:text-[64px] lg:leading-none";

const Index = () => {
  const tL = useLocalizedText();

  const trust = [
    { icon: ShieldCheck, text: tL("Biens vérifiés", "Verified properties", "Propiedades verificadas") },
    { icon: Check, text: tL("Accompagnement sur mesure", "Tailored support", "Atención personalizada") },
    { icon: MessageCircle, text: tL("Réponse rapide sur WhatsApp", "Fast WhatsApp reply", "Respuesta rápida por WhatsApp") },
  ];

  const services = [
    { title: tL("Acheter", "Buy", "Comprar"), text: tL("Une sélection précise, des visites privées et une négociation maîtrisée.", "A precise selection, private viewings and expert negotiation.", "Una selección precisa, visitas privadas y negociación experta."), to: "/catalogue?type=vente" },
    { title: tL("Louer", "Rent", "Alquilar"), text: tL("Des adresses adaptées à votre rythme de vie, pour un mois ou une année.", "Homes adapted to your lifestyle, for a month or a year.", "Hogares adaptados a su estilo de vida, por un mes o un año."), to: "/catalogue?type=location-longue-duree" },
    { title: tL("Être accompagné", "Be advised", "Ser asesorado"), text: tL("Un interlocuteur unique, du premier échange jusqu’à la remise des clés.", "One dedicated advisor, from the first call to the key handover.", "Un asesor dedicado, desde la primera llamada hasta la entrega de llaves."), to: "/contact" },
  ];

  const requestLabel = tL("Décrire ma recherche", "Tell us what you need", "Cuéntenos qué busca");

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-clip">
        <SEOHead title={tL("Immobilier de luxe à Marrakech", "Luxury real estate in Marrakech", "Inmuebles de lujo en Marrakech")} description={tL("Villas, riads et appartements sélectionnés à Marrakech pour acheter, louer ou séjourner.", "Selected villas, riads and apartments in Marrakech to buy, rent or stay.", "Villas, riads y apartamentos seleccionados en Marrakech para comprar, alquilar o alojarse.")} />
        <Header />
        <HeroSlideshow />

        {/* Trust band */}
        <section className="bg-[#fbf8f2] lg:border-b lg:border-[#e3d9ca]">
          <ul className="mx-5 mt-7 flex flex-col border-t border-[#e3d9ca] lg:mx-auto lg:mt-0 lg:grid lg:max-w-[1312px] lg:grid-cols-3 lg:border-t-0 lg:px-16">
            {trust.map(({ icon: Icon, text }, index) => (
              <li
                key={text}
                className={`flex items-center gap-3.5 border-b border-[#e3d9ca] py-4 text-[11px] font-medium uppercase leading-[1.3] tracking-[0.14em] text-[#4f4a43] lg:gap-4 lg:border-b-0 lg:py-[30px] lg:text-xs lg:tracking-[0.16em] ${index === 1 ? "lg:justify-center lg:border-x" : ""} ${index === 2 ? "lg:justify-end" : ""}`}
              >
                <Icon size={18} strokeWidth={1.4} aria-hidden="true" className="flex-none text-[#a4573e] lg:h-5 lg:w-5" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <PropertiesCarousel />

        {/* Nos services */}
        <section className="bg-[#ede5d8] px-5 py-16 lg:px-0 lg:py-[120px]">
          <div className="mx-auto grid max-w-[1312px] gap-7 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-24 lg:px-16">
            <div className="flex flex-col gap-3.5 lg:sticky lg:top-24 lg:gap-[22px]">
              <p className={`${eyebrowClass} text-[#a4573e]`}>{tL("Nos services", "Our services", "Nuestros servicios")}</p>
              <h2 className="text-[40px] font-normal leading-[1.02] tracking-[-0.02em] lg:text-[58px]">
                {tL("Acheter, louer ou séjourner — ", "Buy, rent or stay — ", "Comprar, alquilar o alojarse — ")}
                <em className="italic text-[#a4573e]">{tL("simplement.", "simply.", "fácilmente.")}</em>
              </h2>
              <img
                src={servicesImage}
                alt={tL("Villa illuminée au crépuscule à Marrakech", "Illuminated villa at dusk in Marrakech", "Villa iluminada al anochecer en Marrakech")}
                loading="lazy"
                className="mt-[18px] hidden aspect-[4/3] w-full object-cover lg:block"
              />
            </div>
            <ol className="border-t border-[#211f1b]/[0.18]">
              {services.map(({ title, text, to }, index) => (
                <li key={to} className="border-b border-[#211f1b]/[0.18]">
                  <Link to={to} className="group grid grid-cols-[40px_minmax(0,1fr)_44px] items-start gap-3 py-[26px] text-[#211f1b] hover:text-[#211f1b] lg:grid-cols-[72px_minmax(0,1fr)_56px] lg:gap-6 lg:py-11">
                    <span className="pt-1.5 font-serif text-[22px] italic leading-none text-[#a4573e] lg:pt-2.5 lg:text-[26px]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex flex-col gap-2.5 lg:gap-3.5">
                      <span className="font-serif text-[32px] leading-none lg:text-[46px] lg:tracking-[-0.015em]">{title}</span>
                      <span className="max-w-[460px] text-sm leading-[1.6] text-[#655f56] lg:text-[15px] lg:leading-[1.7]">{text}</span>
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#211f1b] transition-colors duration-200 group-hover:bg-[#211f1b] group-hover:text-[#fbf8f2] lg:h-14 lg:w-14">
                      <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Notre approche */}
        <section className="px-5 py-16 lg:px-0 lg:py-[136px]">
          <div className="mx-auto grid max-w-[1312px] gap-[26px] lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-16">
            <Reveal direction="left">
              <div className="relative">
                <img src={approachImage} alt={tL("Intérieur contemporain ouvert sur un jardin à Marrakech", "Contemporary interior opening onto a garden in Marrakech", "Interior contemporáneo abierto a un jardín en Marrakech")} loading="lazy" className="block aspect-[4/5] w-full object-cover" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-3.5 border border-white/40 lg:inset-[22px]" />
              </div>
            </Reveal>
            <Reveal direction="right">
              <div className="flex flex-col gap-[26px] lg:gap-7">
                <p className={`${eyebrowClass} text-[#a4573e]`}>{tL("Notre approche", "Our approach", "Nuestro enfoque")}</p>
                <h2 className={sectionTitleClass}>{tL("L’immobilier, avec plus d’écoute et moins de bruit.", "Real estate, with more attention and less noise.", "Inmuebles, con más atención y menos ruido.")}</h2>
                <p className="max-w-[520px] text-[15px] leading-[1.75] text-[#655f56] lg:text-base lg:leading-[1.8]">
                  {tL("Nous prenons le temps de comprendre votre projet, puis nous vous présentons uniquement les adresses qui ont du sens. Une expérience claire, confidentielle et profondément locale.", "We take time to understand your project, then show only the addresses that truly fit. A clear, confidential and deeply local experience.", "Nos tomamos el tiempo de comprender su proyecto y mostramos solo las propiedades que encajan. Una experiencia clara, confidencial y local.")}
                </p>
                <div className="flex flex-wrap gap-3 lg:pt-2.5">
                  <Link to="/demande" className="flex min-h-14 w-full items-center justify-between gap-3.5 bg-[#211f1b] px-5 text-xs font-medium uppercase leading-none tracking-[0.16em] text-[#fbf8f2] transition-colors duration-200 hover:bg-[#a4573e] hover:text-[#fbf8f2] lg:w-auto lg:justify-start lg:px-[26px] lg:tracking-[0.18em]">
                    {requestLabel}
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hidden min-h-14 items-center gap-3 border-b border-[#5f6746]/40 px-1 font-serif text-[22px] font-medium italic leading-none text-[#5f6746] hover:text-[#41482f] lg:flex">
                    <MessageCircle size={18} strokeWidth={1.4} aria-hidden="true" />
                    {tL("Parler à un conseiller", "Talk to an advisor", "Hablar con un asesor")}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Explorer Marrakech */}
        <section className="relative overflow-hidden bg-[#1d1814] text-[#fbf8f2]">
          <img src={districtsImage} alt={tL("La Koutoubia et l’Atlas au coucher du soleil", "The Koutoubia and the Atlas at sunset", "La Kutubía y el Atlas al atardecer")} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-50 lg:opacity-[0.55]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.9)_0%,rgba(20,16,12,0.6)_100%)] lg:bg-[linear-gradient(90deg,rgba(20,16,12,0.92)_0%,rgba(20,16,12,0.55)_60%,rgba(20,16,12,0.35)_100%)]" />
          <div className="relative mx-auto flex max-w-[1312px] flex-col gap-7 px-5 py-16 lg:gap-12 lg:px-16 lg:py-32">
            <div className="flex max-w-[640px] flex-col gap-3.5 lg:gap-[18px]">
              <p className={`${eyebrowClass} text-[#f0c9b8]`}>{tL("Explorer Marrakech", "Explore Marrakech", "Explorar Marrakech")}</p>
              <h2 className={`${sectionTitleClass} text-[#fbf8f2]`}>{tL("Chaque quartier, une autre façon de vivre la ville.", "Every neighborhood, another way to experience the city.", "Cada barrio, otra forma de vivir la ciudad.")}</h2>
            </div>
            <ul className="flex max-w-[980px] flex-wrap gap-2 lg:gap-3">
              {QUARTIERS.map((quartier) => (
                <li key={quartier}>
                  <Link
                    to={`/catalogue?quartier=${encodeURIComponent(quartier)}`}
                    className="flex min-h-[46px] items-center gap-3 border border-[#fbf8f2]/40 bg-[#14100c]/25 px-4 font-serif text-[19px] leading-none text-[#fbf8f2] transition-colors duration-200 hover:border-[#fbf8f2] hover:bg-[#fbf8f2] hover:text-[#211f1b] lg:min-h-[52px] lg:px-[22px] lg:text-[22px]"
                  >
                    {quartier}
                    <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" className="hidden text-[#f0c9b8] lg:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recherche sur mesure */}
        <section className="bg-[#fbf8f2] px-4 py-14 lg:px-0 lg:py-[120px]">
          <div className="mx-auto max-w-[1312px] lg:px-16">
            <div className="flex flex-col overflow-hidden bg-[#a4573e] text-white lg:grid lg:grid-cols-[7fr_5fr]">
              <img src={customSearchImage} alt={tL("Terrasse face à la Koutoubia", "Terrace facing the Koutoubia", "Terraza frente a la Kutubía")} loading="lazy" className="block aspect-[16/10] w-full object-cover lg:order-2 lg:aspect-auto lg:h-full lg:min-h-[480px]" />
              <div className="flex flex-col justify-center gap-5 px-[22px] pb-[26px] pt-8 lg:gap-[26px] lg:px-[72px] lg:py-20">
                <p className="text-[11px] font-medium uppercase leading-none tracking-[0.24em] text-[#fbe3d8] lg:text-xs lg:tracking-[0.26em]">{tL("Recherche sur mesure", "Tailored search", "Búsqueda a medida")}</p>
                <h2 className="text-[34px] font-normal leading-[1.05] text-white lg:text-[56px] lg:leading-[1.02] lg:tracking-[-0.02em]">
                  {tL("Vous ne trouvez pas votre bien ? Décrivez-le, nous le cherchons pour vous.", "Can’t find your property? Describe it and we’ll look for it for you.", "¿No encuentra su propiedad? Descríbala y la buscamos por usted.")}
                </h2>
                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:pt-2">
                  <Link to="/demande" className="flex min-h-14 items-center justify-between gap-3.5 bg-[#fbf8f2] px-5 text-xs font-medium uppercase leading-none tracking-[0.16em] text-[#211f1b] transition-colors duration-200 hover:bg-[#211f1b] hover:text-[#fbf8f2] lg:justify-start lg:px-[26px] lg:tracking-[0.18em]">
                    {requestLabel}
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                  <a href={PHONE.href} className="flex min-h-[52px] items-center justify-center border border-white/60 text-xs font-medium leading-none tracking-[0.16em] text-white transition-colors duration-200 hover:bg-white hover:text-[#a4573e] lg:min-h-14 lg:px-6 lg:tracking-[0.18em]">
                    {PHONE.label}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
