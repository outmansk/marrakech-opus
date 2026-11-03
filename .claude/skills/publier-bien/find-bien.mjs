// Retrouve une annonce par son nom (titre, slug ou référence) et montre ce qui la concerne, en lecture seule.
// Usage : node find-bien.mjs "<nom>"                → liste les annonces trouvées
//         node find-bien.mjs "<nom>" --json <out>    → enregistre aussi la ligne complète (1 seule annonce trouvée)
// Lit VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY dans le .env du projet (ou du dépôt principal si on est dans un worktree).
// Signale les fichiers du site qui changent l'affichage sans passer par la base (overrides, traductions, titres, deals, mise en avant).
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const envFile = [root, path.resolve(execSync("git rev-parse --git-common-dir", { cwd: root }).toString().trim(), "..")]
  .map((dir) => path.join(path.isAbsolute(dir) ? dir : path.join(root, dir), ".env"))
  .find((file) => fs.existsSync(file));
if (!envFile) {
  console.error(".env introuvable (ni dans ce dossier ni dans le dépôt principal).");
  process.exit(1);
}
const env = Object.fromEntries(
  fs.readFileSync(envFile, "utf8").split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter(Boolean).map((m) => [m[1], m[2]]),
);

const [query, flag, out] = process.argv.slice(2);
if (!query) {
  console.error('Usage : node find-bien.mjs "<nom>" [--json <sortie.json>]');
  process.exit(1);
}
const term = query.trim().replace(/[*,()]/g, " ");
const filter = `or=(titre.ilike.*${term}*,slug.ilike.*${term.replace(/\s+/g, "-")}*,reference.ilike.*${term}*)`;
const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/properties_v2?${encodeURI(filter)}&select=*&order=updated_at.desc`, {
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` },
});
const rows = await res.json();
if (!res.ok) {
  console.error(rows);
  process.exit(1);
}
if (!rows.length) {
  console.log(`Aucune annonce publiée ou louée ne correspond à « ${query} » (les brouillons ne sont pas visibles avec la clé publique).`);
  process.exit(0);
}

const read = (name) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, "src/content", name), "utf8")); } catch { return {}; }
};
const files = {
  "propertyOverrides.json (corrige l'affichage tant que la base n'est pas plus récente)": read("propertyOverrides.json"),
  "propertyTranslations.json (textes EN/ES de secours)": read("propertyTranslations.json"),
  "propertyHeadlines.json (titre affiché)": read("propertyHeadlines.json"),
  "propertyDeals.json (profil « Déjà loué »)": read("propertyDeals.json"),
  "propertyFacts.json (zone, caution)": read("propertyFacts.json"),
};
const featured = read("propertyFeatured.json").ids ?? [];
const price = (r) => r.prix_vente ?? r.prix_location_longue ?? r.prix_location_courte ?? r.prix;

for (const r of rows) {
  console.log(`\n${r.titre}\n  id ${r.id} · /bien/${r.slug ?? "(sans slug)"} · réf. ${r.reference ?? "-"}`);
  console.log(`  ${r.statut} · ${(r.services ?? [r.service]).join(", ")} · ${price(r) ?? "prix ?"} ${r.devise ?? ""} · ${r.chambres ?? "?"} ch. / ${r.salles_de_bain ?? "?"} sdb · meublé ${r.meuble ?? "?"} · ${r.photos?.length ?? 0} photos`);
  console.log(`  modifiée le ${r.updated_at} · traductions en base : ${r.description_longue_en ? "EN" : "-"} ${r.description_longue_es ? "ES" : "-"}`);
  const amounts = [...new Set(`${r.description_courte ?? ""} ${r.description_longue ?? ""}`.match(/\d{1,3}(?:[  .,]\d{3})+/g) ?? [])];
  if (amounts.length) console.log(`  montants écrits dans le texte FR : ${amounts.join(" | ")}`);
  for (const [label, data] of Object.entries(files)) if (data[r.id]) console.log(`  ⚠ présent dans ${label}`);
  if (featured.includes(r.id)) console.log(`  ⚠ mis en avant (propertyFeatured.json, position ${featured.indexOf(r.id) + 1})`);
}

if (flag === "--json" && out) {
  if (rows.length !== 1) {
    console.error(`\n${rows.length} annonces trouvées : préciser le nom pour en avoir une seule.`);
    process.exit(1);
  }
  fs.writeFileSync(out, JSON.stringify(rows[0], null, 2));
  console.log(`\nLigne complète → ${out}`);
}
