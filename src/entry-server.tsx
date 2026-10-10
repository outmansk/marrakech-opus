/**
 * Build-time pre-render entry (bundled by `vite build --ssr`, driven by scripts/prerender.mjs).
 * Renders each public page to static HTML with its data, meta tags and JSON-LD,
 * so search engines and AI crawlers read the content without running JavaScript.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { dehydrate, type QueryClient } from "@tanstack/react-query";
import type { HelmetServerState } from "react-helmet-async";
import i18n from "./i18n";
import { LANGS, langFromPath, localizePath, stripLang } from "./i18n/routing";
import AppProviders from "./AppProviders";
import { createQueryClient } from "./lib/queryClient";
import AppRoutes, { type PublicPages } from "./AppRoutes";
import { supabase } from "./lib/supabase";
import { propertyIdFromParam, propertyPath } from "./lib/propertyUrl";
import { propertiesQueryOptions, propertyQueryOptions } from "./hooks/useBiens";
import { FILE_PROPERTIES } from "./lib/fileProperties";
import { SIMILAR_QUERY } from "./lib/propertyDetail";
import { articleQueryOptions, publishedArticlesQueryOptions } from "./hooks/useArticles";
import { withFileArticles } from "./content/blog";
import type { Article } from "./types/article";
import { LANDINGS, findLanding, landingCopyQueryOptions, landingPath } from "./content/landings";
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import PropertyDetail from "./pages/PropertyDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import PropertyRequest from "./pages/PropertyRequest";
import NotFound from "./pages/NotFound";
import ServiceLanding from "./pages/ServiceLanding";
import About from "./pages/About";
import LegalNotice from "./pages/LegalNotice";
import Privacy from "./pages/Privacy";

const pages: PublicPages = { Index, Catalogue, PropertyDetail, Blog, BlogPost, Contact, PropertyRequest, ServiceLanding, About, LegalNotice, Privacy, NotFound };

const STATIC_PATHS = ["/", "/catalogue", "/blog", "/contact", "/demande", "/a-propos", "/mentions-legales", "/confidentialite"];

/** Every public address to pre-render, in every language. */
export async function getPrerenderPaths(): Promise<string[]> {
  const [{ data: properties, error: propertiesError }, { data: articles, error: articlesError }] = await Promise.all([
    supabase.from("properties_v2").select("id, titre").in("statut", ["publie", "vendu-loue"]),
    supabase.from("articles").select("*").eq("est_publie", true),
  ]);
  if (propertiesError) throw propertiesError;
  if (articlesError) throw articlesError;

  const paths = LANGS.flatMap((lang) => [...STATIC_PATHS, ...[...(properties ?? []), ...FILE_PROPERTIES].map(propertyPath)].map((path) => localizePath(path, lang)));
  for (const landing of LANDINGS) paths.push(...LANGS.map((lang) => landingPath(landing.id, lang)));
  for (const article of withFileArticles((articles ?? []) as Article[], () => true)) {
    paths.push(localizePath(`/blog/${article.slug}`, LANGS.find((l) => l === article.lang) ?? "fr"));
  }
  return paths;
}

/** Loads the data a page needs into the query cache, under the same keys the page reads. */
async function prefetch(queryClient: QueryClient, url: string) {
  const lang = langFromPath(url);
  const path = stripLang(url);
  const [, section, param] = path.split("/");

  if (findLanding(lang, path)) {
    await Promise.all([
      queryClient.prefetchQuery(landingCopyQueryOptions(lang)),
      queryClient.prefetchQuery(propertiesQueryOptions({ statut: ["publie", "vendu-loue"] })),
    ]);
  }
  else if (path === "/") await queryClient.prefetchQuery(propertiesQueryOptions({ statut: "publie" }));
  else if (section === "catalogue" || section === "a-propos") await queryClient.prefetchQuery(propertiesQueryOptions({ statut: ["publie", "vendu-loue"] }));
  else if (section === "bien" && param) {
    // The property and the list its "similar properties" are picked from.
    await Promise.all([
      queryClient.prefetchQuery(propertyQueryOptions(propertyIdFromParam(param))),
      queryClient.prefetchQuery(propertiesQueryOptions(SIMILAR_QUERY)),
    ]);
  }
  else if (section === "blog" && param) await queryClient.prefetchQuery(articleQueryOptions(param));
  else if (section === "blog") await queryClient.prefetchQuery(publishedArticlesQueryOptions(lang));
}

export async function render(url: string) {
  const queryClient = createQueryClient();
  await prefetch(queryClient, url);
  await i18n.changeLanguage(langFromPath(url));

  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <AppProviders queryClient={queryClient} helmetContext={helmetContext}>
      <StaticRouter location={url}>
        <AppRoutes pages={pages} />
      </StaticRouter>
    </AppProviders>,
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? [helmet.title, helmet.meta, helmet.link, helmet.script].map((part) => part.toString()).join("")
    : "";
  const state = JSON.stringify(dehydrate(queryClient)).replace(/</g, "\\u003c");

  return {
    html,
    head,
    htmlAttributes: helmet?.htmlAttributes.toString() ?? "",
    state,
  };
}
