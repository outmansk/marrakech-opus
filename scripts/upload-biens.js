import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your Cloudinary credentials if needed
const CLOUD_NAME = "dorxkrf4i";
const UPLOAD_PRESET = "live in marrakech";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const BIENS_DIR = path.join(__dirname, '..', 'BIENS');
const DATA_FILE = path.join(__dirname, 'biens_data.json');
const OUTPUT_SQL = path.join(__dirname, '..', 'supabase', 'migrations', `${Date.now()}_seed_biens.sql`);

async function uploadImage(filePath) {
  try {
    const fileData = await fs.readFile(filePath);
    const blob = new Blob([fileData]);
    const formData = new FormData();
    formData.append('file', blob, path.basename(filePath));
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'properties');

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Erreur upload ${filePath}:`, err);
      return null;
    }

    const data = await res.json();
    return data.public_id; // Store public_id as required by your app
  } catch (err) {
    console.error(`Erreur locale upload ${filePath}:`, err);
    return null;
  }
}

async function main() {
  console.log("Lecture des métadonnées (biens_data.json)...");
  const dataRaw = await fs.readFile(DATA_FILE, 'utf-8');
  const biensData = JSON.parse(dataRaw);
  
  let sqlStatements = `-- Migration Auto-générée : Import massif des biens\n\n`;

  for (const bien of biensData) {
    console.log(`\nTraitement du bien : ${bien.titre} (${bien.folder_name})`);
    const dirPath = path.join(BIENS_DIR, bien.folder_name);
    
    let files = [];
    try {
      files = await fs.readdir(dirPath);
    } catch (e) {
      console.log(`⚠️ Dossier introuvable ou vide : ${dirPath}`);
      continue;
    }

    // Garder seulement les images et prendre les 12 premières
    const imageFiles = files.filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f)).slice(0, 12);
    
    if (imageFiles.length === 0) {
      console.log(`⚠️ Aucune image trouvée pour ${bien.folder_name}.`);
      continue;
    }

    const publicIds = [];
    for (const img of imageFiles) {
      const fullPath = path.join(dirPath, img);
      console.log(`  Upload de : ${img}...`);
      const publicId = await uploadImage(fullPath);
      if (publicId) {
        publicIds.push(publicId);
      }
    }

    if (publicIds.length === 0) {
      console.log(`⚠️ Échec total de l'upload pour ${bien.folder_name}. Ignoré.`);
      continue;
    }

    const photoPrincipale = publicIds[0];
    const photosArraySql = `ARRAY[${publicIds.map(id => `'${id}'`).join(', ')}]`;
    
    // Échapper les quotes pour SQL
    const escapeSql = (str) => str.replace(/'/g, "''");

    const sql = `
INSERT INTO properties_v2 (
  titre, type, service, services, prix, chambres, description_courte, description_longue, statut, photos, photo_principale
) VALUES (
  '${escapeSql(bien.titre)}',
  '${bien.type}',
  '${bien.service}',
  ARRAY['${bien.service}'],
  ${bien.prix > 0 ? bien.prix : 'NULL'},
  ${bien.chambres},
  '${escapeSql(bien.description_courte)}',
  '${escapeSql(bien.description_longue)}',
  'publie',
  ${photosArraySql},
  '${photoPrincipale}'
);
`;
    sqlStatements += sql;
    console.log(`✅ ${bien.titre} prêt.`);
  }

  await fs.writeFile(OUTPUT_SQL, sqlStatements, 'utf-8');
  console.log(`\n🎉 Terminé ! Le fichier SQL a été généré dans : ${OUTPUT_SQL}`);
}

main().catch(console.error);
