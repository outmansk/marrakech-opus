import json

nb_path = r'c:\Users\outman\Downloads\Emotion_Recognition_from_Faces.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        new_source = []
        for line in source:
            if "X = X.astype('float32') / 255.0" in line:
                new_source.append(line)
                new_source.append("    # Ajouter une dimension pour les canaux (Requis par Keras/TensorFlow)\n")
                new_source.append("    X = np.expand_dims(X, axis=-1)\n")
            else:
                new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Appended shape fix successfully.")
