import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAttribution } from "@/lib/social/attribution";

/** Mémorise l'origine d'un visiteur arrivé par un lien suivi des réseaux sociaux (?src=fb&p=12). Ne rend rien. */
export default function AttributionCapture() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (search && !pathname.startsWith("/manage-xk92p")) captureAttribution(search, pathname);
  }, [pathname, search]);
  return null;
}
