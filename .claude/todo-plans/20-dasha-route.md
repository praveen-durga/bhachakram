# Plan: Dasha route

## Goal

New `/dasha` route showing Vimshottari Dasha as an expandable 4-level tree
(Maha → Antar → Pratyantar → Sookshma), with 4 selectable variations that
change which nakshatra's lord starts the whole cycle: Janma (standard),
Kshema, Utpanna, Adhana.

## Decisions (confirmed with user, or defaulted + stated per CLAUDE.md #1

since the user waved off further questions and said proceed)

- **Variations**: Janma / Kshema / Utpanna / Adhana, confirmed by user.
  Reference nakshatra = Moon's janma nakshatra + offset (inclusive-counting
  "Nth star"): Janma=+0 (1st), Kshema=+3 (4th), Utpanna=+4 (5th), Adhana=+7
  (8th) - per Sanjay Rath's classical description (srath.com), corroborated
  by the standard 9-Tara category naming (Kshema is the 4th Tara). The
  **balance fraction always comes from the Moon's own position within its
  own natal nakshatra**, regardless of variation - only the starting LORD
  (and hence which of the 9 dasha lengths that balance is a fraction of)
  changes per variation. Adhana/Kshema/Utpanna are traditionally used for
  longevity (Ayurdaya) analysis, Janma for general life events - shown
  without editorializing, just as 4 selectable tabs.
- **Navigation**: in-page tabs (not sub-routes) - defaulted, since every
  other page in this app is a single flat route and this avoids introducing
  a new routing pattern for one feature.
- **Expand behavior**: inline accordion - clicking a row expands its 9
  children indented directly beneath it in the same table (defaulted, no
  tree/accordion component exists yet in shared/ui; building one here would
  be premature abstraction for a single consumer, so it's page-local).
- **Computation**: Maha level (9 periods) computed eagerly on load; Antar/
  Pratyantar/Sookshma computed lazily the first time a row is expanded, then
  cached on the node so re-collapsing/re-expanding doesn't recompute
  (defaulted - avoids ever computing the 9^4 potential Sookshma leaf rows
  before they're asked for).

## Algorithm (standard Vimshottari, well-established - no ambiguity)

- 9-lord cycle order and each lord's full dasha-years (reusing the existing
  `NAKSHATRA_LORD_CYCLE` order from `ephemeris.util.ts`, which already is
  exactly Ketu/Venus/Sun/Moon/Mars/Rahu/Jupiter/Saturn/Mercury): Ketu 7,
  Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19,
  Mercury 17 (sums to 120).
- One generic function subdivides ANY period into its 9 children: given a
  starting lord L, a start date S, and a total-years T, walk the 9-lord
  cycle starting at L, each lord's own share = T * (itsOwnFullYears / 120).
  This single function serves both the Maha level (T=120, L=starting lord
  from the variation) and every deeper level's children (T=parent lord's own
  full years, L=parent's own lord, S=parent's own start) - no special-casing
  needed between levels.
- Dasha balance at birth: elapsed fraction = how far the Moon has traveled
  through its own natal nakshatra (0-1). The conceptual start of the whole
  120-year Maha cycle = birth date minus (elapsed fraction × starting lord's
  full years) - i.e. run the generic subdivision function from that
  conceptual (possibly pre-birth) start for T=120, and the first generated
  Mahadasha naturally spans conceptualStart..conceptualStart+fullYears, with
  birth falling partway through it (the "balance"). No separate balance-only
  code path needed. The pre-birth portion of the first period is real/
  expected (same concept as "dasha balance" everywhere), shown as-is with a
  summary line above the table stating the balance in Y/M/D at birth for
  clarity.
- Reused as-is: `NAKSHATRA_LORD_CYCLE`, `getNakshatraLord`,
  `calculateNakshatra`, `findGraha`, `wallTimeToUtc`. `NAKSHATRA_SPAN` (only
  used internally, unexported) gets `export`ed (one-line, additive) since
  `dasha.util.ts` needs it for the elapsed-fraction calc - same "export a
  previously-private const for a new page" precedent as Ashtakavarga's
  `NORTH_REGION_POLYGONS`.
- New `addFractionalYears(date, years)` in `dasha.util.ts`, mirroring the
  existing `addFractionalMonths` pattern in `sade-sati.util.ts` (whole part
  steps the year field directly so leap years are handled naturally,
  fractional remainder converted via a 365.25-day average year).

## File structure (matches the established per-page convention)

- `pages/dasha/dasha.model.ts` - `DashaVariationKey`, `DashaVariationOption`,
  `DashaPeriod` (lord/start/end), `DashaNode` (period + level 0-3 + lazily
  populated `children: DashaNode[] | null`).
- `pages/dasha/dasha.data.ts` - `VIMSHOTTARI_DASHA_YEARS`,
  `DASHA_VARIATIONS` (the 4 tabs' key/label/nakshatra-offset),
  `DASHA_LEVEL_LABELS` (Maha/Antar/Pratyantar/Sookshma).
- `pages/dasha/dasha.util.ts` - `addFractionalYears`,
  `buildDashaBalance` (elapsed fraction + starting lord for a variation),
  `buildMahaDashaPeriods` (the T=120 root call), `buildChildPeriods` (any
  node's 9 children via the same generic subdivision), `formatDuration`
  (Y/M/D approximation for the balance summary line).
- `pages/dasha/dasha.component.ts/.html/.scss` - variation tabs
  (`ButtonComponent`, same selected/unselected pattern as
  `VargasComponent`), bespoke expandable `<table>` (flattened visible-rows
  `computed()` over a `Set` of expanded node ids + eager Maha / lazy deeper
  levels per above) - bespoke markup rather than the generic
  `TableComponent`, matching Planet Positions' precedent of hand-rolled
  `<table>` markup for its Navamsa Matrix/Bhava Positions sections (indent-
  per-level + expand chevron isn't something the generic column-based
  `TableComponent` supports).
- `app.routes.ts` / `app.component.html` - new guarded route + nav link,
  same pattern as every other page.

## Steps

1. DONE — Exported `NAKSHATRA_SPAN` from `ephemeris.util.ts`.
2. DONE — `dasha.model.ts` / `dasha.data.ts` / `dasha.util.ts` per above.
3. DONE — `dasha.component.ts/.html/.scss`.
4. DONE — Route + nav link.
5. DONE — `tsc --noEmit` clean; `ng build` clean (`dasha-component` chunk,
   18.27 kB). Verified the core algorithm in Node: `VIMSHOTTARI_DASHA_YEARS`
   sums to exactly 120; a full Maha-level `subdivide()` call produces the
   correct 9 lords in cycle order with years summing to exactly 120 and the
   last period's end matching start+120y; subdividing one Maha (Venus, 20y)
   into its 9 Antars sums to exactly 20y with each Antar's own proportional
   share (e.g. Venus's own Antar = 20×20/120 = 3.333y); a known Moon position
   exactly halfway through Krittika gives the expected Janma balance (Sun,
   3.0y = half of 6y) and the expected Kshema balance (reference nakshatra
   Ardra, lord Rahu, 9.0y = half of 18y) - confirming the offset/lord/balance
   wiring for both the standard and variation cases.
6. DONE — Updated `.claude/TASKS.md`, marked this plan Status below.

## Status

Implemented and building cleanly; core Vimshottari math verified in Node
(year-sum invariants, subdivision proportionality, Janma/Kshema balance
correctness). Not yet verified in a live browser (chrome-devtools access is
off this session) - worth a manual check that the accordion expand/collapse
reads well and the Antar/Pratyantar/Sookshma lazy computation feels
responsive at the deepest level.
