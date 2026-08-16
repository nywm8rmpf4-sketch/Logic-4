# QUADLUD — PROJECT_STATE

**Version :** 2.22.1  
**Date :** 2026-08-16  
**Dernière étape validée :** patch pédagogique Grille 6 — explications détaillées Coach/Tuteur  
**Prochain jalon roadmap :** v2.23 — Confidentialité / portabilité des données

## État synthétique

v2.22.1 est un patch de v2.22.0. Il ne modifie aucune règle, aucun générateur et aucun moteur logique. Le moteur `sudoku-logic.js` reste identique à la version validée v2.22.0 ; le changement porte sur l'adaptateur de présentation Grille 6 qui transforme les déductions/preuves structurées en explications pédagogiques beaucoup plus explicites dans le Logic Coach et le Tuteur.

Le besoin provient d'un défaut UX observé sur tablette : une explication de type « Position unique dans une ligne — le chiffre 5 n'a qu'une position possible : L2C3 » donnait la bonne conclusion, mais ne montrait pas pourquoi les autres cases étaient impossibles.

## Modifications principales

### Candidat unique
Pour un `NAKED_SINGLE`, la narration :
- part de la case cible ;
- examine les chiffres 1 à 6 ;
- indique pour chaque candidat rejeté la contrainte visible qui l'exclut ;
- cite la case contenant déjà ce chiffre lorsque l'élimination vient de R0 ;
- conclut seulement après les cinq exclusions.

### Position unique
Pour `HIDDEN_SINGLE_ROW`, `HIDDEN_SINGLE_COLUMN` et `HIDDEN_SINGLE_BOX`, la narration :
- rappelle quel chiffre manque dans l'unité ;
- liste les cases vides réellement à examiner ;
- explique l'exclusion de chacune des positions concurrentes ;
- cite la ligne/colonne/bloc et la case témoin pour les exclusions visibles ;
- conclut sur la seule position restante.

Exemple de fixture testée : avant le coup, le 5 de la ligne 2 peut être examiné en L2C3, L2C4 et L2C6. L2C4 est exclue car la colonne 4 contient déjà 5 en L3C4 ; L2C6 est exclue car la colonne 6 contient déjà 5 en L5C6 ; le moteur conclut donc L2C3 = 5.

### Techniques intermédiaires et avancées
- `LOCKED_CANDIDATE` : positions encore possibles, alignement commun et éliminations produites ;
- paires/triplets nus : domaines exacts puis candidats retirés ailleurs ;
- paires/triplets cachés : positions des valeurs, cellules réservées puis éliminations ;
- R5 : hypothèse, déductions déterministes successives, contradiction témoin, rejet de l'hypothèse et conclusion ;
- R6 : branches candidates et fait commun démontré ;
- R7 : hypothèse primaire, propagation, hypothèses secondaires, contradictions de chaque branche puis rejet de l'hypothèse primaire.

Lorsqu'un `nextValueStep()` applique plusieurs déductions d'élimination avant le chiffre final, chaque déduction est désormais affichée comme une étape logique distincte et la déduction finale est elle aussi expliquée.

### Source des explications
- aucune lecture de `current.sol` ;
- aucune fabrication à partir de la solution finale ;
- exclusions visibles reconstruites depuis l'état courant et cohérentes avec les faits R0 ;
- si une élimination vient d'une déduction intermédiaire, la règle support est identifiée ;
- si la cause détaillée ne peut pas être reformulée plus précisément, le texte reste factuel (« candidat déjà éliminé par un fait logique démontré ») au lieu d'inventer une justification.

### UX
- listes numérotées `.sudoku-proof-steps` ;
- blocs de preuve successifs `.sudoku-proof-block` ;
- zone texte du Coach scrollable et bornée en hauteur sur petits écrans ;
- Tuteur réutilise exactement la même narration ;
- amélioration grammaticale française des unités : `la ligne`, `la colonne`, `le bloc 2×3`.

