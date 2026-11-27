# Archive Botanique — UI Guide: a collector's cabinet

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

**Current state**: ✓ **Implemented** (27/11/2026)
- Hash-based routing system active (see [docs/routing.md](routing.md))
- URL parameters encode all visible state:
  - `armoire`: selected cabinet (0-3)
  - `filtre`: active filter (dispo, eclat, petit, rare)
  - `fiche`: open specimen sheet (by ID)
  - `vue`: open view (herbier, registre)
  - `tiroir`: open drawer (fournitures, collection, quarantaine)
  - `caisse`: checkout open (ouverte)
- Personal data (cart, herbarium, sap) remains in localStorage
- Bidirectional sync: URL → state AND state → URL
- Back/forward navigation replays full state

**Example URLs**:
- `#armoire=2` — cabinet 2
- `#armoire=1&filtre=eclat` — cabinet 1, sparkles only
- `#armoire=0&fiche=monstera-deliciosa` — cabinet 0, Monstera sheet open
- `#vue=herbier` — herbarium view
- `#caisse=ouverte` — checkout open

**Next steps**:
- Create `tests/routes.json` for audit coverage
- Integrate with layout audit tool

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

## 2. Component catalogue

### 2.1 Navigation

#### Banner (`.bandeau`)
Top sticky navigation bar with brand, tools, and cart.

**Anatomy**:
- `.bandeau-in`: inner container with padding
- `.marque`: brand logo and name (clickable, returns to cabinet view)
- `.outils`: right-aligned tools (neons switch, sap badge, cart button)

**Variants**:
- None (single layout, responsive)

**Usage**: Always present, sticky at top; height `--h-bandeau` (61px desktop, 53px mobile)

#### Console (`.console`)
Cabinet navigation with tabs, arrows, filters, and search.

**Anatomy**:
- `.console-in`: inner container with padding
- `.fleche`: left/right arrows for cabinet navigation
- `#choix-armoires`: cabinet tabs container (role="tablist")
- `.choix`: individual cabinet tab (role="tab")
- `#filtres`: filter buttons container
- `.recherche`: search input with dropdown

**Variants**:
- Mobile: compact layout, some elements hidden or stacked

**Usage**: Sticky below banner; shrinks on mobile; contains all cabinet-level controls

#### Cabinet tabs (`.choix`)
Individual cabinet selection button with number, name, and herbarium progress.

**Anatomy**:
- `.choix-num`: cabinet number
- `.choix-nom`: cabinet name
- `.choix-compte`: count of specimens in herbarium
- `.choix-barre`: progress bar

**Variants**:
- `[aria-selected="true"]`: active tab (highlighted border, neon accent)

**Usage**: One per cabinet; color accent via `style="--c: {neon}"`

### 2.2 Cabinet display

#### Cabinet (`.armoire`)
Main specimen display scene with shelves, tubes, and ornaments.

**Anatomy**:
- `#armoire-img`: background image of the cabinet
- `#contenu`: dynamic content (shelves, tubes, ornaments)
- `.ratelier`: shelf structure
- `.tube`: specimen tube button
- `.cloche-btn`: specimen under bell jar
- `.ornement`: decorative objects (books, magnifier, jar)

**Variants**:
- `.nuit`: neons off (darkened, only sparkles visible)
- `.avec-table`: table is open (cabinet width shrinks)

**Usage**: Central scene; tubes are clickable; supports swipe/arrow navigation

#### Tube (`.tube`)
Specimen display on shelf.

**Anatomy**:
- `.halo`: glow effect behind tube
- SVG: tube drawing
- `.badge-epuise`: "out of stock" badge (if applicable)
- `.paillettes`: sparkle animation (if `eclat`)

**Variants**:
- `.r1` to `.r5`: rarity classes (color accent)
- `.eclat`: sparkle variant
- `.epuise`: out of stock (dimmed)
- `.estompe`: filtered out (reduced opacity)
- `.choisi`: selected (on table)

**Usage**: Positioned absolutely on shelf via `style="left: X%; bottom: Y%"`; click opens sheet or sets on table

