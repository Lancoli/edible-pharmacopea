# Tests — Archive Botanique

Smoke tests that verify the app structure and basic functionality.

## Running tests

```bash
node tests/smoke.mjs
```

## What is tested

- **HTML structure**: Valid DOCTYPE, critical elements present
- **Resources**: CSS, JavaScript, and data files exist and load
- **Theme compliance**: No hardcoded colors (all derived from CSS tokens)
- **Critical features**: Main cabinet view, specimens data, drawing system

## CI integration

These tests run as part of the deployment CI pipeline (`lancer ci`).
