import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import PropertyCard from "@/components/PropertyCard";
import { Reveal } from "@/components/motion/Animations";

const PropertiesCarousel = () => {
  const { i18n } = useTranslation();
  const [properties, setProperties] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  const tL = (fr: string, en: string, es: string) => {
    const language = i18n.language?.slice(0, 2) ?? "fr";
    return language === "en" ? en : language === "es" ? es : fr;
  };

  useEffect(() => {
    let active = true;
    const fetchProperties = async () => {
      const { data } = await supabase.from("properties_v2").select("*").eq("statut", "publie").order("created_at", { ascending: false }).limit(3);
      if (active) {
        setProperties((data as Bien[]) ?? []);
        setLoading(false);
      }
    };
    fetchProperties();
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-[#f6f1e8] pb-20 pt-0 md:bg-[#fbf8f2] md:pb-24 md:pt-8">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10 xl:px-16">
        <div className="pb-4 md:hidden">
          <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#5f6746]">{tL("Notre sélection", "Our selection", "Nuestra selección")}</p>
          <h2 className="mt-3 max-w-[340px] text-[35px] leading-[0.93] tracking-[-0.025em] text-[#211f1b]">{tL("Des biens d’exception, choisis pour vous.", "Exceptional homes, chosen for you.", "Propiedades excepcionales, elegidas para usted.")}</h2>
        </div>

        <Reveal className="hidden md:block">
          <div className="flex flex-col gap-5 border-b border-[#2b2722]/15 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#a4573e]">{tL("Notre sélection", "Our selection", "Nuestra selección")}</p>
              <h2 className="mt-3 text-[52px] leading-none tracking-[-0.025em] text-[#211f1b]">{tL("Propriétés à découvrir", "Properties to discover", "Propiedades por descubrir")}</h2>
            </div>
            <Link to="/catalogue" className="inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.17em] text-[#5f6746] hover:text-[#41482f]">
              {tL("Voir tout le catalogue", "View the full catalogue", "Ver todo el catálogo")} <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[4/3] bg-[#e9e1d5]" /><div className="mt-4 h-5 w-2/3 bg-[#e9e1d5]" /></div>)}
          </div>
        ) : properties.length > 0 ? (
          <div className="-mx-5 mt-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 scrollbar-hide md:mx-0 md:mt-9 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {properties.map((property, index) => <div key={property.id} className="w-[84vw] max-w-[420px] shrink-0 snap-start md:w-auto md:max-w-none"><PropertyCard property={property} revealDelay={index * 80} /></div>)}
          </div>
        ) : (
          <div className="mt-10 border border-[#2b2722]/12 bg-white p-8 text-center text-sm text-[#655f56]">
            {tL("Notre prochaine sélection arrive bientôt.", "Our next selection is coming soon.", "Nuestra próxima selección llegará pronto.")}
          </div>
        )}

        <Link to="/catalogue" className="mt-6 inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.17em] text-[#5f6746] md:hidden">
          {tL("Voir tout le catalogue", "View the full catalogue", "Ver todo el catálogo")} <ArrowRight size={16} />
        </Link>

        <div className="mt-10 grid gap-px border-y border-[#2b2722]/15 bg-[#2b2722]/15 md:mt-12 md:grid-cols-3">
          {[
            { icon: ShieldCheck, text: tL("Biens vérifiés", "Verified properties", "Propiedades verificadas") },
            { icon: Check, text: tL("Accompagnement sur mesure", "Tailored support", "Atención personalizada") },
            { icon: MessageCircle, text: tL("Réponse rapide sur WhatsApp", "Fast WhatsApp reply", "Respuesta rápida por WhatsApp") },
          ].map(({ icon: Icon, text }) => <div key={text} className="flex items-center justify-center gap-3 bg-[#fbf8f2] px-5 py-5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#4f4a43]"><Icon size={17} strokeWidth={1.3} className="text-[#a4573e]" />{text}</div>)}
        </div>
      </div>
    </section>
  );
};

export default PropertiesCarousel;
