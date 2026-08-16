# QUADLUD — PROJECT_STATE

**Version :** 2.21.13  
**Date :** 2026-08-16  
**Dernière étape validée :** étape 4/4 — validation globale et préparation de la source officielle  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.13 améliore l’interface **Rectangles** autour d’une manipulation directe inspirée des usages observés sur des jeux de rectangles tactiles : la palette de zones est supprimée, le rectangle est déterminé par l’unique indice qu’il contient, le drag est élastique et le redimensionnement agit sur un coin avec le coin opposé fixe.

Cette évolution est **UI uniquement** : `patches-logic.js`, les moteurs Queens/Soleil-Lune et les fonctions algorithmiques du générateur Rectangles n’ont pas été modifiés.

## Architecture logique conservée

Le moteur de preuves de v2.21.12 reste la source commune du Logic Coach, du Tuteur et de l’audit Rectangles :

- domaines de rectangles candidats ;
- faits `OWNER`, `NOT_OWNER`, `SELECTED_RECT` ;
- déductions structurées avec rang et `techniqueLevel` ;
- fermeture coût 0 ;
- règles T1/T2/T3 ;
- persistance logique compatible Undo/Redo ;
- aucune justification fabriquée depuis la solution finale.

Le moteur reste générique pour les grilles carrées **5×5 à 10×10**. Le générateur reste Easy=5×5, Medium=6×6, Hard=7×7.

## Interaction Rectangles v2.21.13

### Suppression de la palette

La barre `Zone 1 / Zone 2 / ...` n’est plus rendue. Lors d’un nouveau drag, la zone est inférée uniquement lorsque le rectangle courant contient exactement un indice.

### Tap / drag

- tap sur case vide : aucune action ;
- tap sur rectangle : suppression du rectangle entier ;
- drag depuis une case vide : création d’un rectangle ;
- drag depuis un rectangle existant : redimensionnement ;
- le coin le plus proche du point de départ est le coin mobile ;
- le coin opposé est l’ancre fixe ;
- un offset conserve la forme initiale au début du redimensionnement, même si le doigt n’est pas exactement sur le coin ;
- `pointercancel` annule la preview sans modifier `paint` ni l’historique.

Un seuil distinct pointeur fin / pointeur tactile distingue le tap du drag.

### Hystérésis

`patchPointToCellHysteresis()` impose une pénétration minimale dans la case voisine avant de changer le snapping. L’objectif est de limiter les oscillations sur les petites cellules, notamment en 10×10 sur téléphone.

### Preview

Le drag affiche un badge :

`hauteur × largeur · aire`

États :

- vert : surface/forme explicites respectées ;
- orange : mauvaise surface et/ou mauvaise forme ; le coup reste enregistrable afin que l’Error Coach puisse expliquer l’erreur ;
- rouge : aucun indice, plusieurs indices, mauvais indice pendant un resize ou chevauchement avec une autre zone ; le coup est rejeté.

En cas de mauvaise surface, l’aire attendue est ajoutée au badge. En cas de chevauchement, les cases réellement conflictuelles sont accentuées.

Pendant un resize, l’ancien rectangle est seulement atténué visuellement : l’état réel n’est modifié qu’au `pointerup` réussi.

## Refonte visuelle

- glyphes Unicode de forme remplacés par pictogrammes CSS `square`, `vertical`, `horizontal` ;
- plus de fond beige sur la case-indice ;
- badges d’indice blancs et compacts ;
- grille interne plus légère ;
- périmètre des rectangles plus marqué ;
- coins extérieurs visuellement arrondis ;
- animation de commit conservée, désactivée avec `prefers-reduced-motion`.

## Mobile / iPhone

Sur largeur <= 520 px, le panneau Rectangles passe en layout `flex` ordonné :

1. en-tête ;
2. grille ;
3. courte légende gestuelle ;
4. barre d’actions ;
5. messages/Coach/Exploration.

La première rangée d’actions est :

- Annuler ;
- Refaire ;
- Logic Coach ;
- Tuteur.

Le bouton **Règles** reste visible. Les règles détaillées permanentes sous la grille sont masquées pour Rectangles ; elles restent accessibles par le bouton Règles.

Les autres jeux gardent leur layout actuel.

## Générateur

Comparaison entre `app.js` v2.21.12 avant modification et v2.21.13 : fonctions strictement inchangées :

- `makeRectTiling`
- `possiblePatchRects`
- `countPatchSolutions`
- `generatePatchesPuzzle`
- `analyzePatches`
- `patchesCandidate`

Aucun niveau Expert Rectangles ajouté.

