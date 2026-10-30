// Génère le SQL d'insertion d'un ou plusieurs biens dans properties_v2 (à coller dans Supabase → SQL Editor).
// Usage : node make-sql.mjs <bien.json | biens.json> [sortie.sql]
// Le JSON = un objet bien (mêmes champs que src/content/fileProperties.json) ou un tableau d'objets.
// Champs de traduction facultatifs : titre_en, titre_es, description_courte_en/_es, description_longue_en/_es.
// Ré-exécutable : ON CONFLICT (id) met le bien à jour au lieu de le dupliquer.
import fs from "node:fs";
import crypto from "node:crypto";

const [input, output] = process.argv.slice(2);
if (!input) {
  console.error("Usage : node make-sql.mjs <bien.json> [sortie.sql]");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(input, "utf8"));
const biens = Array.isArray(data) ? data : data.properties ?? [data];

// Texte entre $q$…$q$ : aucune apostrophe à échapper.
const text = (v) => (v === null || v === undefined || v === "" ? "NULL" : `$q$${String(v)}$q$`);
const num = (v) => (v === null || v === undefined || v === "" ? "NULL" : String(Number(v)));
const bool = (v) => (v === true ? "true" : v === false ? "false" : "NULL");
const arr = (v) => (Array.isArray(v) && v.length ? `ARRAY[${v.map(text).join(", ")}]::text[]` : "'{}'::text[]");
const json = (v) => `${text(JSON.stringify(v ?? []))}::jsonb`;

const COLUMNS = [
  ["id", (b) => `'${b.id ?? crypto.randomUUID()}'`],
  ["titre", (b) => text(b.titre)],
  ["type", (b) => text(b.type)],
  ["service", (b) => text(b.service ?? b.services?.[0])],
  ["services", (b) => arr(b.services)],
  ["prix_vente", (b) => num(b.prix_vente)],
  ["prix_location_longue", (b) => num(b.prix_location_longue)],
  ["prix_location_courte", (b) => num(b.prix_location_courte)],
  ["prix", (b) => num(b.prix)], // loyer de sous-location (champ « prix » de l'admin)
  ["devise", (b) => text(b.devise ?? "MAD")],
  ["surface_habitable", (b) => num(b.surface_habitable)],
  ["surface_terrain", (b) => num(b.surface_terrain)],
  ["chambres", (b) => num(b.chambres)],
  ["salles_de_bain", (b) => num(b.salles_de_bain)],
  ["quartier", (b) => text(b.quartier)],
  ["meuble", (b) => bool(b.meuble)],
  ["description_courte", (b) => text(b.description_courte)],
  ["description_longue", (b) => text(b.description_longue)],
  ["titre_en", (b) => text(b.titre_en)],
  ["titre_es", (b) => text(b.titre_es)],
  ["description_courte_en", (b) => text(b.description_courte_en)],
  ["description_courte_es", (b) => text(b.description_courte_es)],
  ["description_longue_en", (b) => text(b.description_longue_en)],
  ["description_longue_es", (b) => text(b.description_longue_es)],
  ["traduction_a_relire", () => "false"],
  ["equipements", (b) => arr(b.equipements)],
  ["proximites", (b) => json(b.proximites)],
  ["photos", (b) => arr(b.photos)],
  ["photo_principale", (b) => text(b.photo_principale ?? b.photos?.[0])],
  ["statut", (b) => text(b.statut ?? "publie")],
  ["disponible_le", (b) => text(b.disponible_le)],
  ["reference", (b) => text(b.reference)],
  ["created_at", (b) => (b.created_at ? text(b.created_at) : "now()")],
];

const names = COLUMNS.map(([name]) => name);
const updates = names.filter((n) => n !== "id" && n !== "created_at").map((n) => `${n} = EXCLUDED.${n}`).join(",\n    ");

const parts = [
  "-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.",
  "-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).",
  `ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;`,
];
for (const b of biens) {
  parts.push(`-- ${b.titre} (${b.reference ?? "sans référence"})
INSERT INTO public.properties_v2 (${names.join(", ")})
VALUES (${COLUMNS.map(([, f]) => f(b)).join(", ")})
ON CONFLICT (id) DO UPDATE SET
    ${updates};`);
}
parts.push("NOTIFY pgrst, 'reload schema';");
const sql = parts.join("\n\n") + "\n";

if (output) {
  fs.writeFileSync(output, sql);
  console.log(`${biens.length} bien(s) → ${output}`);
} else {
  process.stdout.write(sql);
}