#### Table (`.table`)
Specimen detail card shown on wide screens when hovering/clicking tubes.

**Anatomy**:
- `#table-tube`: tube visualization
- `#carte`: detail card with specimen info
- `.etq-*`: various label fields (number, latin name, french name, rarity, text, origin, stock, price)
- `.etq-ouvrir`: "open full sheet" button

**Variants**:
- `.eclat`: sparkle background effect

**Usage**: Sticky at right; appears when tube is clicked on desktop; hidden on mobile

### 2.3 Dialogs and views

#### Sheet (`.fiche`)
Full-screen specimen detail dialog.

**Anatomy**:
- `.fiche-corps`: main container
- `.visionneuse`: left side with tube/bell jar visualization
- `.nav-fiche`: previous/next navigation
- `.feuille-fiche`: right side with detailed information
- `.formats`: format selection (cutting vs rooted)
- `.fiche-actions`: add to cart or reminder buttons

**Variants**:
- `.eclat`: shimmer effect on card

**Usage**: Opened via `showModal()`; supports keyboard navigation (arrows for prev/next, Escape to close)

#### Checkout (`.caisse`)
Cart and checkout dialog.

**Anatomy**:
- `.caisse-corps`: main container
- `.caisse-tete`: header with title and count
- `.caisse-lignes`: cart items list
- `.ligne`: individual cart item (tube visualization, name, price, quantity controls)
- `.caisse-pied`: totals footer
- `.commande`: shipping form (when in order mode)

**Variants**:
- Empty cart: `.caisse-vide`
- Sealed (order placed): `.scelle`

**Usage**: Opened via button in banner; modes: 'liste' (cart), 'commande' (checkout), 'scelle' (sealed)

#### View (`.vue`)
Full-screen view for herbarium or registry.

**Anatomy**:
- Herbarium (`#vue-herbier`):
  - `#herbier-bilan`: stats header (count, sap gauge)
  - `#planches`: plate sections
  - `.planche`: cabinet plate
  - `.case`: specimen cell (pressed specimen drawing)
- Registry (`#vue-registre`):
  - `#registre-table`: sortable table of all specimens
  - `.armoire-sep`: cabinet separator row

**Variants**:
- `.case.possede`: specimen in herbarium (colored)
- `.case.cachee`: secret specimen (hidden until unlocked)
- `.planche.complete`: all specimens collected (badge)

**Usage**: Full-screen overlay; opened via links or buttons; closes on Escape or backdrop click

#### Drawer (`.tiroir-dialog`)
Modal dialog for supplies, collection, or quarantine.

**Anatomy**:
- `.tiroir-corps`: main container
- Content varies by type:
  - Supplies: `.fournitures` (list of items to purchase)
  - Collection: `.secrets` (secret specimens) or `.cadenas` (locked state)
  - Quarantine: `.decompte` (countdown timer) + `.rappel` (notification form)

**Variants**: None (content-driven)

**Usage**: Three types opened by bottom buttons; closes on backdrop or close button

### 2.4 Forms and buttons

#### Button (`.btn`)
Primary action button.

**Anatomy**: Text or text + price

**Variants**:
- `.btn-creux`: outline style (secondary action)
- `.btn-caisse`: cart button in banner (with counter badge)

**Usage**: Primary actions (add to cart, submit, confirm); `--shadow-tight` on hover

#### Filter pill (`.puce`)
Small filter toggle button.

**Anatomy**: Text label

**Variants**:
- `[aria-pressed="true"]`: active state (filled background, brass color)

**Usage**: Filter row in console; multiple can be active (mutually exclusive in current implementation)

#### Switch (`.interrupteur`)
On/off toggle for neons.

**Anatomy**:
- `.interrupteur-levier`: sliding indicator
- Text label

**Variants**:
- `[aria-pressed="true"]`: on state
- `[aria-pressed="false"]`: off state

**Usage**: Banner tools; toggles neon lights in cabinet

#### Search (`.recherche`)
Search input with dropdown results.

