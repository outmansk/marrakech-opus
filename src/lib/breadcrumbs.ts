import { BASE_URL } from "@/hooks/useSEO";

export interface Crumb {
  name: string;
  /** Path with its language prefix ("/en/catalogue"). */
  path: string;
}

const absolute = (path: string) => `${BASE_URL}${path === "/" ? "" : path}`;

/** BreadcrumbList structured data matching the visible trail. */
export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": crumbs.map((crumb, index) => ({ "@type": "ListItem", "position": index + 1, "name": crumb.name, "item": absolute(crumb.path) })),
});
