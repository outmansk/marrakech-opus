import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useLocalePath } from "@/hooks/useLocalePath";
import { stripLang } from "@/i18n/routing";
import { AGENCY } from "@/content/agency";
import { whatsappHref } from "@/lib/contact";

const MESSAGE = {
  fr: "Bonjour, je vous contacte depuis votre site Live In Marrakech.",
  en: "Hello, I am contacting you from the Live In Marrakech website.",
  es: "Hola, les escribo desde la web de Live In Marrakech.",
};
const LABEL = { fr: "Écrire sur WhatsApp", en: "Message us on WhatsApp", es: "Escribir por WhatsApp" };

/** Pages that already have their own contact bar or a form with bottom buttons. */
const HIDDEN_ON = [/^\/bien\//, /^\/demande$/];

/**
 * Round WhatsApp button, phones and tablets only, on every public page except those above.
 * Hidden in the pre-rendered HTML and on load (identical server and client render), shown once
 * the visitor has scrolled a little so it never covers the hero search.
 */
export default function FloatingWhatsApp() {
  const { pathname } = useLocation();
  const { lang } = useLocalePath();
  const [shown, setShown] = useState(false);
  const hidden = HIDDEN_ON.some((re) => re.test(stripLang(pathname)));

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden, pathname]);

  if (hidden) return null;
  return (
    <a
      href={whatsappHref(AGENCY.phone, MESSAGE[lang])}
      target="_blank"
      rel="noreferrer"
      aria-label={LABEL[lang]}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-300 lg:hidden ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <MessageCircle size={26} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}
