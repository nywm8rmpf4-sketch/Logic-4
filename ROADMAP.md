# QUADLUD — ROADMAP

> Restauré en v2.21.0 : le paquet v2.20.0 ne contenait pas de `ROADMAP.md`. Ce document reprend l’ordre des jalons explicitement validés dans le projet ; aucune étape n’a été réordonnée.

## Vision
**QUADLUD — Pure Logic. Explained.**

Le Logic Coach doit enseigner progressivement le raisonnement réel à partir de l’état visible, sans dépendre de la solution cachée pour ses explications.

## Roadmap validée
- **v2.11** — Logic Coach foundation + historique complet — ✅ terminé
- **v2.12** — Logic Coach progressif en 4 étapes — ✅ terminé
- **v2.13** — Bibliothèque pédagogique de techniques — ✅ terminé
- **v2.14** — Explique mon erreur + retour avant erreur — ✅ terminé
- **v2.15** — Profil de maîtrise logique — ✅ terminé
- **v2.16** — Logic Coach adaptatif — ✅ terminé
- **v2.17** — Entraînement ciblé par technique — ✅ terminé
- **v2.18** — Parcours interactif Apprendre — ✅ terminé
- **v2.19** — Défi quotidien quatre jeux + scoring logique — ✅ terminé
- **v2.20** — Mode Exploration : branches / hypothèses — ✅ terminé
- **v2.21** — Défis partageables par seed/code — ✅ terminé
  - **v2.21.1** — patch UX : alertes configurables et plateau stable — ✅ terminé
  - **v2.21.2** — patch Couronnes : difficultés certifiées par inférences R1/R2 — ✅ terminé
  - **v2.21.3** — patch Couronnes : tailles 7×7 / 8×8 / 9×9 / 9×9 — ✅ terminé
  - **v2.21.4** — patch Logic Coach : 3 étapes + résolution logique pas à pas — ✅ terminé
  - **v2.21.5** — patch UX : mode Tuteur visible sur mobile — ✅ terminé
  - **v2.21.6** — patch UX : navigation Tuteur au-dessus des explications — ✅ terminé
  - **v2.21.7** — patch UX : plateau et navigation Tuteur toujours visibles — ✅ terminé
  - **v2.21.8** — patch Tuteur Couronnes : croix automatiques après chaque reine — ✅ terminé
  - **v2.21.9** — patch Couronnes : Difficile/Expert ≤ 3 zones de taille 2 — ✅ terminé
  - **v2.21.10** — moteur d’inférences Queens explicable partagé Coach/Tuteur — ✅ terminé
  - **v2.21.11** — moteur d’inférences Soleil/Lune explicable partagé Coach/Tuteur — ✅ terminé
  - **v2.21.12** — moteur d’inférences Rectangles explicable partagé Coach/Tuteur — ✅ terminé
  - **v2.21.13** — patch UX Rectangles : manipulation directe, preview et mobile — ✅ terminé
  - **v2.21.14** — patch Rectangles : tap sur indice + correction des contours d’erreur — ✅ terminé
  - **v2.21.15** — patch Rectangles : suppression des séparations orange/rouges internes — ✅ terminé
  - **v2.21.16** — patch Rectangles : indices responsives selon la taille réelle des cellules — ✅ terminé
  - **v2.21.17** — patch Tuteur Rectangles : un rectangle visible par étape — ✅ terminé
- **v2.22** — Accessibilité — prochain jalon
- **v2.23** — Confidentialité / portabilité des données
- **v2.24** — Préparation iOS
- **v3.0** — Version Web de référence QUADLUD Logic Coach
- **v3.1** — iOS / TestFlight
- **v3.2** — bêta TestFlight
- **v3.5** — App Store Release Candidate
- **v4.0** — publication App Store potentielle

## Principes invariants
- IDs historiques des jeux inchangés : `queens`, `tango`, `sudoku`, `patches`.
- 30 langues, fonctionnement hors ligne, aucune obligation de compte.
- Logic Coach fondé sur les règles et l’état visible pour ses explications.
- Undo/Redo et branches restent des capacités cœur.
- Compatibilité des clés historiques `logic4-*`.
- Les évolutions Web doivent préparer le portage iOS sans réécriture inutile du cœur logique.
