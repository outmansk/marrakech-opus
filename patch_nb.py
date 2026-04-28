import json
import os

nb_path = r'c:\Users\outman\Downloads\Emotion_Recognition_from_Faces.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        new_source = []
        for line in source:
            if 'csv_file = "fer2013.csv"' in line:
                new_source.append(line)
                new_source.append('    # On cherche le fichier dans le dossier courant, sinon on indique le chemin absolu\n')
                new_source.append('    if not os.path.exists(csv_file):\n')
                new_source.append('        csv_file = r"C:\\Users\\outman\\Desktop\\AI S4\\projet vesion emotion\\fer2013.csv"\n')
            elif "np.fromstring(row['pixels']" in line or 'np.fromstring(row["pixels"]' in line:
                new_source.append("        # Remplacement de np.fromstring par np.array avec split() pour eviter les erreurs\n")
                new_source.append("        pixels = np.array(str(row['pixels']).split(), dtype=np.uint8)\n")
            else:
                new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print("Patch applied successfully")
