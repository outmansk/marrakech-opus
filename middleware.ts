/** Permanent redirects from both legacy property URL formats to the stored slug. */
import { isUuid, propertyIdFromParam, propertyPath } from "./src/lib/propertyUrl";
import fileProperties from "./src/content/fileProperties.json";

export const config = {
  matcher: ["/bien/:id", "/en/bien/:id", "/es/bien/:id"],
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/(?:(en|es)\/)?bien\/([^/]+)$/);
  if (!match) return;
  const [, lang, param] = match;
  const id = propertyIdFromParam(param);
  if (!id || !isUuid(id)) return; // Short URLs need no database lookup at the edge.
  const prefix = lang ? `/${lang}` : "";
  const redirect = (property: { id: string; titre: string; slug?: string | null }) => {
    const pathname = `${prefix}${propertyPath(property)}`;
    if (pathname === url.pathname) return; // Legacy fallback before the SQL migration: no loop.
    const target = new URL(url);
    target.pathname = pathname; // Preserve language, tracking parameters and any fragment.
    return Response.redirect(target, 301);
  };
  const file = fileProperties.properties.find((property) => property.id === id);
  if (file) return redirect(file);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/properties_v2?select=*&id=eq.${id}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return;
    const [property] = (await response.json()) as { id: string; titre: string; slug?: string | null }[];
    if (property) return redirect(property);
    // An unknown/deleted property is not permanently redirected to an unrelated catalogue.
  } catch {
    return; // The browser can still resolve the property if the edge lookup fails.
  }
}
