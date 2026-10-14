import { supabase } from "@/lib/supabase";
import { RESEAUX } from "./model";

// Origine d'un visiteur arrivé par un lien suivi (?src=fb&g=3&p=12) :
// - le clic est enregistré une fois par session (fonction track_social_click, sans donnée personnelle) ;
// - la référence courte « FB-12 » est gardée 30 jours dans ce navigateur ;
// - les formulaires du site l'envoient avec la demande, et le bouton WhatsApp l'ajoute au message.
// Tout échoue en silence : sans le SQL de la section, le site fonctionne comme avant.

const KEY = "lim_origin";
const TTL = 30 * 24 * 3600 * 1000;
const PREFIX_BY_SRC = Object.fromEntries(Object.values(RESEAUX).map((r) => [r.src, r.prefix]));

type Stored = { ref: string; at: number };

const safe = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

/** Lit les paramètres d'un lien suivi et mémorise l'origine. À appeler côté navigateur uniquement. */
export function captureAttribution(search: string, pathname: string) {
  const params = new URLSearchParams(search);
  const code = Number(params.get("p"));
  const prefix = PREFIX_BY_SRC[(params.get("src") ?? "").toLowerCase()];
  if (!prefix || !Number.isInteger(code) || code <= 0) return;
  const ref = `${prefix}-${code}`;
  safe(() => localStorage.setItem(KEY, JSON.stringify({ ref, at: Date.now() } satisfies Stored)), undefined);
  const seenKey = `${KEY}_clic_${code}`;
  if (safe(() => sessionStorage.getItem(seenKey), null)) return;
  safe(() => sessionStorage.setItem(seenKey, "1"), undefined);
  void supabase.rpc("track_social_click", { p_code: code, p_path: pathname.slice(0, 300) }).then(() => undefined, () => undefined);
}

/** Référence d'origine encore valable (moins de 30 jours), ou null. */
export function originRef(): string | null {
  const stored = safe(() => JSON.parse(localStorage.getItem(KEY) ?? "null") as Stored | null, null);
  if (!stored || typeof stored.ref !== "string" || !/^[A-Z]{2}-\d{1,9}$/.test(stored.ref)) return null;
  return Date.now() - stored.at < TTL ? stored.ref : null;
}

const missingColumn = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "PGRST204" || error.code === "42703" || /origine_ref/.test(error.message ?? ""));

/**
 * Insère une demande du site avec sa référence d'origine quand il y en a une.
 * Si la colonne n'existe pas encore (SQL non lancé), réessaie sans elle.
 */
export async function insertWithOrigin(table: "contact_messages" | "visit_requests" | "client_leads", payload: Record<string, unknown>) {
  const ref = originRef();
  const insert = (body: Record<string, unknown>) => supabase.from(table).insert(body as never);
  if (!ref) return insert(payload);
  const result = await insert({ ...payload, origine_ref: ref });
  return missingColumn(result.error) ? insert(payload) : result;
}
