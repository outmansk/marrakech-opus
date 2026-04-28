import json

nb_path = r'C:\Users\outman\Desktop\AI S4\projet vesion emotion\Emotion_Recognition_from_Faces.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        new_source = []
        for line in source:
            if line == "    # Ajouter une dimension pour les canaux (Requis par Keras/TensorFlow)\n":
                new_source.append("# Ajouter une dimension pour les canaux (Requis par Keras/TensorFlow)\n")
            elif line == "    X = np.expand_dims(X, axis=-1)\n":
                new_source.append("X = np.expand_dims(X, axis=-1)\n")
            else:
                new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Fixed indentation error successfully.")
