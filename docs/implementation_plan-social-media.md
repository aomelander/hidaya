# Refonte Complète de l'Expérience Hidaya — Sanctuaire Social, Lecture Auto-Swipe & Téléprompteur Mot-à-Mot

Cette refonte transforme Hidaya en une expérience unifiée, fluide et intuitive inspirée des réseaux sociaux modernes (Instagram Reels, Threads, X), centrée sur **une seule Carte de Verset Universelle (`VerseCard`)** navigable par glissement, dotée d'un **mode lecture automatique au swipe façon vidéo**, d'un **suivi mot-à-mot avec défilement automatique ligne par ligne (téléprompteur intelligent)**, et d'une **page Préférences entièrement restructurée** regroupant tous les réglages (dont le Mode Écran TV / Plein Écran).

---

## Revue Utilisateur & Décisions Confirmées

> [!IMPORTANT]
> Les choix suivants intègrent vos dernières instructions et gouvernent l'architecture finale :

- **En-tête Ultra-Pur (`Header`)** :
  - L'en-tête ne contient plus que **deux éléments** : la marque **Hidaya هِدَايَة** à gauche (retour au flux Guidance) et le bouton **Préférences** (`⚙️`) à droite.
  - Suppression de la barre de navigation du bas (`BottomNav`), du sélecteur de langue de l'en-tête et du bouton TV de l'en-tête (déplacé dans Préférences).
- **Refonte Intuitive & Structurée de la Page Préférences (`CustomizationSheet`)** :
  - Tous les paramètres de l'application sont organisés clairement en **5 sections visuelles intuitives** dans Préférences :
    1. **Langue, Thème & Affichage (dont Mode Écran TV / Plein Écran)** : Choix de la langue (`FR`, `EN`, `SV`, `AR`), thème Clair/Sombre, Contraste élevé, et activation du **Mode Écran TV / Sanctuaire Plein Écran** (pour TV LG, PC, Tablette avec Wake Lock).
    2. **Expérience Audio & Lecture Automatique (Façon Vidéo / Reels)** :
       - **Lecture automatique au swipe (`Auto-Play on Swipe`)** : Dès qu'on glisse vers un verset, la récitation démarre immédiatement comme une vidéo.
       - **Étapes lues par défaut** : Activer/désactiver `✓ Récitation (AR)`, `+ / ✓ Traduction`, `+ / ✓ Tafsir`, et choix du Récitateur / Érudit de Tafsir.
       - **Enchaînement en fin de verset** : **Passer automatiquement au verset suivant** (par défaut) ou **Répéter le verset en boucle (`Loop`)**.
    3. **Personnalisation de la Carte Universelle (`VerseCard`)** : Choisir précisément quels blocs apparaissent sur la carte (Translittération phonétique, Tafsir, Racines arabes, Fil de commentaires social `💬`, Studio de création `🎬`) et ajuster la taille de la police arabe et des traductions.
    4. **Profil du Lecteur & Profondeur** : Standard / Adulte, Ados (13–17), Enfants & Famille (8+).
    5. **Mode Hors-Ligne & Installation PWA** : Mise en cache des favoris et installation sur iPhone / Android / PC.
- **Zéro Lag — Pré-Cache Proactif Multi-Phases & Verset Suivant (`N+1`)** :
  - Dès que le verset s'affiche ou que la récitation commence, le moteur audio prépare immédiatement en cache (en arrière-plan) :
    1. L'audio de la **Traduction** (si activée) et du **Tafsir** (s'il est activé et disponible dans la langue choisie) depuis GitHub Releases (`/api/ayah-audio`) ou le serveur TTS (`/api/tts`).
    2. L'audio de la **Récitation et de la Traduction du verset suivant (`N+1`)**, afin que les transitions `Récitation → Traduction → Tafsir → Verset Suivant` s'enchaînent instantanément sans aucun temps d'arrêt.