Les 28 langues hors FR/EN conservent la représentation symbolique/localisée existante ; aucune traduction non relue n'a été inventée pour ce patch.

## Architecture
- `sudoku-logic.js` : **inchangé** ; il reste la source de vérité des déductions et preuves ;
- `app.js` : enrichissement de la couche `sudokuValueStepExplanation()` et helpers de narration ;
- Coach et Tuteur restent consommateurs du même objet de preuve ;
- aucune session logique supplémentaire n'est persistée ;
- Undo/Redo, génération, solveur de complétion, persistance et audit des coups ne changent pas.

## Fichiers fonctionnels modifiés depuis v2.22.0
- `app.js` ;
- `styles.css` ;
- `index.html` (version assets) ;
- `sw.js` (cache/version) ;
- `precompute-worker.js` (version assets) ;
- `manifest.webmanifest` (version) ;
- `build-info.json`.

## Documentation / tests
- `README.md` ;
- `ROADMAP.md` ;
- `PROJECT_STATE.md` ;
- nouveau `tests/sudoku-explanations-browser.test.py`.

## Tests réellement exécutés et réussis

### Syntaxe
`node --check` sur `app.js`, les quatre moteurs logiques, `precompute-worker.js` et `sw.js` : **OK**.

### Node — 15 suites
- `accessibility-static.test.js` — OK ;
- 7 suites Rectangles (`advanced`, `closure`, `contradictions`, `direct`, `domain`, `solve`, UI integration) — OK ;
- 7 suites Grille 6 (`advanced`, `core`, `direct`, `intermediate`, `proveValue`, `solveLogically`, `nextValueStep`) — OK.

### Chromium — 9 suites
- `accessibility-browser.test.py` — OK ;
- `sudoku-audit-browser.test.py` — OK ;
- `sudoku-coach-browser.test.py` — OK ;
- `sudoku-complete-puzzles-browser.test.py` — OK ;
- `sudoku-explanations-browser.test.py` — OK ;
- `sudoku-state-i18n-browser.test.py` — OK ;
- `sudoku-tutor-browser.test.py` — OK ;
- `patches-browser-smoke.py` — OK ;
- `global-browser-regression.py` — OK.

Le nouveau test dédié valide notamment :
- position unique ligne avec deux exclusions explicitement justifiées par les cellules témoins ;
- même narration dans Coach et Tuteur ;
- candidat unique avec justification des cinq candidats rejetés ;
- R5 avec plusieurs déductions causales avant contradiction ;
- indépendance vis-à-vis d'une `current.sol` volontairement fausse ;
- confinement de la fenêtre Coach sur viewport 390×844.

## Tests non exécutés / limites
- Safari réel sur iPhone/iPad physique ;
- gestes tactiles sur matériel réel ;
- VoiceOver/TalkBack/NVDA/JAWS réels ;
- relecture linguistique native hors FR/EN.

## Problèmes / risques connus hérités
- `TRAINING_ADVANCED_FIXTURES.S_CONTRADICTION_R2` reste historiquement déclaré `unique:true` alors qu'un recomptage autonome trouve 6 solutions ; dette QA inchangée.
- Les raisonnements avancés Grille 6 R5–R7 restent volontairement bornés.
- Une explication avancée peut être longue ; la fenêtre Coach est donc scrollable au lieu de masquer ou tronquer arbitrairement la chaîne de preuve.

## Décisions importantes
- patch livré sous **2.22.1** sans avancer ni réordonner la roadmap ;
- v2.23 reste le prochain jalon ;
- le moteur d'inférence n'a pas été modifié, afin de ne pas coupler la pédagogie textuelle aux règles ;
- aucune explication n'est autorisée à utiliser la solution finale cachée.

## Prochaine étape
**v2.23 — Confidentialité / portabilité des données**, conformément à `ROADMAP.md`.

## Propriété intellectuelle
Copyright © 2026 Serge Benoliel  
All rights reserved.
