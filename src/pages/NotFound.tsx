import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";

const NotFound = () => {
  const location = useLocation();
  const { lp } = useLocalePath();
  const tL = useLocalizedText();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title={tL("Page introuvable", "Page not found", "Página no encontrada")}
        description={tL("La page que vous recherchez n'existe pas ou a été déplacée.", "The page you are looking for does not exist or has moved.", "La página que busca no existe o ha cambiado de dirección.")}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{tL("Cette page n'existe pas.", "This page does not exist.", "Esta página no existe.")}</p>
        <Link to={lp("/")} className="text-primary underline hover:text-primary/90">
          {tL("Retour à l'accueil", "Back to home", "Volver al inicio")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
