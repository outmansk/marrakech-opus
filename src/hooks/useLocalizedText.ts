import { useTranslation } from "react-i18next";

/**
 * Returns a helper function that picks the correct translation
 * from inline (fr, en, es) literals.
 *
 * Usage:
 *   const tL = useLocalizedText();
 *   tL("Bonjour", "Hello", "Hola")
 */
export function useLocalizedText() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) ?? "fr";

  return (fr: string, en: string, es: string): string =>
    lang === "en" ? en : lang === "es" ? es : fr;
}
