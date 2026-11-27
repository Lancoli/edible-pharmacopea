# Archive Botanique — Guide UI : un cabinet de collectionneur

> **Status: in progress** — this design system file defines the application-specific UI rules for Archive Botanique.
> The common method for the whole portfolio is [../../docs/DESIGN-SYSTEM.md](../../docs/DESIGN-SYSTEM.md).
> Verify: `node tools/design-lint.mjs ArchiveBotanique` (from portfolio root).

---

## Portfolio UX rules

The **L1–L4** and **N1** rules (from [../../docs/UX-PRINCIPLES.md](../../docs/UX-PRINCIPLES.md)) apply to Archive Botanique as follows:

### L1 · No overlap

Two blocks never cover each other. A block that must sit over another is a **layer** (L2), and then the one below is dimmed or hidden.

**Check**: `audit-layout --strict`: overlaps = 0 and hidden-blocks = 0 on every route.

**Application-specific**:
- The cabinet (`.armoire`) is the main scene, never covered by UI
- Price tags (`.prix-tag`) float above tubes but are pointer-events: none (decorative layer)
- The table (`.table`) slides in next to the cabinet without overlapping it (scene width shrinks)
- Dialogs (`.vue`, `.fiche`, `.caisse`) open as full layers with backdrop

### L2 · One layer at a time

The layer ladder is fixed (scene < ui < dropdowns < modals < toasts < system). When a layer opens (dialog, sheet, cart), everything floating below it yields: hidden or dimmed to a backdrop with no pointer events.

**Check**: audit route with the layer open — no block of a lower layer intersects it unless dimmed.

**Application-specific layers** (from z-index structure):
1. **0**: Background (shadows, halos under elements)
2. **1**: Base content (ornaments, shelf structure, legends)
3. **2**: Interactive elements (tubes, buttons, navigation, price tags, labels)
4. **3**: Dropdowns (search results)
5. **4**: Sticky navigation (banner, console)
6. **5**: Reserved for modals (not currently used)
7. **6**: Toasts and notifications
8. **7**: System UI (safe-area, page grain)

**Yielding behavior**:
- When a dialog opens (`.vue[open]`, `.fiche[open]`, `.caisse[open]`), the page below is covered by `::backdrop`
- Search dropdown (`.recherche-res`) appears only when input is focused; closes on blur
- Toasts (`.toasts`) are always visible at z-index 6, never covered

### L3 · Reserved zones, not free placement

Each element has a zone chosen by its expansion axis and rank (DESIGN-SYSTEM rules 11–13). Users do not drag panels around to fix collisions: a collision is a layout bug, fixed in the layout.

**Application-specific zones**:

| Element | Zone | Expansion axis | Notes |
|---|---|---|---|
| **Banner** (`.bandeau`) | Top, sticky at `safe-area-inset-top` | Horizontal | Contains brand, navigation, tools; height `--h-bandeau` (61px desktop, 53px mobile) |
| **Console** (`.console`) | Below banner, sticky at `safe-area-inset-top + --h-bandeau` | Horizontal | Cabinet navigation (arrows, tabs, filters, search); shrinks on mobile |
| **Cabinet** (`.armoire`) | Center, flex: none | Vertical (scrolls) | The main scene; width shrinks when table is open (`100% - 420px` desktop) |
| **Table** (`.table`) | Right of cabinet, sticky at banner + console + 74px | Vertical | Tube detail card; width 400px; hidden on mobile and hover-less devices |
| **Search dropdown** (`.recherche-res`) | Below search input, right-aligned | Vertical (down) | Opens below `.recherche input`, max-width `calc(100vw - 32px)` |
| **Dialogs** (`.vue`, `.fiche`, `.caisse`) | Centered (auto margin) or right-aligned (`.caisse`) | Vertical (scroll inside) | Full-screen layers; `.caisse` slides from right on desktop |
| **Toasts** (`.toasts`) | Bottom center, `18px + safe-area-inset-bottom` | Vertical (stacks upward) | Fixed position, centered, width `min(440px, calc(100vw - 32px))` |

### L4 · Harmony

Space is balanced: inside a bar, header or button, space above = space below and left = right (± 2 px), from the spacing scale only (4 · 8 · 12 · 16 · 24 · 32). Equal-rank elements get equal sizes and gaps. Nothing "left over".

**Check**: `audit-layout`: imbalances = 0 (top vs bottom gap in bars and headers); `design-lint` for off-scale values.

