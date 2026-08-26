import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";

// Animation infrastructure
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

const Index = lazy(() => import("./pages/Index"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBiens = lazy(() => import("./pages/admin/AdminBiens"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminVisites = lazy(() => import("./pages/admin/AdminVisites"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Chargement" />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/" element={<Index />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/bien/:id" element={<PropertyDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />

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
        </Route>

        {/* ── 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SmoothScroll />
          <ScrollProgress />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
