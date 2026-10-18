// Envoie les photos d'un bien sur Cloudinary (même preset non signé que l'admin, dossier "properties")
// et affiche les identifiants à mettre dans photos / photo_principale.
// Usage : node upload-photos.mjs "<photo 1>" "<photo 2>" ...   (la 1re = photo principale)
// Lit VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans le .env du projet.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter(Boolean).map((m) => [m[1], m[2]]),
);
const cloud = env.VITE_CLOUDINARY_CLOUD_NAME;
const preset = env.VITE_CLOUDINARY_UPLOAD_PRESET;
if (!cloud || !preset) {
  console.error("VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET manquants dans .env");
  process.exit(1);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage : node upload-photos.mjs "<photo 1>" "<photo 2>" ...');
  process.exit(1);
}

const ids = [];
for (const file of files) {
  const buffer = fs.readFileSync(file);
  if (buffer.length > 10 * 1024 * 1024) console.warn(`Attention : ${path.basename(file)} dépasse 10 Mo, Cloudinary peut la refuser.`);
  const form = new FormData();
  form.append("file", new Blob([buffer]), path.basename(file));
  form.append("upload_preset", preset);
  form.append("folder", "properties");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) {
    console.error(`Échec pour ${path.basename(file)} : ${result.error?.message ?? response.status}`);
    process.exit(1);
  }
  console.log(`${path.basename(file)} → ${result.public_id} (${result.width}x${result.height})`);
  ids.push(result.public_id);
}
console.log(JSON.stringify({ photos: ids, photo_principale: ids[0] }, null, 2));
