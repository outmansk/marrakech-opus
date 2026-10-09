import { Link } from "react-router-dom";
import type { Crumb } from "@/lib/breadcrumbs";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/** Visible breadcrumb trail; pair it with breadcrumbJsonLd() in the page's SEOHead schema. */
export default function Breadcrumbs({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  const tL = useLocalizedText();
  return (
    <nav aria-label={tL("Fil d’Ariane", "Breadcrumb", "Ruta de navegación")} className={`flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#777065] ${className}`}>
      {crumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true">/</span>}
          {index < crumbs.length - 1
            ? <Link to={crumb.path} className="hover:text-[#a4573e]">{crumb.name}</Link>
            : <span aria-current="page">{crumb.name}</span>}
        </span>
      ))}
    </nav>
  );
}
