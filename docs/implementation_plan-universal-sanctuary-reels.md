# Plan d'Implémentation — Expérience Ultime Hidaya : En-tête X/Reels, Carte Universelle Épurée & Audio GitHub 100% Fiable

Ce document synthétise les retours d'expérience et définit la feuille de route d'implémentation pour transformer Hidaya en une application fluide, intuitive et épurée, inspirée de l'expérience de recherche et de consultation de **X (Twitter)** et **Instagram Reels**.

---

## 1. Diagnostic des Problèmes & Retours Utilisateur

| Problème Actuel | Diagnostic Technique | Solution Ciblée |
| :--- | :--- | :--- |
| **Multiplicité des formats de carte** | Quand l'utilisateur clique sur un numéro d'Ayah, il est redirigé vers `QuranReaderPage` qui possède une mise en page différente de `VerseCard`. | **Une seule et unique Carte Universelle (`VerseCard`)** dans toute l'application. Cliquer sur un numéro charge la sourate dans ce même composant centré sur le verset. |
| **Liste verticale infinie de versets** | Les résultats de recherche empilent 3 à 5 cartes verticalement les unes sous les autres. | **Un seul verset à la fois à l'écran**. Navigation fluide par glissement horizontal (Swipe Gauche ↔ Droite) façon Reels/X. |
| **Surcharge du lecteur audio sur la carte** | `AudioPlayer` affiche un boîtier complet avec barre de défilement temporelle, minutes/secondes et contrôles encombrants. | **Suppression de la timeline et des réglages sur la carte**. Le highlight mot-à-mot fait déjà office de repère temporel visuel. Un seul bouton Play/Pause global dans l'en-tête (ou discret sur la carte). |
| **Paramètres dispersés sur la carte** | Choix du récitateur, du savant de tafsir, et des étapes audio encore visibles ou modifiables sur la carte. | **Tous les réglages sont centralisés dans Préférences**. La carte n'affiche que le résultat configuré. |
| **Audio qui bascule sur la voix du navigateur (Browser)** | Si `/api/ayah-audio/metadata` échoue ou que Supabase est inaccessible en local, le player bascule sur `SpeechService` qui appelle `window.speechSynthesis`. | **Garantir le flux direct GitHub Releases** avec table de résolution locale / fallback déterministe, et **interdire le fallback de voix robotique du navigateur**. |
| **Doublon Méditation vs Commentaires** | La carte affiche un bloc "Méditation" (bloc de texte souvent vide) en plus du bouton "Commentaires". | **Suppression complète du bloc Méditation**. Tout passe désormais par le fil unifié de Commentaires / Réflexions (`💬`). |
| **Sélection du savant de Tafsir sur la carte** | La carte propose une barre avec plusieurs savants. | **Afficher directement le savant choisi dans les Préférences** (`preferredScholar`), sans sélecteur encombrant. |
| **Barre de recherche isolée** | La barre de recherche occupe un grand bloc statique au milieu de la page. | **Intégration de la barre de recherche directement dans l'en-tête (`Header`)**, avec tiroir de suggestions déroulant (façon X / Instagram). |

---

## 2. Nouvelle Architecture Visuelle & UX

### A. L'En-tête Actif (Sticky Header façon X / Instagram)

L'en-tête réunit désormais en une seule ligne horizontale compacte :
1. **Marque Hidaya** (Logo + nom) : Clic = retour au flux principal / réinitialisation.
2. **Barre de Recherche Intégrée** :
   - Champ de saisie direct au centre de l'en-tête (`Rechercher un thème, une émotion, un verset...`).
   - Clic / Focus : ouvre un **overlay de suggestions** fluide sous la barre :
     - 🌟 **Today's Focus** : Le verset ou thème du jour (ancrage spirituel immédiat).
     - 🏷️ **Mots-clés & Thèmes rapides** : *Patience, Gratitude, Épreuve, Parents, Colère, Espoir, Prière, Paix...*
     - 📜 **Dernières recherches & Sourates suggérées**.
   - Dès la sélection d'un thème ou la validation de la recherche : les versets correspondants s'affichent un par un dans le carrousel plein écran.
3. **Bouton Global Play / Pause** (`▶` / `⏸`) :
   - Permet de lancer ou de suspendre instantanément la lecture continue et automatique du verset en cours.
