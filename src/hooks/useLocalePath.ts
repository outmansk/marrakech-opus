import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { langFromPath, localizePath, type Lang } from "@/i18n/routing";

/** Current URL language and a helper that prefixes internal links with it. */
export function useLocalePath() {
  const { pathname } = useLocation();
  const lang: Lang = langFromPath(pathname);
  const lp = useCallback((path: string) => localizePath(path, lang), [lang]);
  return { lang, lp };
}
