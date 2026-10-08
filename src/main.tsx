import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { hydrate, type DehydratedState } from "@tanstack/react-query";
import App from "./App.tsx";
import { createQueryClient } from "./lib/queryClient";
import "./index.css";
import "./i18n/index.ts";

declare global {
  interface Window {
    __RQ_STATE__?: DehydratedState;
  }
}

const queryClient = createQueryClient();
// Data fetched at build time by the pre-render (scripts/prerender.mjs), so the first render matches the HTML.
if (window.__RQ_STATE__) hydrate(queryClient, window.__RQ_STATE__);

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App queryClient={queryClient} />
  </StrictMode>
);

// Pre-rendered pages already contain the markup: attach to it instead of re-rendering.
// The 404 page (data-client-render) is served for any language, so it is rendered afresh.
if (container.hasChildNodes() && !("clientRender" in container.dataset)) hydrateRoot(container, app);
else createRoot(container).render(app);