4. **Bouton Préférences** (`⚙️`) :
   - Ouvre le panneau structuré en 5 sections (Langue, Récitateur, Savant Tafsir, Mode TV, etc.).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [📖 Hidaya]   [🔍 Rechercher un thème, verset, émotion...  🎙️]  [▶ Play] [⚙️] │
└──────────────────────────────────────────────────────────────────────────────┘
                     │ (au focus de la barre de recherche)
                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  🌟 TODAY'S FOCUS : Surah Al-Inshirah 94:5-6 — « Avec la difficulté, la facilité »│
│  ──────────────────────────────────────────────────────────────────────────  │
│  🏷️ THÈMES DU MOMENT :                                                       │
│  [🌿 Apaisement du cœur]  [🤲 Confiance en Dieu]  [👨‍👩‍👧 Liens familiaux]     │
│  [⏳ Patience dans l'épreuve]  [🤍 Gratitude]  [🛡️ Gestion de l'angoisse]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### B. Le Sanctuaire Unifié : Une Seule Carte Universelle en Plein Écran (Façon Reels)

Plutôt que d'afficher une suite de cartes scrollables à l'infini :
- **Un seul verset est affiché à la fois**.
- **Navigation tactile fluide** :
  - `Swipe Gauche ↔ Droite` (ou flèches latérales) : Passage instantané au verset suivant ou précédent.
  - Indicateur discret : `Verset 1 / 4` (avec barre de progression segmentée façon Stories/Reels en haut de la carte).
- **Structure ultra-épurée de la carte** :
  1. **En-tête de la carte** :
     - Cercle Ayah (`۝`) avec le numéro du verset (cliquable pour explorer toute la sourate dans ce même format).
     - Nom de la Sourate et référence (`2:255`).
     - Actions sociales minimalistes : `♥` (Favori), `💬` (Commentaires), `🎬` (Studio), `↗` (Partager).
  2. **Niveau 1 — Texte Arabe Uthmani** :
     - Typographie noble calligraphiée avec **mise en évidence mot-à-mot en temps réel** (`highlight`).
  3. **Niveau 2 — Traduction Humaine Certifiée** :
     - Texte de la traduction dans la langue active, avec suivi mot-à-mot synchronisé pendant la lecture audio.
     - Mention discrète de la source (`Hamidullah`, `Sahih International`, `Bernström`).
  4. **Niveau 3 — Tafsir Classique** :
     - Si activé dans les Préférences : affiche **directement le savant sélectionné** (`Ibn Kathir`, `Al-Sa'di`, etc.), sans sélecteur multiple encombrant sur la carte.
  5. **Fil de Commentaires & Réflexions (`💬`)** :
     - Remplace l'ancien notepad Niveau 4. Permet d'ajouter une note personnelle avec humeur associée (`Calm`, `Grateful`, `Hopeful`...), sauvegardée localement.

---

### C. Résolution Définitive de l'Audio GitHub (Éradication du Browser Speech)

#### 1. Pourquoi le problème survenait ?
- Le pipeline audio vérifiait `/api/ayah-audio/metadata` via Supabase.
- En cas de délai, de non-configuration des clés Supabase dans un environnement ou d'échec réseau, `transMeta.status` valait `unavailable`.
- Le code basculait alors sur `SpeechService.speak()`, qui finissait par déclencher le moteur de synthèse vocale synthétique du navigateur (`window.speechSynthesis`).

#### 2. Solution Robuste & Déterministe :
1. **Fallback Automatique vers les URLs Directes GitHub Releases** :
   - Les archives et fichiers audio de GitHub Releases suivent une nomenclature canonique (ex: `https://github.com/aomelander/hidaya/releases/download/...`).
   - Même si l'appel API metadata est indisponible ou lent, le lecteur résout immédiatement le MP3 correspondant depuis le bucket / release GitHub.
2. **Interdiction Formelle du Web Speech API de Secours** :
   - Désactiver tout basculement vers la voix robotique du navigateur pour les textes coraniques et exégétiques.
   - Si un fichier audio studio n'est pas disponible, l'application utilise soit le TTS haute-fidélité serveur Gemini (`/api/tts`), soit saute élégamment à l'étape suivante, sans jamais infliger la voix synthétique du système d'exploitation.

