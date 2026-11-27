# Archive Botanique

<!-- badges : généré par tools/kit-github.mjs -->
[![qualité](https://github.com/Lancoli/edible-pharmacopea/actions/workflows/qualite.yml/badge.svg)](https://github.com/Lancoli/edible-pharmacopea/actions/workflows/qualite.yml) [![release](https://img.shields.io/github/v/release/Lancoli/edible-pharmacopea?include_prereleases&label=version)](https://github.com/Lancoli/edible-pharmacopea/releases) [![Conventional Commits](https://img.shields.io/badge/commits-conventionnels%20%2B%20gitmoji-ff69b4)](https://www.conventionalcommits.org/fr/) [![dernier commit](https://img.shields.io/github/last-commit/Lancoli/edible-pharmacopea)](https://github.com/Lancoli/edible-pharmacopea/commits)
<!-- /badges -->

A shop of cuttings in tubes, presented as a collector's cabinet ("Botanical Archive", in four neons).
Today a showcase: payment is not wired. Goal: a real shop, with payment and terms of sale (level N3).
The interface is French; its move to `i18n/` (fr default, en) is the next language step.

## Run

Static site, no build step.

- **With the whole portfolio**: `lancer.cmd` at the portfolio root, then http://localhost:4101/ArchiveBotanique/
- **In Docker** (as online): `lancer docker`, then http://localhost:8080/ArchiveBotanique/
- **Alone**: any static server opened in this folder (paths are relative).

## Tools

- `python tools/cabinets.py <source.jpg> assets/img`: derives the four coloured cabinets (green, amber, blue, plum) from one photo.

## Quality

This project follows the portfolio milestones (`docs/JALONS.md` at the root): its goals and state are in `jalons.json`.
Check: `node tools/jalons.mjs ArchiveBotanique` from the portfolio root.
