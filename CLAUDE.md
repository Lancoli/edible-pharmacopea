# Archive Botanique — règles de l'app

Une boutique de boutures en tube, présentée comme une armoire de collection (voir [README.md](README.md)).
Règles communes : [../CLAUDE.md](../CLAUDE.md).

## Règles propres

- **L'armoire « Botanical Archive »** en quatre néons est l'identité : on la garde.
- **Le paiement n'est pas branché** : rien dans l'interface ne doit laisser croire qu'on peut payer tant qu'il ne l'est
  pas. Le brancher (paiement, conditions de vente) est l'objectif N3 (`jalons.json`).
- Les fichiers `*.avant-*` sont des sauvegardes : jamais servies (exclues de l'image), à archiver dans `_archive/`.

## Vérifier

`node tools/jalons.mjs ArchiveBotanique` · `node tools/design-lint.mjs ArchiveBotanique` · `lancer liens ArchiveBotanique`.
