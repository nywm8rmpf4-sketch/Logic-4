# QUADLUD — PROJECT_STATE

**Version :** 2.21.14  
**Date :** 2026-08-16  
**Dernière étape validée :** correctif UI Rectangles — tap sur indice + suppression des faux contours rouges  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.14 corrige trois problèmes d’interface de **Rectangles** apparus après la refonte tactile v2.21.13 : des contours rouges internes parasites sur les zones invalides, l’absence d’action lors d’un tap sur un indice libre, et une détection de tap insuffisamment robuste lorsque le contact tombe directement sur le contenu visuel de l’indice.

Le moteur logique `patches-logic.js` et le générateur Rectangles ne sont pas modifiés.

## Modifications

### Tap sur indice libre
- `seedPatchClueCell(id,r,c)` crée une zone initiale 1×1 sur la case-indice.
- Le seed met à jour `paint` mais n’ajoute pas de `patchSelectedRects[id]` : il représente une zone commencée, pas encore un rectangle final déclaré.
- Un second tap supprime le seed via le comportement de suppression existant.
- Undo/Redo enregistre l’action sous `PATCH_SEED`.

### Tap/drag fiable sur le contenu de l’indice
- Le `pointerdown` est délégué au plateau `#pboard`.
- La case est déterminée par `patchPointToCell(clientX,clientY)` au lieu de dépendre de `event.target`.
- Le nombre, le `?` et les pictogrammes CSS de forme ne peuvent donc plus empêcher la reconnaissance du geste.

### Correction des lignes rouges parasites
- Le `box-shadow` rouge générique de `.cell.illegal` est neutralisé spécifiquement pour `#pboard .patch-cell.illegal`.
- Une teinte d’erreur est conservée.
- Le pseudo-élément `::after` continue d’utiliser le contour normal des `patch-edge-*`, donc seules les véritables frontières du rectangle sont visibles.

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

## Tests réellement exécutés et réussis
- `node tests/patches-ui-integration.test.js` — OK
- `python tests/patches-browser-smoke.py` — OK
- `node tests/patches-logic-domain.test.js` — OK
- `node tests/patches-logic-closure.test.js` — OK
- `node tests/patches-logic-direct.test.js` — OK
- `node tests/patches-logic-advanced.test.js` — OK
- `node tests/patches-logic-contradictions.test.js` — OK
- `node tests/patches-logic-solve.test.js` — OK
- `python tests/global-browser-regression.py` — OK

Le smoke Chromium vérifie explicitement :
- tap directement au centre du pictogramme d’indice ;
- création d’un seed 1×1 ;
- absence de `patchSelectedRects` pour ce seed ;
- absence d’erreur immédiate sur ce seed ;
- second tap = suppression ;
- zone invalide : `box-shadow` rouge interne absent et aucune frontière gauche/droite artificielle sur une cellule intérieure.

## Tests non exécutés
- Safari réel sur iPhone physique ;
- tests multi-touch matériel ;
- installation PWA puis fonctionnement hors ligne sur appareil réel ;
- audit VoiceOver/accessibilité (prévu en v2.22).

## Risques résiduels
- La sensation exacte du tap/drag reste à confirmer sur Safari/iPhone physique.
- Le seed 1×1 est volontairement une zone partielle : il devient un rectangle sélectionné seulement après un drag/commit explicite.

## Prochaine étape
Roadmap inchangée : **v2.22 — Accessibilité**.

Copyright © 2026 Serge Benoliel  
All rights reserved.
