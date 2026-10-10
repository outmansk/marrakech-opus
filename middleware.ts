/**
 * Vercel Routing Middleware (runs on the edge before static files).
 *
 * Old property addresses /bien/<uuid> (also /en/bien/<uuid>, /es/bien/<uuid>) are still in
 * Google's index. They get a permanent redirect to the readable address /bien/<title>-<uuid>.
 * A property that no longer exists redirects to the catalogue of the same language, which
 * keeps the value of existing links (a 410 would drop it).
 * Every other request continues untouched.
 */
import { propertyPath } from "./src/lib/propertyUrl";
import fileProperties from "./src/content/fileProperties.json";

export const config = {
  matcher: ["/bien/:id", "/en/bien/:id", "/es/bien/:id"],
};

const BARE_UUID = /^\/(?:(en|es)\/)?bien\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const match = url.pathname.match(BARE_UUID);
  if (!match) return; // already a readable address

  const [, lang, id] = match;
  const prefix = lang ? `/${lang}` : "";
  const file = fileProperties.properties.find((property) => property.id === id);
  if (file) return Response.redirect(new URL(`${prefix}${propertyPath(file)}`, url.origin), 301);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return; // the page still redirects in the browser

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/properties_v2?select=id,titre&id=eq.${id}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (!response.ok) return;
    const [property] = (await response.json()) as { id: string; titre: string }[];
    const target = property ? `${prefix}${propertyPath(property)}` : `${prefix}/catalogue`;
    return Response.redirect(new URL(target, url.origin), 301);
  } catch {
    return; // network issue: let the client-side redirect handle it
  }
}
