// Convertit les photos d'un bien en WebP 1200 px pour public/biens/<slug>/.
// Usage : node convert-photos.cjs <slug> "<source>=<nom>" ["<source>=<nom>" ...]
// La première paire devient la photo principale (l'ordre est affiché à la fin).
// sharp n'est pas une dépendance du projet : SHARP_DIR = dossier node_modules qui le contient.
const path = require("path");
const fs = require("fs");

const sharpDir = process.env.SHARP_DIR;
const sharp = require(sharpDir ? path.join(sharpDir, "sharp") : "sharp");

const [slug, ...pairs] = process.argv.slice(2);
if (!slug || !pairs.length) {
  console.error('Usage : node convert-photos.cjs <slug> "<source>=<nom>" ...');
  process.exit(1);
}
const out = path.resolve(__dirname, "../../../public/biens", slug);
fs.mkdirSync(out, { recursive: true });

(async () => {
  const urls = [];
  for (const pair of pairs) {
    const at = pair.lastIndexOf("=");
    const src = pair.slice(0, at);
    const name = pair.slice(at + 1);
    const info = await sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(out, `${name}.webp`));
    console.log(`${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} Ko`);
    urls.push(`/biens/${slug}/${name}.webp`);
  }
  console.log(JSON.stringify({ photos: urls, photo_principale: urls[0] }, null, 2));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
