// Planche de miniatures numérotées (4 par ligne) pour choisir l'ordre des photos en lisant UNE seule image.
// Usage : SHARP_DIR=<…/node_modules> node contact-sheet.cjs "<dossier photos>" <sortie.jpg>
// Affiche la liste « numéro → fichier » dans le même ordre que la planche.
const path = require("path");
const fs = require("fs");
const sharp = require(process.env.SHARP_DIR ? path.join(process.env.SHARP_DIR, "sharp") : "sharp");

const [dir, out] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const W = 400, H = 300, COLS = 4;
(async () => {
  const tiles = [];
  for (const [i, f] of files.entries()) {
    const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="44" height="34" fill="black"/><text x="8" y="25" font-size="22" font-family="Arial" fill="white">${i}</text></svg>`);
    const img = await sharp(path.join(dir, f)).rotate().resize(W, H, { fit: "cover" }).composite([{ input: label }]).toBuffer();
    tiles.push({ input: img, left: (i % COLS) * W, top: Math.floor(i / COLS) * H });
  }
  const rows = Math.ceil(files.length / COLS);
  await sharp({ create: { width: COLS * W, height: rows * H, channels: 3, background: "#fff" } }).composite(tiles).jpeg({ quality: 70 }).toFile(out);
  files.forEach((f, i) => console.log(i, f));
})();
