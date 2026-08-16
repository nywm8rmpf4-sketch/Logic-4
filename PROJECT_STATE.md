# QUADLUD — PROJECT_STATE

**Version :** 2.21.17  
**Date :** 2026-08-16  
**Dernière étape validée :** Tuteur Rectangles — un seul nouveau rectangle visible par étape  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.17 corrige le séquencement pédagogique du **Tuteur Rectangles**. Jusqu’en v2.21.16, une seule déduction pouvait déclencher une fermeture coût 0 qui sélectionnait plusieurs rectangles ; `patchSyncEngineToVisible()` peignait alors toutes ces conséquences simultanément dans une seule étape.

Désormais, le moteur logique continue de calculer toutes les conséquences nécessaires, mais le Tuteur révèle les rectangles démontrés **un par un**. Une étape visible correspond donc à une création de rectangle.

## Architecture retenue

### Séparation logique / rendu du Tuteur
- `patches-logic.js` est inchangé.
- `walkthroughGeneratePatchesNext()` ne fait plus de synchronisation visuelle globale via `patchSyncEngineToVisible()`.
- `patchSyncEngineEvidence()` met à jour les preuves internes sans peindre automatiquement les `OWNER`.
- `patchTutorQueueSelections()` collecte les nouveaux `SELECTED_RECT` produits par la déduction principale et sa fermeture automatique.
- La file conserve l’ordre causal réel des déductions.
- `patchTutorRevealNext()` applique exactement un rectangle à `work.paint` / `patchSelectedRects`, crée le snapshot et associe l’explication à la déduction qui a réellement sélectionné ce rectangle.

### Invariant pédagogique
Pour une résolution Tuteur Rectangles démarrant d’une grille sans rectangle :
- étape 1 → 1 rectangle visible ;
- étape 2 → 2 rectangles visibles ;
- … ;
- dernière étape → partition complète.

Les faits `OWNER`, `NOT_OWNER`, éliminations et autres conséquences coût 0 restent disponibles dans l’état logique interne ; ils ne provoquent plus plusieurs remplissages visuels lors d’une même étape.

## Fichiers modifiés
- `app.js`
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
- un seul `patchSelectedRects` supplémentaire à chaque étape ;
- une conclusion `SELECTED_RECT` correspondant au rectangle révélé ;
- unicité des rectangles révélés ;
- nombre final d’étapes égal au nombre d’indices/rectangles sur la fixture de résolution complète ;
- navigation précédent/suivant ;
- cas 10×10 avec dix singletons initiaux, qui ne révèle plus tous les rectangles dès l’étape 1.

## Tests non exécutés
- Safari réel sur iPhone/iPad physique ;
- tests tactiles/multi-touch matériel.

## Risques résiduels
- Les faits logiques internes peuvent être en avance sur l’affichage volontairement séquencé. C’est un choix d’architecture : le moteur conserve la preuve complète, tandis que le Tuteur contrôle uniquement sa révélation visuelle.
- Les limites combinatoires documentées du moteur Rectangles restent inchangées.

## Prochaine étape
**v2.22 — Accessibilité**, conformément à `ROADMAP.md`.

## Propriété intellectuelle
Copyright © 2026 Serge Benoliel  
All rights reserved.
