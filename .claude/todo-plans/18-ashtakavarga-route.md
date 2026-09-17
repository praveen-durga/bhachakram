# Plan: Ashtaka Varga route

## Goal

New `/ashtakavarga` route displaying Sarvashtakavarga (SAV) and each of the 7
planets' Bhinnashtakavarga (BAV), rendered as North-Indian-style mini charts
(one bindu count 0-8 per house, per the user's request to "display in form
of charts"). Standard Parashara scheme: 8 contributors (Sun, Moon, Mars,
Mercury, Jupiter, Venus, Saturn, Lagna), 7 target planets (Rahu/Ketu excluded
— not part of the classical 8-contributor scheme; this exclusion is also
what makes the well-known 337-point SAV total correct).

## Data verification

The classical bindu-contribution tables (which houses, counted from each of
the 8 contributors, receive a bindu in a given planet's own Bhinnashtakavarga)
are transcription-sensitive — no primary BPHS text with the literal tables
was fetchable (archive.org's BPHS text truncates before reaching the
Ashtakavarga chapters' tables). Verified instead via:

1. Two independent secondary sources (myzodiaq.in step-by-step guide,
   vedastro.org "Mastering Ashtakavarga" series) transcribed all 7 tables.
2. Cross-checked every row's count against the well-known classical per-planet
   totals (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52,
   Saturn 39 — summing to 337, the standard total quoted everywhere in the
   literature for Ashtakavarga excluding Lagna/Rahu/Ketu).
3. Found and resolved 2 single-cell discrepancies this way: Moon's Lagna row
   (one source listed 5 houses incl. 12, which oversums to 50; the correct
   4-house row excluding 12 was confirmed by a second, independent fetch of
   the same site's dedicated Moon article) and Venus's Lagna row (one source
   listed 7 houses excl. 11, undersumming to 51; the correct 8-house row
   including 11 was confirmed by a targeted second fetch). All other 54
   table cells (of 56 total: 7 planets x 8 contributors) matched exactly
   across both independent sources on the first pass.
4. Validated the full data set + calculation logic in Node: all 7 tables'
   row-sums match their expected totals exactly, and a 2,000-trial random
   sweep (random rasi position per contributor) confirms SAV's total is
   invariantly 337 and every BAV/SAV cell stays in its valid range (0-8 per
   planet per sign, 0-56 for SAV per sign) — this is a structural invariant
   of the table (each planet always redistributes its fixed total among the
   12 signs), not something that depends on chart data, so this validates
   the arithmetic/logic rather than any specific chart.

## Chart rendering

The existing `app-rasi-chart` component (`shared/ui/organisms/rasi-chart`)
is hard-wired to graha name+degree labels — no slot for an arbitrary
per-house number. Rather than duplicate its sizeable SVG geometry (12 region
polygons + 12 label positions), the plan is:

- Export the existing `NORTH_REGION_POLYGONS` / `NORTH_RASI_LABEL_POSITIONS`
  consts from `rasi-chart.component.ts` (currently unexported module-private
  consts — adding `export` is the only change to that file).
- New page-local `pages/ashtakavarga/ashtakavarga-chart.component.ts/.html/.scss`
  — imports those geometry consts, adds its own centroid position list for
  centering a single bold bindu digit per region (the existing graha-label
  positions are tuned as stacking start-points for multi-line text, not
  centered single digits, so reusing them as-is would look off-center).
  Inputs: `ascendantRasi: input.required<number>()`,
  `bindusByRasi: input.required<number[]>()` (index 0=Aries..11=Pisces),
  mirroring the same `(ascendantRasi - position) % 12` house-mapping formula
  `app-rasi-chart` already uses, so behavior for "which sign sits in which
  house" is identical between the two components.
- This is page-local for now (single consumer), consistent with the
  session's "relocate to shared only when a 2nd/3rd feature needs it"
  precedent.

## File/folder structure (SRP, per `.claude/PROJECT.md`)

- `pages/ashtakavarga/ashtakavarga.model.ts` — `AshtakavargaPlanet`,
  `AshtakavargaContributor`, `BhinnashtakavargaChart`,
  `SarvashtakavargaChart` types.
- `pages/ashtakavarga/ashtakavarga.data.ts` — `BAV_CONTRIBUTION_HOUSES`
  (the verified 7x8 table), `ASHTAKAVARGA_PLANETS` order array.
- `pages/ashtakavarga/ashtakavarga.util.ts` — `buildBhinnashtakavargaCharts`,
  `buildSarvashtakavargaChart`, pure functions over `D1Chart`, reusing
  `findGraha` from shared utils for contributor rasi lookups.
- `pages/ashtakavarga/ashtakavarga-chart.component.ts/.html/.scss` — the
  mini-chart renderer described above.
- `pages/ashtakavarga/ashtakavarga.component.ts/.html/.scss` — page
  orchestration: `d1Chart` signal from `BirthChartService`, `computed()`
  BAV chart list + SAV chart, grid layout (SAV first/larger, then 7 BAV
  mini-charts labeled by planet + total bindus) reusing the `.charts`/
  `.chart-item`/`.chart-title` class names already established by Vargas
  for visual consistency, adapted to a wrapping grid (8 items vs. Vargas' 2).
- `app.routes.ts` / `app.component.html` — new guarded route + 9th nav link.

## Steps

1. DONE — Verified the 7 bindu-contribution tables against 2 independent
   sources + the classical per-planet totals; resolved 2 discrepancies.
2. DONE — Validated table arithmetic and SAV/BAV calculation logic in Node
   (exact totals, 2,000-trial invariant sweep).
3. DONE — Implemented per the file structure above.
4. DONE — `tsc --noEmit` clean; `ng build` clean for the new route (the
   `anyComponentStyle` budget errors the build reports are pre-existing,
   confirmed via `git stash` to occur identically on an unmodified tree —
   unrelated to this feature, not touched here).
5. DONE — Updated `.claude/TASKS.md` and `REFERENCES.md`.

## Follow-up: Lagna BAV + layout (2nd request)

The user asked to add an 8th BAV chart for Lagna (Ascendant) and lay out the
8 BAV mini-charts 4-per-row over 2 rows, with SAV enlarged to span both rows
in height and the BAV mini-charts enlarged too.

- **Lagna BAV is not a classical target.** Researched thoroughly (multiple
  searches + fetches, including a direct check of the two sources already
  used for the verified 7-planet tables): Lagna only ever appears as one of
  the 8 _contributors_ in the classical Parashara scheme — no source
  presents a genuine "Lagna's own Bhinnashtakavarga" table the way the 7
  planets have one, and there's no known reference total to cross-check
  arithmetic against (unlike the 7 planets' 48/49/39/54/56/52/39). Flagged
  this to the user via `AskUserQuestion` rather than silently fabricating or
  silently omitting it; the user chose "best-effort, flagged with *" —
  implement using the values found (pieced together from secondary-source
  fragments, not one cited table), marked in the UI with the same `*`
  "not from a primary classical source" convention already used for
  Indu Lagna and Vargas' D3J/D3S. Its row sums to 51 (informational
  only — not a verified/classical total).
- `AshtakavargaTarget` type now covers all 8 bodies (7 planets + Lagna) as
  both contributor and target roles (previously `AshtakavargaPlanet`
  excluded Lagna as a target). `ASHTAKAVARGA_PLANETS` (7, feeds the SAV sum,
  keeps the 337 total exact) is now distinct from `ASHTAKAVARGA_DISPLAY_TARGETS`
  (8, feeds the BAV chart grid) — `buildSarvashtakavargaChart` explicitly
  filters to `ASHTAKAVARGA_PLANETS` so Lagna's best-effort chart can never
  silently leak into the classically-exact SAV total. Re-ran the Node sweep
  with Lagna included as a target: SAV total is still invariantly 337
  (excluding Lagna) across 2,000 random trials, and Lagna's own BAV stays
  in range and totals 51 every time.
- **Layout**: CSS Grid, `grid-template-columns: minmax(20rem,1.6fr) repeat(4, minmax(12rem,1fr))`,
  SAV chart-item explicitly placed at `grid-column: 1 / grid-row: 1 / span 2`;
  the 8 BAV chart-items are left unplaced and auto-flow into columns 2-5,
  which — because column 1 is reserved by SAV's row-spanning cell — the
  browser's grid auto-placement fills as 4-per-row over exactly 2 rows
  without any manual per-item row/column math. Both `app-rasi-chart`-style
  SVGs are already `width:100% height:auto` (viewBox-scaled), so allocating
  more grid-column width automatically enlarges the rendered chart — no
  changes needed inside `ashtakavarga-chart.component.*` itself. Collapses
  to a single column below 768px.

## Status

Implemented and building cleanly. Bindu tables validated end-to-end (2
independent sources + arithmetic/invariant checks in Node) for the 7 planets;
Lagna's BAV is explicitly best-effort/unverified per the user's choice, and
flagged as such in the UI and here. Not yet verified in a live browser
(chrome-devtools access is off this session).
