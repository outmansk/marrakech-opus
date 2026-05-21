import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";

// Animation infrastructure
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import { SplashGuard } from "@/components/SplashScreen";

// Public pages
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBiens from "./pages/admin/AdminBiens";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminVisites from "./pages/admin/AdminVisites";
import MigrateCloudinary from "./pages/admin/MigrateCloudinary";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

/** Animated route wrapper that provides AnimatePresence with location key */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/" element={<Index />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/bien/:id" element={<PropertyDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

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
          <Route path="migration" element={<MigrateCloudinary />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SplashGuard>
            <SmoothScroll />
            <ScrollProgress />
            <AnimatedRoutes />
          </SplashGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
