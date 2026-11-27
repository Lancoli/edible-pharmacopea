# Archive Botanique — app rules

A shop of cuttings in tubes, presented as a collector's cabinet (see [README.md](README.md)).
Shared rules: [../CLAUDE.md](../CLAUDE.md).

## Own rules

- **The "Botanical Archive" cabinet** in four neons is the identity: keep it.
- **Payment is not wired**: nothing in the interface may suggest that one can pay until it is. Wiring it (payment,
  terms of sale) is the N3 goal (`jalons.json`).
- `*.avant-*` files are backups: never served (excluded from the image), to be archived in `_archive/`.
- **Languages**: code, comments and docs in English. The interface is French; the data globals (`window.ARMOIRES`,
  `SPECIMENS`…) and their keys (`nom`, `soins`, `dessin`…) stay French until the i18n step (root rule "Language").
  The storage key `archive-botanique-v1` is kept: visitors' carts and herbariums live under it.

## Check

`node tools/jalons.mjs ArchiveBotanique` · `node tools/design-lint.mjs ArchiveBotanique` · `lancer liens ArchiveBotanique`.
