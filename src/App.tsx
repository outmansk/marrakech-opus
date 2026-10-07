import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";
import AppProviders from "./AppProviders";
import AppRoutes, { type PublicPages } from "./AppRoutes";

const pages: PublicPages = {
  Index: lazy(() => import("./pages/Index")),
  Catalogue: lazy(() => import("./pages/Catalogue")),
  PropertyDetail: lazy(() => import("./pages/PropertyDetail")),
  Blog: lazy(() => import("./pages/Blog")),
  BlogPost: lazy(() => import("./pages/BlogPost")),
  Contact: lazy(() => import("./pages/Contact")),
  PropertyRequest: lazy(() => import("./pages/PropertyRequest")),
  ServiceLanding: lazy(() => import("./pages/ServiceLanding")),
  NotFound: lazy(() => import("./pages/NotFound")),
};

const App = ({ queryClient }: { queryClient: QueryClient }) => (
  <AppProviders queryClient={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes pages={pages} />
    </BrowserRouter>
  </AppProviders>
);

export default App;
