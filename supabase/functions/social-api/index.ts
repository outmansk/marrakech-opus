// API de la section Réseaux sociaux, pour un outil externe qui publie à votre place.
// Elle enregistre une publication et met à jour son statut. Elle ne publie rien sur les réseaux
// et ne stocke aucun identifiant de compte.
//
// Déploiement (une fois) : Supabase → Edge Functions → « social-api », puis dans Secrets :
//   SOCIAL_API_KEY = une longue clé aléatoire (la même que celle de l'outil externe)
// Appel : POST https://<projet>.supabase.co/functions/v1/social-api
//   en-tête  x-api-key: <SOCIAL_API_KEY>
//   corps    { "action": "create", "bien_id": "…" | "bien_hors_site": "…", "groupe_lien": "https://facebook.com/groups/…",
//              "groupe_nom": "…", "reseau": "facebook", "langue": "fr", "texte_debut": "…", "nb_photos": 8,
//              "lien": "…", "statut": "en-attente", "publie_le": "2026-10-14T10:00:00Z" }
//            { "action": "status", "code": 12, "statut": "en-ligne" }
// Réponse : { "ok": true, "code": 12, "ref": "FB-12", "id": "…" }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const RESEAUX = ["facebook", "instagram", "marketplace", "whatsapp", "tiktok", "linkedin", "autre"];
const PREFIX: Record<string, string> = { facebook: "FB", instagram: "IG", marketplace: "MP", whatsapp: "WA", tiktok: "TT", linkedin: "LI", autre: "XX" };
const STATUTS = ["en-attente", "en-ligne", "refusee", "supprimee", "expiree"];
const LANGUES = ["fr", "en", "fr-en", "autre"];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** Comparaison à temps constant de la clé. */
function sameKey(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "Méthode non autorisée" }, 405);
  const expected = Deno.env.get("SOCIAL_API_KEY") ?? "";
  if (!sameKey(req.headers.get("x-api-key") ?? "", expected)) return json({ ok: false, error: "Clé invalide" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok: false, error: "Corps JSON invalide" }, 400); }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  if (body.action === "status") {
    const statut = String(body.statut ?? "");
    if (!STATUTS.includes(statut)) return json({ ok: false, error: "Statut inconnu" }, 400);
    const query = db.from("social_publications").update({ statut });
    const { data, error } = await (typeof body.code === "number" ? query.eq("code", body.code) : query.eq("id", String(body.id ?? ""))).select("id, code, reseau").maybeSingle();
    if (error) return json({ ok: false, error: error.message }, 400);
    if (!data) return json({ ok: false, error: "Publication introuvable" }, 404);
    return json({ ok: true, id: data.id, code: data.code, ref: `${PREFIX[data.reseau]}-${data.code}` });
  }

  if (body.action !== "create") return json({ ok: false, error: "Action inconnue (create ou status)" }, 400);

  const reseau = RESEAUX.includes(String(body.reseau)) ? String(body.reseau) : "facebook";
  const bien_id = text(body.bien_id, 36);
  const bien_hors_site = text(body.bien_hors_site, 200);
  if (!bien_id && !bien_hors_site) return json({ ok: false, error: "bien_id ou bien_hors_site obligatoire" }, 400);

  // Groupe : par identifiant, sinon retrouvé (ou créé) à partir de son lien.
  let groupe_id = text(body.groupe_id, 36);
  const groupeLien = text(body.groupe_lien, 500);
  if (!groupe_id && groupeLien) {
    const { data: found } = await db.from("social_groups").select("id").ilike("lien", groupeLien).maybeSingle();
    if (found) groupe_id = found.id;
    else {
      const { data: created, error } = await db.from("social_groups")
        .insert({ nom: text(body.groupe_nom, 200) ?? groupeLien, lien: groupeLien, reseau, langue: LANGUES.includes(String(body.langue)) ? String(body.langue) : "fr" })
        .select("id").single();
      if (error) return json({ ok: false, error: error.message }, 400);
      groupe_id = created.id;
    }
  }

  const { data, error } = await db.from("social_publications").insert({
    bien_id, bien_hors_site, groupe_id, reseau,
    publie_le: text(body.publie_le, 40) ?? new Date().toISOString(),
    langue: LANGUES.includes(String(body.langue)) ? String(body.langue) : "fr",
    texte_debut: text(body.texte_debut, 1000),
    nb_photos: typeof body.nb_photos === "number" ? Math.max(0, Math.min(100, Math.round(body.nb_photos))) : null,
    lien: text(body.lien, 500),
    publie_par: ["moi", "claude", "autre"].includes(String(body.publie_par)) ? String(body.publie_par) : "claude",
    statut: STATUTS.includes(String(body.statut)) ? String(body.statut) : "en-attente",
    remarque: text(body.remarque, 2000),
    origine: "api",
  }).select("id, code").single();
  if (error) return json({ ok: false, error: error.message }, 400);
  return json({ ok: true, id: data.id, code: data.code, ref: `${PREFIX[reseau]}-${data.code}` });
});