---

## 3. Plan d'Implémentation Étape par Étape

### Phase 1 : Refonte de l'En-tête (`Header.tsx`) & Intégration de la Recherche X-Style
- [x] Déplacer la logique de recherche (`GuidanceSearchBar`, reconnaissance vocale, suggestions) directement dans `Header.tsx`.
- [x] Créer le popover de suggestions (`SearchSuggestionsDrawer` / `TodayFocusDropdown`) qui s'ouvre sous la barre au focus.
- [x] Intégrer le bouton **Play / Pause global** dans l'en-tête, synchronisé avec le verset actif.

### Phase 2 : Carte de Verset Épurée (`VerseCard.tsx` & `AudioPlayer.tsx`)
- [ ] **Supprimer le bloc de contrôles audio lourd** : retirer la timeline/barre de scrubber, les compteurs de temps, et les boutons superflus de la carte.
- [ ] **Supprimer le bloc Niveau 4 (méditation notepad)** : rediriger toute prise de note vers le fil de commentaires `💬`.
- [ ] **Affichage direct du Tafsir choisi** : lire `preferredScholar` depuis les préférences et afficher directement ce tafsir sans segmented control sur la carte.
- [ ] Conserver uniquement le moteur de **téléprompteur mot-à-mot avec auto-scroll fluide**.

### Phase 3 : Mode Reels Plein Écran à Verset Unique (`page.tsx`)
- [ ] Remplacer l'empilement vertical de toutes les cartes (`displayedPassages.map`) par l'affichage **d'une seule carte active à la fois** (`currentVerse = displayedPassages[activeIndex]`).
- [ ] Ajouter une barre de progression segmentée en haut de la carte (ex. 4 segments pour 4 versets) indiquant le verset en cours.
- [ ] Permettre la navigation par swipe tactile gauche/droite ou par touches fléchées / boutons discrets.
- [ ] Clic sur le cercle Ayah (`۝`) : charge la sourate dans ce même visualiseur universel, sans jamais basculer sur une page différente.

### Phase 4 : Sécurisation de l'Audio GitHub Releases
- [ ] Dans `ayahAudioServerService.ts` et `AudioPlayer.tsx`, fiabiliser la résolution des MP3 de GitHub Releases.
- [ ] Supprimer le fallback vers `window.speechSynthesis` dans `speechSynthesisService.ts` pour les versets et tafsirs.
- [ ] Assurer la mise en cache `CacheStorage` proactive (`N+1`) des audios GitHub pour un enchaînement instantané sans coupure.

### Phase 5 : Validation & Tests de Régression
- [ ] Vérifier que `npm run typecheck` et `npm run lint` passent avec 0 erreur.
- [ ] Vérifier que les 9 tests d'intégration audio (`npm test`) passent avec succès.
- [ ] Mettre à jour la documentation d'état (`docs/STATE.md`).

---

## 4. Matrice des Fichiers Impactés

| Fichier | Nature des Modifications |
| :--- | :--- |
| `src/components/Header.tsx` | Intégration de la barre de recherche compacte, du popover de suggestions (Today's Focus & thèmes rapides), et du bouton Play/Pause global. |
| `src/app/page.tsx` | Passage au mode carrousel 1-verset-à-la-fois (suppression de la colonne infinie), gestion de l'index actif et du swipe. |
| `src/components/VerseCard.tsx` | Épuration radicale : suppression du lecteur audio visuel encombrant, suppression du bloc notepad Niveau 4, affichage direct du Tafsir des préférences. |
| `src/components/AudioPlayer.tsx` | Mode "Headless / Invisible" pour la carte : le composant gère la lecture, le mot-à-mot et le pré-chargement en arrière-plan sans UI encombrante. |
| `src/services/speechSynthesisService.ts` | Suppression stricte de la voix robotique du navigateur (`window.speechSynthesis`) pour les versets. |
| `src/lib/audio/ayahAudioServerService.ts` | Fallback déterministe vers les MP3 GitHub Releases même en l'absence de base de données. |

---

> [!TIP]
> Ce plan garantit une expérience ultra-rapide, propre et contemporaine, sans rupture visuelle entre la recherche et la lecture de sourate, et sans voix synthétique de navigateur.