## Fichiers modifiés

- `app.js`
- `styles.css`
- `tests/patches-ui-integration.test.js`
- `tests/patches-browser-smoke.py`
- `README.md`
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `index.html`
- `sw.js`
- `precompute-worker.js`
- `manifest.webmanifest`
- `build-info.json`

## Fichiers logiques vérifiés mais non modifiés

- `patches-logic.js`
- `queens-logic.js`
- `tango-logic.js`

## Tests réellement exécutés et réussis

### Moteur Rectangles — Node

- `node tests/patches-logic-domain.test.js` — OK
- `node tests/patches-logic-closure.test.js` — OK
- `node tests/patches-logic-direct.test.js` — OK
- `node tests/patches-logic-advanced.test.js` — OK
- `node tests/patches-logic-contradictions.test.js` — OK
- `node tests/patches-logic-solve.test.js` — OK

### Intégration statique

- `node tests/patches-ui-integration.test.js` — OK

Vérifie notamment : moteur commun Coach/Tuteur toujours présent, absence du fallback final, 30 langues, palette UI absente, pictogrammes CSS, fonction d’hystérésis, resize par coin, preview surface/forme et layout mobile board-first.

### Chromium — Rectangles

- `python tests/patches-browser-smoke.py` — OK

Le test existant Coach/Tuteur/Undo/Redo a été conservé et complété avec :

- absence de palette ;
- pictogramme de forme CSS ;
- absence de fond beige de case-indice ;
- drag 2×2 avec badge `2 × 2 · 4` ;
- tap vide sans effet ;
- tap sur rectangle = suppression ;
- hystérésis : 5 % dans la case voisine ne change pas encore le snap, 30 % le change ;
- redimensionnement 2×2 → 3×3 avec coin opposé fixe ;
- preview orange d’une mauvaise forme ;
- preview orange d’une mauvaise surface avec aire attendue ;
- conservation des erreurs `P_SHAPE` / `P_SIZE` pour le Coach ;
- FR/EN ;
- génération 5×5/6×6/7×7 ;
- viewport tactile 390×844 avec grille synthétique 10×10 ;
- grille rendue avant la barre d’actions mobile ;
- bouton Règles visible ;
- Coach et Tuteur fonctionnels.

### Non-régression autres jeux

- `python tests/global-browser-regression.py` — OK

Couronnes, Soleil-Lune et Grille 6 : rendu, Coach, Tuteur, aucune erreur page/console dans les scénarios couverts.

### Structure / syntaxe

- `node -c app.js` — OK
- `node -c patches-logic.js` — OK
- `node -c queens-logic.js` — OK
- `node -c tango-logic.js` — OK
- `node -c sw.js` — OK
- `node -c precompute-worker.js` — OK
- parsing `manifest.webmanifest` — OK
- parsing `build-info.json` — OK

## Échecs rencontrés pendant l’implémentation

1. Premier smoke navigateur après remplacement du bloc UI : `updatePatchCellVisual` avait été supprimée avec l’ancien bloc. Fonction restaurée, syntaxe puis tests relancés.
2. Le smoke mobile tentait d’ouvrir le Tuteur alors que la fenêtre flottante du Coach était encore ouverte et interceptait le clic. Le scénario de test a été corrigé pour fermer explicitement la fenêtre, conformément au vrai geste utilisateur.
3. Le test statique attendait encore les glyphes Unicode `▯ / ▭` ; il a été mis à jour pour valider les nouveaux pictogrammes CSS.

Aucun de ces échecs ne subsiste dans la passe finale.

## Tests non exécutés

- Safari réel sur iPhone physique ;
- tests multi-touch matériel ;
- installation PWA puis fonctionnement hors ligne sur appareil réel ;
- audit formel VoiceOver/accessibilité (prévu au jalon v2.22).

## Risques résiduels

- Le seuil et l’hystérésis tactiles sont validés sous Chromium, mais leur sensation exacte doit encore être confirmée sur Safari/iPhone physique.
- Le redimensionnement choisit le coin géométriquement le plus proche du point de contact ; lorsque le contact est exactement au centre d’un rectangle pair, le choix peut être visuellement équivalent mais dépend du premier coin minimal rencontré.
- Les erreurs surface/forme restent volontairement enregistrables afin de préserver l’Error Coach ; seules les erreurs structurelles (indice absent/multiple, chevauchement) bloquent le commit.

## Prochaine étape

Roadmap inchangée : **v2.22 — Accessibilité**.

Copyright © 2026 Serge Benoliel  
All rights reserved.