**Anatomy**:
- `#recherche`: input field
- `#recherche-res`: results dropdown (`.recherche-res`)

**Variants**:
- Results shown: `[hidden="false"]`
- No results: empty state message

**Usage**: Console navigation; searches latin names, french names, families; min 2 chars; Escape to close

### 2.5 Indicators and badges

#### Rarity (`.rarete`)
Rarity level indicator with pips and label.

**Anatomy**:
- `.pips`: 5 dots (filled = rarity level)
- `.rarete-nom`: rarity name text

**Variants**:
- `.r1` to `.r5`: rarity classes (1-5 stars)

**Usage**: Shown on cards, sheets, registry table

#### Sparkle marker (`.marque-eclat`)
Badge for sparkle/variegated specimens.

**Anatomy**: Text "éclat" with accent color

**Variants**: None

**Usage**: Shown next to rarity on sheets and cards; indicates double sap value

#### Sap gauge (`.seve-jauge`)
Progress bar for sap collection milestones.

**Anatomy**:
- `.seve-titre`: header with current sap count
- `.seve-tube`: visual gauge (filled bar)
- `.paliers`: milestone list

**Variants**:
- `.palier.atteint`: milestone reached (highlighted)

**Usage**: Herbarium view header; shows progress toward rewards

#### Toast (`.toast`)
Temporary notification message.

**Anatomy**: HTML text content

**Variants**: None

**Usage**: Auto-dismiss after 4.3s; stacks upward from bottom-center; shown for cart adds, milestones, errors

### 2.6 Data display

#### Registry table (`.registre-table`)
Sortable table of all specimens.

**Anatomy**:
- `<thead>`: column headers with sort buttons
- `<tbody>`: specimen rows
- `.armoire-sep`: cabinet separator rows

**Variants**:
- `.estompe`: filtered out row (reduced opacity)
- `[data-actif]`: active sort column (asc/desc arrow)

**Usage**: Full-screen view; click headers to sort; click specimen to open sheet

#### Herbarium plate (`.planche`)
Grid of pressed specimens for one cabinet.

**Anatomy**:
- `.planche-tete`: header with cabinet name and progress
- `.cases`: grid of specimen cells
- `.case`: individual specimen cell

**Variants**:
- `.planche-secret`: secret drawer plate
- `.planche.complete`: all specimens collected (brass plate badge)

**Usage**: Herbarium view; one per cabinet; shows collection progress

#### Pressed specimen (`.case`)
Cell in herbarium plate with pressed plant drawing.

**Anatomy**:
- `.case-num`: specimen number
- `.case-compte`: quantity badge (if owned multiple times)
- SVG: pressed plant drawing
- `.case-nom`: abbreviated latin name

**Variants**:
- `.possede`: owned (colored, clickable)
- `.eclat`: sparkle variant (gradient background)
- `.cachee`: secret/hidden (placeholder until unlocked)

**Usage**: Click to open specimen sheet; color indicates ownership

### 2.7 Measurements and tokens

**Token reference** (from `archive.css`):
- Spacing: 2, 4, 6, 8, 10, 12, 14, 16, 18, 22, 24, 26, 30 px
- Shadows: `--shadow-tight`, `--shadow-wide`, `--shadow-layered`
- Colors: 42 hue variations, rarity scale (r1–r5), semantic (laiton, parchemin, mousse, nuit)
- Typography: 3 sizes (12, 16, 28px), 1 letter-spacing (.08em)
- Z-index: 0 (shadows) → 1 (content) → 2 (interactive) → 3 (dropdowns) → 4 (sticky) → 6 (toasts) → 7 (system)

**Component-specific measurements**:
- Banner height: 61px desktop, 53px mobile (`--h-bandeau`)
- Console height: varies (compact on mobile)
- Table width: 400px fixed (desktop only)
- Dialog max-width: 920px (sheets), 600px (checkout), 100vw (views)
- Toast width: min(440px, calc(100vw - 32px))
- Cabinet aspect: responsive (image-driven)

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