**Application-specific spacing**:
- Banner (`.bandeau-in`): `padding-block: 10px` (balanced)
- Console (`.console-in`): `padding-block: 8px` (desktop), `6px` (mobile) — balanced
- Buttons (`.btn`): `padding: 10px 18px` — balanced
- Cabinet tabs (`.choix`): `padding: 9px 14px 8px` — ⚠️ **imbalance detected** (9px top, 8px bottom) → needs fixing
- Search input: `padding: 7px 12px` — balanced

**Spacing scale in use**:
- 2px: separators, fine strokes
- 4px: tight gaps (badge content, case gaps in herbarium)
- 6px: small gaps (puce filters, rarete pips)
- 8px: standard small gaps (console mobile, sections)
- 10px: standard medium gaps (buttons, inputs)
- 12px: standard medium gaps (column gaps, inline spacing)
- 14px: medium-large gaps
- 16px: large gaps (page padding via `max()`)
- 18px: section spacing
- 22px: nav links, console elements
- 24px: large section spacing, opening padding
- 26px: very large gaps
- 30px: section vertical spacing
- 32px: not used (available for very large spacing)

⚠️ **Off-scale values to review**:
- Some container query units (`.4cqw`, `.55cqw`) used for cabinet-relative sizing
- Some custom pixel values (34px, 38px, 44px for specific furniture dimensions)

### N1 · Deterministic navigation

Every screen state (view, open project, open panel, satellite, fold) is written in the URL and replayed by it. Same URL ⇒ same screen. Tests and audits navigate by URL only.

**Check**: routes list in `tests/routes.json` replayed by `audit-layout`; a route that does not replay is an error.

**Current state**: ⚠️ **Not implemented**
- Archive Botanique currently has **no routing system**
- All state is client-side only (selected cabinet, open dialogs, filters, search)
- Refreshing the page loses all state
- Sharing a specific view is impossible

**Required implementation** (for N1 compliance):
- Hash-based routing (model: [Hal/docs/routing.md](../../Hal/docs/routing.md))
- URL parameters to encode:
  - `cab`: selected cabinet (1-4)
  - `spec`: open specimen (by ID)
  - `view`: open view (`reg` for registry, `herb` for herbarium)
  - `cart`: cart dialog open (boolean)
  - `search`: search query
  - `filter`: active filter

**Example target URLs**:
- `#/` — homepage, cabinet 1
- `#/?cab=2` — cabinet 2
- `#/?cab=3&spec=142` — cabinet 3, specimen 142 open
- `#/?view=reg` — registry dialog open
- `#/?cab=1&filter=r4` — cabinet 1, rarity 4 filter active

---

## 1. Identity and baseline

**The collector's cabinet** (`.armoire`) is the identity: a dark wood cabinet with neon lights, displaying tubes of botanical specimens. The interface is a night archive room with brass accents, parchment cards, and dark panelling.

**Color palette** (from `:root`):
- `--hue: 42` (warm brass)
- Dark backgrounds: `--nuit`, `--boiserie`, `--mousse`
- Brass accents: `--laiton`, `--laiton-clair`, `--laiton-sombre`
- Parchment: `--parchemin`, `--parchemin-ombre`
- Neon: `--neon` (green accent for cabinet lights)
- Rarity colors: `--r1` through `--r5`

**Typography**:
- All system-ui stack (no custom fonts loaded)
- Three semantic families: `--f-titre`, `--f-latin`, `--f-texte`, `--f-etiq` (all map to system-ui)
- Three sizes: `--fs-small` (12px), `--fs-base` (16px), `--fs-large` (28px)
- One letter-spacing: `--letter-spacing-uppercase` (.08em)

**Shadows**: three levels
- `--shadow-tight`: subtle lift (buttons)
- `--shadow-wide`: strong separation (cards, dialogs)
- `--shadow-layered`: medium depth (overlays)

---

## 2. Components

(To be completed: button variants, card types, navigation patterns)

---

## 3. Maintenance and audit

**Baseline** (from `docs/design-baseline.json`):
- Recorded: 27/11/2026
- Violations tracked; design-lint must not regress

**Verification**:
- `node tools/design-lint.mjs ArchiveBotanique` (from portfolio root)
- Skill `verifier-design` for detailed analysis
- Skill `check-overlap` for L1/L2/L4 compliance

**Next steps**:
1. Implement deterministic navigation (N1)
2. Fix spacing imbalances (L4: `.choix` padding)
3. Create tests/routes.json and audit-layout integration
4. Document component catalogue (section 2)
