# Routing — the screen is in the URL

> Status: implemented (27/11/2026). Code: [js/route.js](../js/route.js). Rule N1 of
> [docs/UX-PRINCIPLES.md](../../docs/UX-PRINCIPLES.md): same URL ⇒ same screen.

## The address

```
#armoire=1&filtre=dispo&fiche=specimen-id&vue=herbier&tiroir=fournitures&caisse=ouverte
```

| Part | Values | Description |
|---|---|---|
| armoire | `0`, `1`, `2`, `3` | Cabinet index (default: 0) |
| filtre | `tout`, `dispo`, `eclat`, `petit`, `rare` | Filter for specimens (default: `tout`) |
| fiche | specimen ID | Open specimen sheet (e.g., `monstera-deliciosa`) |
| vue | `herbier`, `registre` | Full-screen view (herbarium or registry) |
| tiroir | `fournitures`, `collection`, `quarantaine` | Drawer dialog |
| caisse | `ouverte` | Checkout dialog is open |

## States and transitions

- **Cabinet navigation** (`armoire`): Changes when clicking cabinet tabs, arrows, or swiping
- **Filter** (`filtre`): Set by filter buttons, cleared when "tout" is selected
- **Dialogs**: Only one type of dialog can be open at a time (fiche, vue, tiroir, or caisse)
- **Loading a route resets everything else**: URL always wins over stored state
- The address follows the screen (`history.replaceState`): copy it to share or replay exactly what you see
- `body[data-route="ready"]` is set once a route is applied: tests wait for it before measuring

## Personal data not in URL

Cart (`panier`), herbarium (`herbier`), sap level (`seve`), and reminders (`rappels`) remain in localStorage only.
They are never exposed in the URL for privacy reasons.

## Public API

The routing system exposes `window.archiveRoute`:
- `archiveRoute.set(key, value)`: Set a route parameter and update URL
- `archiveRoute.clear(key)`: Remove a parameter and update URL
- `archiveRoute.get(key)`: Get current value
- `archiveRoute.load()`: Load route from URL

Internal functions exposed for routing (called by route.js):
- `window.archiveSwitchCabinet(index, options)`
- `window.archiveSetFilter(filter)`
- `window.archiveOpenSheet(id)` / `window.archiveCloseSheet()`
- `window.archiveOpenView(name)` / `window.archiveCloseView(name)`
- `window.archiveOpenDrawer(name)` / `window.archiveCloseDrawer()`
- `window.archiveOpenCheckout()` / `window.archiveCloseCheckout()`

## Examples

```
#armoire=2                              → Open cabinet 2
#armoire=1&filtre=eclat                 → Cabinet 1, sparkles only
#armoire=0&fiche=monstera-deliciosa     → Cabinet 0 with Monstera sheet
#vue=herbier                            → Herbarium view
#tiroir=collection                      → Collection drawer
#caisse=ouverte                         → Checkout open
```
