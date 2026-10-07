import { lazy, Suspense, useEffect, useLayoutEffect, type ComponentType } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGS, DEFAULT_LANG, type Lang } from "@/i18n/routing";

// Animation infrastructure
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

/**
 * Public pages are passed in: the browser loads them lazily (App.tsx),
 * the build-time pre-render imports them directly (entry-server.tsx).
 */
export interface PublicPages {
  Index: ComponentType;
  Catalogue: ComponentType;
  PropertyDetail: ComponentType;
  Blog: ComponentType;
  BlogPost: ComponentType;
  Contact: ComponentType;
  PropertyRequest: ComponentType;
  ServiceLanding: ComponentType;
  NotFound: ComponentType;
}

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBiens = lazy(() => import("./pages/admin/AdminBiens"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminVisites = lazy(() => import("./pages/admin/AdminVisites"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminAgenda = lazy(() => import("./pages/admin/AdminAgenda"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Keeps i18next on the language of the URL prefix (back/forward, language links). */
function LangLayout({ lang }: { lang: Lang }) {
  const { i18n } = useTranslation();
  useIsomorphicLayoutEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [i18n, lang]);
  return <Outlet />;
}

const publicRoutes = (p: PublicPages) => [
  <Route key="index" index element={<p.Index />} />,
  <Route key="catalogue" path="catalogue" element={<p.Catalogue />} />,
  <Route key="bien" path="bien/:id" element={<p.PropertyDetail />} />,
  <Route key="blog" path="blog" element={<p.Blog />} />,
  <Route key="post" path="blog/:slug" element={<p.BlogPost />} />,
  <Route key="contact" path="contact" element={<p.Contact />} />,
  <Route key="demande" path="demande" element={<p.PropertyRequest />} />,
  // Search landing pages (/vente/villas-marrakech, /en/for-sale/…): the page looks the path up
  // in src/content/landings.json and shows the 404 page when it is not one of them.
  <Route key="landing-hub" path=":section" element={<p.ServiceLanding />} />,
  <Route key="landing" path=":section/:slug" element={<p.ServiceLanding />} />,
  <Route key="404" path="*" element={<p.NotFound />} />,
];

export default function AppRoutes({ pages }: { pages: PublicPages }) {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Chargement" />}>
        <Routes>
          {/* ── Public, one tree per language (/, /en, /es) ─────────── */}
          {LANGS.map((lang) => (
            <Route key={lang} path={lang === DEFAULT_LANG ? "/" : `/${lang}`} element={<LangLayout lang={lang} />}>
              {publicRoutes(pages)}
            </Route>
          ))}

          {/* ── Admin (login public) ─────────────────────────────── */}
          <Route path="/manage-xk92p/login" element={<AdminLogin />} />

          {/* ── Admin (protected) ────────────────────────────────── */}
          <Route
            path="/manage-xk92p"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/manage-xk92p/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="biens" element={<AdminBiens />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="visites" element={<AdminVisites />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="agenda" element={<AdminAgenda />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
