# QUADLUD — PROJECT_STATE

**Version :** 2.21.16  
**Date :** 2026-08-16  
**Dernière étape validée :** Rectangles — indices responsives à la taille réelle des cellules  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.16 améliore la lisibilité des indices de **Rectangles** sur les grands écrans, en particulier tablette, sans modifier le moteur logique ni le générateur.

En v2.21.15, les nombres étaient encore plafonnés à 17 px (15 px sur petit écran), indépendamment de la taille réelle des cellules. Sur un plateau 5×5 de tablette avec des cellules de plus de 100 px, les indices paraissaient donc anormalement petits.

## Modifications

### Dimensionnement depuis la cellule réelle
- `patchUpdateResponsiveClues(board,n)` mesure le plateau et calcule `cellSize = min(width,height) / n`.
- La valeur est exposée via la variable CSS `--patch-cell-size`.
- Les tailles suivantes dérivent de cette valeur avec des bornes minimales/maximales :
  - nombre : `13–32 px` ;
  - `?` : `17–38 px` ;
  - pictogrammes carré / vertical / horizontal ;
  - épaisseur des pictogrammes ;
  - padding, rayon et espacement du badge.
- `ResizeObserver` recalcule automatiquement l’échelle lorsque le plateau est redimensionné.
- Un listener `resize` reste présent comme rafraîchissement complémentaire.

### Comportement mesuré
- Chromium, plateau 5×5 de 620 px : cellule ≈124 px, nombre = **32 px**.
- Chromium mobile, plateau synthétique 10×10 de 344 px : cellule ≈34,4 px, nombre = **13 px**.
- Chromium mobile, plateau 5×5 de 344 px : cellule ≈68,8 px, nombre ≈**19,3 px**.
- Le Tuteur Rectangles applique la même fonction de dimensionnement à son plateau.

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

## Fichiers logiques non modifiés
- `patches-logic.js`
- `queens-logic.js`
- `tango-logic.js`

Le générateur Rectangles n’est pas modifié.

## Tests réellement exécutés et réussis
- `node --check app.js` — OK
- `node --check patches-logic.js` — OK
- `node --check queens-logic.js` — OK
- `node --check tango-logic.js` — OK
- `node --check precompute-worker.js` — OK
- `node --check sw.js` — OK
- validation JSON `build-info.json` / `manifest.webmanifest` — OK
- `node tests/patches-ui-integration.test.js` — OK
- `node tests/patches-logic-domain.test.js` — OK
- `node tests/patches-logic-closure.test.js` — OK
- `node tests/patches-logic-direct.test.js` — OK
- `node tests/patches-logic-advanced.test.js` — OK
- `node tests/patches-logic-contradictions.test.js` — OK
- `node tests/patches-logic-solve.test.js` — OK
- `python tests/patches-browser-smoke.py` — OK
- `python tests/global-browser-regression.py` — OK

Le smoke Chromium vérifie explicitement :
- une taille d’indice ≥30 px sur un plateau 5×5 avec cellules ≥100 px ;
- une taille comprise entre 12,5 et 15 px sur la grille synthétique 10×10 mobile ;
- l’application du dimensionnement responsive dans le Tuteur Rectangles.

## Tests non exécutés
- Safari réel sur iPhone/iPad physique ;
- tests multi-touch matériel ;
- installation PWA puis fonctionnement hors ligne sur appareil réel ;
- audit VoiceOver/accessibilité (prévu en v2.22).

## Risques résiduels
- Le rendu exact des sous-pixels et des métriques typographiques reste à confirmer sur Safari/iPadOS physique.
- Les tailles sont volontairement bornées : sur les très petites cellules, la priorité reste l’absence de débordement plutôt que l’agrandissement maximal.
- Aucun risque logique identifié : moteurs de preuves et générateur ne sont pas modifiés.

## Prochaine étape
Roadmap inchangée : **v2.22 — Accessibilité**.

Copyright © 2026 Serge Benoliel  
All rights reserved.