- **Mise en Évidence Mot-à-Mot & Défilement Automatique Ligne par Ligne (Téléprompteur Intelligent)** :
  - Pendant la **Récitation Arabe** : chaque mot arabe est mis en évidence en temps réel, la carte se positionne automatiquement sur la section arabe, et si le verset est long (ex. `2:275` ou `2:282`), l'écran défile doucement ligne par ligne pour garder le mot lu au centre de l'écran.
  - Dès le passage à la **Traduction** : l'écran remonte/défile automatiquement pour centrer le bloc Traduction, met en évidence les mots au fur et à mesure de la lecture, et fait défiler doucement les lignes longues jusqu'à la fin.
  - Dès le passage au **Tafsir** : l'écran ouvre et centre automatiquement le bloc Tafsir, met en évidence chaque mot/phrase lu(e), et défile doucement ligne par ligne au rythme de la voix.
  - **Fin du cycle du verset** : Une fois toutes les parties activées lues, l'application **glisse automatiquement au verset suivant** et lance sa lecture (sauf si le mode **Boucle / Répéter** est activé).

---

## 1. Vue d'Ensemble & Concept Fondamental

- **Une Seule Carte Universelle ("The Single Sacred Card")** : Que l'utilisateur explore un thème de vie (*discipline dans la prière, comportement avec les parents ou les enfants, gestion de la colère*), lise une sourate complète ou parcoure ses favoris (`♥`), il interagit toujours avec la même carte de verset épurée.
- **L'Expérience "Vidéo / Reels" Appliquée au Coran** :
  - **Swipe Gauche ↔ Droite** : Change de verset et déclenche immédiatement la lecture si le mode Auto-Play est activé.
  - **Swipe Haut ↕ Bas** : Permet d'explorer manuellement ou automatiquement (au fil de la lecture audio) les strates du verset : Arabe Uthmani, Translittération, Traduction, Tafsir, Commentaires (`💬`) et Studio de Création (`🎬` Image 1:1 / 9:16, Vidéo MP4/WebM, PowerPoint PPTX/PDF).
  - **Cercle Ayah Cliquable (`۝`)** : Cliquer sur le cercle numéroté d'un verset bascule ou centre immédiatement le flux sur ce verset dans sa sourate pour naviguer à gauche ou à droite et écouter en continu.

---

## 2. Expérience Utilisateur & Design Visuel

### A. Architecture de la Nouvelle Page Préférences (Intuitive & Structurée)

