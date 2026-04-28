import json

nb_path = r'c:\Users\outman\Downloads\Emotion_Recognition_from_Faces.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Markdown cell
md_cell = {
 "cell_type": "markdown",
 "metadata": {},
 "source": [
  "## Étape 16: Prédiction en Temps Réel avec la Webcam (Soutenance)\n",
  "Ce bloc permet d'utiliser la webcam pour détecter les émotions en temps réel, parfait pour une démonstration."
 ]
}

# Code cell
code_cell = {
 "cell_type": "code",
 "execution_count": None,
 "metadata": {},
 "outputs": [],
 "source": [
  "import cv2\n",
  "import numpy as np\n",
  "\n",
  "def detect_emotion_webcam():\n",
  "    \"\"\"\n",
  "    Ouvre la webcam, detecte le visage et predit l'emotion en temps reel.\n",
  "    Appuyez sur 'q' pour quitter la webcam.\n",
  "    \"\"\"\n",
  "    print(\"📸 Démarrage de la webcam. Appuyez sur 'q' pour quitter...\")\n",
  "    cap = cv2.VideoCapture(0)\n",
  "    \n",
  "    # Charger le classifieur de visage Haar Cascade d'OpenCV\n",
  "    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')\n",
  "    \n",
  "    while True:\n",
  "        ret, frame = cap.read()\n",
  "        if not ret:\n",
  "            print(\"❌ Impossible d'accéder à la webcam.\")\n",
  "            break\n",
  "            \n",
  "        # Convertir en niveaux de gris pour la detection de visage et le modele\n",
  "        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n",
  "        \n",
  "        # Detecter les visages\n",
  "        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)\n",
  "        \n",
  "        for (x, y, w, h) in faces:\n",
  "            # Extraire la region d'interet (ROI) du visage\n",
  "            roi_gray = gray[y:y+h, x:x+w]\n",
  "            \n",
  "            # Redimensionner a 48x48 pour le modele\n",
  "            roi_gray = cv2.resize(roi_gray, (48, 48))\n",
  "            roi_gray = roi_gray.astype('float32') / 255.0\n",
  "            roi_gray = np.expand_dims(roi_gray, axis=0)\n",
  "            roi_gray = np.expand_dims(roi_gray, axis=-1)\n",
  "            \n",
  "            # Predire l'emotion\n",
  "            prediction = loaded_model.predict(roi_gray, verbose=0)\n",
  "            max_index = int(np.argmax(prediction))\n",
  "            predicted_emotion = EMOTIONS[max_index]\n",
  "            confidence = prediction[0][max_index]\n",
  "            \n",
  "            # Dessiner le rectangle autour du visage\n",
  "            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)\n",
  "            \n",
  "            # Afficher l'emotion et la confiance au-dessus du rectangle\n",
  "            text = f\"{predicted_emotion} ({confidence:.2%})\"\n",
  "            cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)\n",
  "            \n",
  "        # Afficher la video\n",
  "        cv2.imshow('Emotion Recognition - Appuyez sur Q pour quitter', frame)\n",
  "        \n",
  "        # Quitter avec la touche 'q'\n",
  "        if cv2.waitKey(1) & 0xFF == ord('q'):\n",
  "            break\n",
  "            \n",
  "    # Liberer la capture et fermer les fenetres\n",
  "    cap.release()\n",
  "    cv2.destroyAllWindows()\n",
  "    print(\"✅ Webcam fermée.\")\n",
  "\n",
  "# Décommentez la ligne ci-dessous pour lancer la détection via webcam\n",
  "# detect_emotion_webcam()\n"
 ]
}

nb['cells'].append(md_cell)
nb['cells'].append(code_cell)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Appended webcam cell successfully.")
