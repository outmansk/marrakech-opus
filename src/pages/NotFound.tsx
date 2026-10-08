import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { landingPath } from "@/content/landings";

// Shown for unknown addresses. On Vercel these get a real 404 status (dist/404.html, see vercel.json);
// the page stays out of search results and points to the main sections.
const NotFound = () => {
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();

  const links = [
    { to: landingPath("location", lang), label: tL("Location longue durée", "Long-term rentals", "Alquiler de larga duración") },
    { to: landingPath("vente", lang), label: tL("Biens à vendre", "Property for sale", "Inmuebles en venta") },
    { to: lp("/catalogue"), label: tL("Tous nos biens", "All our properties", "Todas nuestras propiedades") },
    { to: lp("/demande"), label: tL("Décrire ma recherche", "Tell us what you need", "Cuéntenos qué busca") },
  ];

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#211f1b]">
      <SEOHead
        title={tL("Page introuvable", "Page not found", "Página no encontrada")}
        description={tL("La page que vous recherchez n'existe pas ou a été déplacée.", "The page you are looking for does not exist or has moved.", "La página que busca no existe o ha cambiado de dirección.")}
        noindex
      />
      <Header />
      <main className="mx-auto max-w-[760px] px-5 pb-20 pt-32 md:px-10">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#a4573e]">404</p>
        <h1 className="text-[38px] leading-[1.05] md:text-[52px]">{tL("Cette page n'existe pas", "This page does not exist", "Esta página no existe")}</h1>
        <p className="mt-5 text-[15px] leading-[1.75] text-[#4f4a43]">
          {tL(
            "L'adresse a peut-être changé ou le bien n'est plus en ligne. Voici où trouver ce que vous cherchez :",
            "The address may have changed or the property is no longer listed. Here is where to find what you are looking for:",
            "Puede que la dirección haya cambiado o que el inmueble ya no esté publicado. Aquí encontrará lo que busca:",
          )}
        </p>
        <ul className="mt-8 border-t border-[#2b2722]/15">
          {links.map((link) => (
            <li key={link.to} className="border-b border-[#2b2722]/15">
              <Link to={link.to} className="flex min-h-14 items-center justify-between gap-3 py-4 font-serif text-[22px] hover:text-[#a4573e]">
                {link.label} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