La page **Préférences** remplace les anciens réglages dispersés par un tableau de bord clair, organisé en **5 cartes thématiques** avec des interrupteurs visuels immédiats :

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ PRÉFÉRENCES & PERSONNALISATION                       [ Retour à Guidance ]│
├──────────────────────────────────────────────────────────────────────────────┤
│  1. 🌍 LANGUE, APPARENCE & ÉCRAN TV                                          │
│     • Langue de l'application : [ Français ] [ English ] [ Svenska ] [ عربي ]│
│     • Thème visuel            : [ ☀️ Parchemin Clair ] [ 🌙 Sanctuaire Sombre]│
│     • Mode Grand Écran / TV   : [ 📺 Activer le Mode Plein Écran / TV LG ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│  2. 🎧 LECTURE AUDIO & MODE AUTOMATIQUE (FAÇON VIDÉO / REELS)                │
│     • Lecture auto au swipe   : [✓] Démarrer l'audio dès qu'on change d'Ayah │
│     • Enchaînement auto       : [● Passer au verset suivant] [○ Boucle 🔂]   │
│     • Contenu audio lu        : [✓ Récitation] [✓ Traduction] [+ Tafsir]     │
│     • Voix & Érudit           : Récitateur (Alafasy...) · Tafsir (Ibn Kathir)│
├──────────────────────────────────────────────────────────────────────────────┤
│  3. 🃏 AFFICHAGE SUR LA CARTE DE VERSET (CE QUI APPARAÎT OU NON)             │
│     • Taille du texte Arabe   : [ A- ──────●────── A+ ]                      │
│     • Taille Traduction/Tafsir: [ A- ────●──────── A+ ]                      │
│     • Éléments visibles       : [✓] Translittération  [✓] Tafsir Classique   │
│                                 [✓] Commentaires (💬) [✓] Studio Vidéo/Image │
│                                 [ ] Racines Arabes    [✓] Badge Source Audio │
├──────────────────────────────────────────────────────────────────────────────┤
│  4. 👨‍👩‍👧‍👦 PROFIL DE LECTURE & PROFONDEUR                                        │
│     • Adaptation du langage   : [ Standard ] [ Ados 13-17 ] [ Enfants 8+ ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│  5. 📲 MODE HORS-LIGNE & INSTALLATION (iPhone / Android / PC / TV)           │
│     • [ Mettre en cache les audios favoris ]   [ Installer l'application ]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### B. Moteur de Suivi Mot-à-Mot & Auto-Scroll Ligne par Ligne (Téléprompteur)

Lorsqu'un verset est en cours de lecture (`recitation`, `translation` ou `tafsir`) :
1. **Focus Automatique sur la Section Active** :
   - Au début de la **Récitation** : l'écran se positionne en douceur sur le bloc **Niveau 1 (Arabe Uthmani)**.
   - Au passage à la **Traduction** : l'écran remonte ou descend automatiquement pour amener le début du bloc **Niveau 2 (Traduction)** dans la zone de confort visuel.
   - Au passage au **Tafsir** : le bloc **Niveau 3 (Tafsir)** s'ouvre automatiquement (s'il existe dans la langue choisie) et l'écran se positionne sur son début.
2. **Suivi Ligne par Ligne pour les Textes Longs** :
   - Chaque mot est enveloppé dans un `<span data-word-index={i}>` (en Arabe, en Traduction et en Tafsir).
   - À mesure que `activeWordIndex` avance avec la progression audio (`progressRatio`), un observateur de position vérifie la coordonnée verticale (`getBoundingClientRect()`) du mot actuellement mis en évidence :
     - Si le mot actif passe sur une nouvelle ligne et descend sous le centre de la fenêtre de visualisation (sur mobile, PC ou TV), la fenêtre défile doucement (`window.scrollBy({ top: deltaY, behavior: 'smooth' })`) pour maintenir la ligne active toujours au centre de l'écran.
3. **Transition Sans Lag & Passage au Verset Suivant** :
   - Dès la milliseconde où la dernière partie activée (`Récitation`, `Traduction` ou `Tafsir`) se termine :
     - Si le mode **Boucle (`Repeat Verse`)** est actif : la lecture reprend immédiatement au début de la Récitation du même verset.
     - Sinon (**Auto-Advance** par défaut) : le carrousel glisse automatiquement vers le **verset suivant** (`activeCardIndex + 1`) et démarre immédiatement sa récitation déjà pré-chargée en cache.

---

## 3. Décisions Produit & Arbitrages Techniques

1. **Pré-Cache Prédictif Multi-Couches (`Preload Pipeline N & N+1`)**
   - *Approche choisie* : Dès qu'un verset `N` devient actif, un gestionnaire de pré-chargement lance en parallèle :
     1. Le pré-chargement de la **Traduction** et du **Tafsir** du verset `N` (résolution de `/api/ayah-audio/metadata` + `fetch()` en `Blob` mémoire des MP3 GitHub Releases ou synthèse anticipée `/api/tts`).
     2. Le pré-chargement de la **Récitation Arabe** et de la **Traduction** du verset `N+1` dans la file active.
   - *Pourquoi* : Élimine totalement les temps morts entre la récitation, la traduction, le tafsir et le passage au verset suivant.
2. **Continuité Audio sur iPhone en Veille (`iOS Background Audio Lock`)**
   - *Approche choisie* : Utilisation d'un élément `<audio>` maître unique couplé à des `Blob URL` pré-chargés en mémoire et à `navigator.mediaSession`. Ainsi, même lorsque l'écran de l'iPhone s'éteint, l'événement `ended` enchaîne immédiatement la piste suivante (Traduction, Tafsir, puis Verset suivant) sans jamais être bloqué par Safari iOS.

---

## 4. Architecture Technique & Stratégie de Données

### A. Diagramme du Pipeline Audio Sans Lag & Téléprompteur

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  SWIPE UTILISATEUR OU PASSAGE AUTO (Verset N)                │
└──────────────────┬────────────────────────────────────────┬──────────────────┘
                   │                                        │
                   ▼ (Immédiat si Auto-Play activé)         ▼ (En arrière-plan - Zéro Lag)
┌──────────────────────────────────────┐  ┌────────────────────────────────────┐
│ 1. PHASE RÉCITATION ARABE (Verset N) │  │ PRÉ-CACHE EN MÉMOIRE (Blob Cache)  │
│  • Focus écran sur bloc Arabe        │  │  • Audio Traduction (Verset N)     │
│  • Highlight mot-à-mot + Auto-scroll │  │  • Audio Tafsir (Verset N, si disp)│
│    ligne par ligne                   │  │  • Audio Récitation + Trad (N+1)   │
└──────────────────┬───────────────────┘  └─────────────────┬──────────────────┘
                   │                                        │
                   ▼ (Transition instantanée 0ms) ◄─────────┘
┌──────────────────────────────────────┐
│ 2. PHASE TRADUCTION (si activée)     │
│  • Remonte/centre le bloc Traduction │
│  • Highlight mot-à-mot + Auto-scroll │
│    ligne par ligne                   │
└──────────────────┬───────────────────┘
                   │
                   ▼ (Transition instantanée 0ms — ignoré si absent dans la langue)
┌──────────────────────────────────────┐
│ 3. PHASE TAFSIR (si activé & dispo)  │
│  • Ouvre & centre le bloc Tafsir     │
│  • Highlight mot-à-mot + Auto-scroll │
│    ligne par ligne                   │
└──────────────────┬───────────────────┘
                   │
                   ▼ (Fin du verset N)
┌──────────────────────────────────────────────────────────────────────────────┐
│  [ Mode Boucle 🔂 ? ] ──Oui──► Reprend à la Phase 1 du Verset N              │
│          │                                                                   │
│         Non (Défaut) ────────► Glisse auto vers Verset N+1 & joue Phase 1    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### B. Cartographie des Interactions & Gestionnaires d'Événements

| Interaction / Événement | Comportement & Transition d'État |
| :--- | :--- |
| **Swipe Gauche / Droite (`←` / `→`)** | Passe au verset suivant/précédent. Si `autoPlayOnSwipe` est activé, lance immédiatement la Récitation du nouveau verset et pré-cache sa Traduction, son Tafsir et le verset suivant. |
| **Progression Audio (`onPlaybackProgress`)** | Met à jour `activePhase` (`recitation` / `translation` / `tafsir`) et `progressRatio`. Calcule le mot actif (`data-word-index`), l'illumine, et fait défiler la fenêtre ligne par ligne pour garder le mot lu au centre de l'écran. |
| **Fin d'une Phase Audio** | Passe sans délai à la phase suivante pré-cachée en mémoire (`Recitation → Translation → Tafsir`). Une fois la dernière phase terminée, recommence le verset si `loopVerse` est actif, ou passe automatiquement au verset suivant (`onNextVerse`). |
| **Clic sur Cercle Ayah (`۝`)** | Charge la sourate correspondante centrée sur ce verset dans le carrousel universel pour permettre le swipe gauche/droite et la lecture continue. |
| **Barre Sociale (`♥` · `💬` · `🎬` · `↗`)** | Permet d'aimer le verset (`♥`), d'ajouter un commentaire horodaté dans le fil sous la carte (`💬`), d'ouvrir le Studio de création Image `1:1`/`9:16`, Vidéo `WebM/MP4` ou `PPTX/PDF` (`🎬`), ou de partager (`↗`). |
| **Page Préférences restructurée** | Permet de régler la langue, le thème, le **Mode Écran TV / Plein Écran**, le mode **Auto-Play au Swipe**, le mode **Boucle vs Verset suivant**, et la visibilité de chaque section de la carte. |
