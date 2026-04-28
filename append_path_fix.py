import json

nb_path = r'C:\Users\outman\Desktop\AI S4\projet vesion emotion\Emotion_Recognition_from_Faces.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        new_source = []
        for line in source:
            if "csv_file = r\"C:\\Users\\outman\\Desktop\\AI S4\\projet vesion emotion\\fer2013.csv\"" in line:
                new_source.append("        csv_file = r\"C:\\Users\\outman\\Desktop\\AI S4\\projet_vesion_emotion\\fer2013.csv\"\n")
            else:
                new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Appended path fix successfully.")
