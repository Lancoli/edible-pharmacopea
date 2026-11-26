# Archive Botanique

<!-- badges : généré par tools/kit-github.mjs -->
[![qualité](https://github.com/Lancoli/edible-pharmacopea/actions/workflows/qualite.yml/badge.svg)](https://github.com/Lancoli/edible-pharmacopea/actions/workflows/qualite.yml) [![release](https://img.shields.io/github/v/release/Lancoli/edible-pharmacopea?include_prereleases&label=version)](https://github.com/Lancoli/edible-pharmacopea/releases) [![Conventional Commits](https://img.shields.io/badge/commits-conventionnels%20%2B%20gitmoji-ff69b4)](https://www.conventionalcommits.org/fr/) [![dernier commit](https://img.shields.io/github/last-commit/Lancoli/edible-pharmacopea)](https://github.com/Lancoli/edible-pharmacopea/commits)
<!-- /badges -->

Boutique de boutures en tube, présentée comme une armoire de collection (« Botanical Archive », en quatre néons).
Aujourd'hui une vitrine : le paiement n'est pas branché. Objectif : une vraie boutique, avec paiement et conditions de vente (niveau N3).

## Lancer

Site statique, sans étape de construction.

- **Avec tout le portfolio** : `lancer.cmd` à la racine du portfolio, puis http://localhost:4101/ArchiveBotanique/
- **Dans Docker** (comme en ligne) : `lancer docker`, puis http://localhost:8080/ArchiveBotanique/
- **Seul** : n'importe quel serveur statique ouvert dans ce dossier (les chemins sont relatifs).

## Qualité

Ce projet suit les jalons du portfolio (`docs/JALONS.md` à la racine) : ses objectifs et son état sont dans `jalons.json`.
Vérification : `node tools/jalons.mjs ArchiveBotanique` depuis la racine du portfolio.
