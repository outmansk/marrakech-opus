import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/**
 * « Retour » : revient à la page précédente du site (catalogue filtré, accueil…) en gardant sa position,
 * ou va au catalogue si le visiteur est arrivé directement (lien partagé, Google). Le lien `fallback`
 * reste dans le HTML pré-rendu ; le choix se fait au clic, donc rendu identique serveur / client.
 */
export default function BackButton({ fallback, className = "" }: { fallback: string; className?: string }) {
  const navigate = useNavigate();
  const tL = useLocalizedText();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      event.preventDefault();
      navigate(-1);
    }
  };
  return (
    <Link to={fallback} onClick={onClick} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full bg-background px-3.5 text-[13px] font-semibold text-primary shadow-sm ring-1 ring-border hover:bg-primary-soft ${className}`}>
      <ArrowLeft size={17} strokeWidth={1.9} aria-hidden="true" />
      {tL("Retour", "Back", "Volver")}
    </Link>
  );
}
