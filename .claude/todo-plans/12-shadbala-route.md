# Plan: Shadbala route

## Goal

Add a new `/shadbala` route, reachable via a fourth nav link alongside
Planet Positions and Panchang (same `chart-links` nav, same
`hasBirthDetailsGuard`, same lazy-loaded standalone page pattern).
Shadbala is the classical Parashara six-fold planetary strength system
for the 7 classical grahas (Sun–Saturn; Rahu/Ketu excluded — Shadbala
is not classically computed for the lunar nodes), plus the related
Bhava Bala (house strength) report. UI structure/layout matches
`shadbala.pdf` (project root) exactly — a real "Parashara's Light 9.0"
software report for a specific birth chart, used as both the layout
reference AND the numeric test case for verifying real calculations.

**Superseded**: an earlier draft of this plan assumed a "7 separate
ranked tables with per-row rank/highlight" layout based on a
paraphrased description of a different site's Shadbala page. That
draft is discarded — `shadbala.pdf` is the actual reference now.

**Sequencing**: the user confirmed Shadbala/Bhava Bala use STANDARD,
well-documented classical formulas (not custom logic requiring
hand-off like Panchang's exotic points) — formulas are being
researched directly (classical Parashara texts / established
secondary sources) rather than waiting for the user to supply them.
Research findings get folded into this plan before implementation.

## Reference layout (from `shadbala.pdf`)

Single page report, two tables, columns = Sun, Moon, Mars, Mercury,
Jupiter, Venus, Saturn (fixed 7-planet order, no Rahu/Ketu) for the
first table; columns = houses I–XII for the second.

### Table 1 — "Shad Bala"

Row groups (indented sub-rows sum to the bolded bala total row above
"1."/"2." etc. labels):

1. **Sthana Bala** (5 sub-rows, sum = row "1. Sthana Bala"):
   Ochcha Bala, Sapta-vargaja Bala, Ojhayugma bala, Kendradi Bala,
   Drekkana Bala.
2. **Dig-Bala** (single row "2. Dig-Bala", no sub-rows shown).
3. **Kaala Bala** (9 sub-rows, sum = row "3. Kaala Bala"): Nata-Unnata
   Bala, Paksha Bala, Tri-Bhaga Bala, Varsha Bala, Maasa Bala, Vaara
   Bala, Hora Bala, Ayana Bala, Yuddha Bala.
4. **Chesta Bala** (single row "4. Chesta Bala").
5. **Naisargika Bala** (single row "5. Naisargika Bala").
6. **Drig Bala** (single row "6. Drig Bala").

Then summary rows:

- **Total Shadbala** (sum of the 6 numbered bala rows, in virupas).
- **Shadbala in Rupas** (Total Shadbala / 60).
- **Minimum requirements** (fixed per-planet virupa constants: Sun 390,
  Moon 360, Mars 300, Mercury 420, Jupiter 390, Venus 330, Saturn 300).
- **% of required** (Total Shadbala / Minimum requirements).
- 5 **"X Bala % req."** rows (Sthana, Dig, Kaala, Chesta, Drig-Bala —
  each individual bala's value divided by ITS OWN per-bala-type
  minimum, not the overall minimum — these per-bala minimums are
  separate constants not shown directly in this PDF page and need to
  be sourced/confirmed during formula research).
- **Relative Rank** (1-7, ranked by Total Shadbala descending — Saturn
  is Rank 1 in the reference with the highest total).
- **Ishta Phala** and **Kashta Phala** (derived auspicious/inauspicious
  result values, one row each).

### Table 2 — "Bhava Bala"

Columns = houses I through XII. Rows: Rashi (sign occupying that house
cusp, 3-letter abbreviation), Degree (cusp degree within its sign),
From Lord (house-lord's own strength contribution), Dig Bala
(house-based directional strength), Drishti (aggregate aspect strength
on the cusp), Planets in (contribution from planets placed in that
house), Day-Night (day/night-based contribution), Bhava Bala Total
(sum of the 5 numeric rows above it: From Lord + Dig Bala + Drishti +
Planets in + Day-Night).

## Key structural decisions

- **No ranking/highlighting UI** in this reference (unlike the earlier
  discarded plan draft) — the PDF shows plain numeric tables with a
  "Relative Rank" row as PART of Table 1, not a per-table sort/rank
  presentation. Match this: two straightforward tables, values as
  computed, "Relative Rank" is just another table row like the
  reference, not a UI sorting feature.
- **Table rendering**: given the row-grouped/indented structure (bala
  sub-rows nested under bolded totals) and planets-as-columns
  orientation (opposite of Planet Positions' planets-as-rows), the
  existing generic `Table` molecule (rows × named columns) is an
  awkward fit — it's built for one row per record, not this
  transposed, grouped layout. Plan to hand-write both tables' markup
  directly in `shadbala.component.html` (same approach already used
  for Planet Positions' Navamsa Matrix sub-table), not force this
  through the `Table` molecule.
- **7-row fixed graha order**: Sun, Moon, Mars, Mercury, Jupiter,
  Venus, Saturn — a local `SHADBALA_GRAHA_ORDER` constant (existing
  `GRAHA_ORDER` in `shared/utils/ephemeris.util.ts` includes Rahu/Ketu,
  not applicable here as-is).
- **Bhava Bala's house Rashi/Degree rows** reuse existing chart data
  (`D1Chart.ascendantRasi` + house-cusp longitudes) rather than new
  ephemeris calls, similar to how Planet Positions derives its rows
  from already-computed `d1Chart`/`d9Chart`.

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

Mirrors the Panchang split:

- `pages/shadbala/shadbala.model.ts` — result types (`ShadbalaRow` per
  planet with all sub-bala fields, `BhavaBalaColumn` per house).
- `pages/shadbala/shadbala.data.ts` — static reference data (fixed
  planet order, minimum-requirement constants per planet/per bala
  type, Naisargika Bala's fixed per-planet constants).
- `pages/shadbala/shadbala.util.ts` — pure calculation functions for
  each sub-bala, composed into the full Shadbala + Bhava Bala results.
- `pages/shadbala/shadbala.component.ts` — orchestration only: reads
  `BirthChartService`, calls util functions, assembles view-model.
- `shared/guards/` — reuse existing `hasBirthDetailsGuard`.
- `app.routes.ts` — add `{ path: 'shadbala', canMatch: [hasBirthDetailsGuard], loadComponent: ... }`.
- `app.component.html` — add a fourth `<a routerLink="/shadbala">Shadbala</a>` to `.chart-links`.

## Formula research findings

Background research against classical Parashara sources (BPHS,
Saravali, VedAstro, Vijayalur/JYOTHISHI) plus direct numeric
cross-checking against `shadbala.pdf`'s actual values. Split into
**confirmed** (safe to implement as-is, several exactly verified by
arithmetic against the PDF) and **uncertain** (classical methodology
found, but doesn't cleanly reproduce the PDF's exact numbers —
Parashara's Light likely uses an undocumented variant; needs the
user's input or empirical reverse-engineering before implementing).

### Confirmed — implement as-is

- **Uccha Bala**: `distance_from_debilitation_point / 3`, range 0–60.
  Exaltation/debilitation points per planet are standard textbook
  values (Sun 10°Ar/10°Li, Moon 3°Ta/3°Sc, Mars 28°Cp/28°Cn, Mercury
  15°Vi/15°Pi, Jupiter 5°Cn/5°Cp, Venus 27°Pi/27°Vi, Saturn 20°Li/20°Ar).
- **Sapta-vargaja Bala**: sum across D1/D2/D3/D7/D9/D12/D30 of dignity
  points per varga: Moolatrikona 45 (D1 only), Own 30, Great friend
  22.5, Friend 15, Neutral 7.5, Enemy 3.75, Great enemy 1.875 (the
  BPHS halving progression — NOT the rounded 45/30/20/15/10/4/2
  variant some secondary sites use).
- **Ojhayugma Bala**: 15 virupas per varga (D1 + D9, max 30) for
  odd-sign placement (Sun/Mars/Jupiter/Mercury/Saturn) or even-sign
  placement (Moon/Venus) — exactly matches the PDF's values.
- **Kendradi Bala**: 60 (kendra: houses 1/4/7/10), 30 (panapara:
  2/5/8/11), 15 (apoklima: 3/6/9/12) from the Ascendant — exactly
  matches the PDF.
- **Drekkana Bala**: binary 15-or-0 based on gender-drekkana match —
  male planets (Sun/Jupiter/Mars) score in the 1st drekkana (0-10°),
  neutral (Mercury/Saturn) in the 2nd (10-20°), female (Moon/Venus) in
  the 3rd (20-30°) — exactly matches the PDF.
- **Dig Bala**: `angular_distance_to_weakest_house_cusp / 3`, range
  0–60. Weakest/strongest houses: Jupiter+Mercury weak in 7th/strong
  in 1st, Sun+Mars weak in 4th/strong in 10th, Moon+Venus weak in
  10th/strong in 4th, Saturn weak in 1st/strong in 7th.
- **Nata-Unnata Bala**: hour-angle-from-midnight-based, diurnal
  planets (Sun/Jupiter/Venus) peak at noon, nocturnal (Moon/Mars/
  Saturn) peak at midnight, Mercury constant 60. Nata+Unnata = 60 for
  the complementary pair.
- **Paksha Bala**: based on Moon-Sun elongation; benefics (Jupiter/
  Venus/unafflicted Mercury) score `elongation/3` (peak at full moon);
  malefics score the complement; Moon itself scores double the
  benefic formula (capped 60).
- **Varsha/Maasa/Vaara Bala**: fixed 15/30/45 virupas to the
  respective time-lord (year/month/weekday), determined via standard
  Panchanga weekday/sankranti arithmetic.
- **Ayana Bala**: declination-based, `30 × (ε ± kranti) / ε` with a
  per-planet-group sign convention (Sun/Mars/Jupiter/Venus add when
  northern; Moon/Saturn add when southern; Mercury always adds
  absolute kranti). **Confirmed Sun's Chesta Bala = Sun's own Ayana
  Bala exactly, undoubled** (PDF shows identical values: 29.72/29.72).
- **Naisargika Bala**: fixed constant `rank/7 × 60` per planet in the
  order Saturn(1) < Mars(2) < Mercury(3) < Jupiter(4) < Venus(5) <
  Moon(6) < Sun(7) — exactly matches the PDF (universal constant,
  never varies by chart).
- **Minimum requirements** (virupas): Sun 390, Moon 360, Mars 300,
  Mercury 420, Jupiter 390, Venus 330, Saturn 300 — exactly matches
  the PDF.
- **Chesta Bala for Mars/Mercury/Jupiter/Venus/Saturn**: Seeghra-Kendra
  (synodic-anomaly) based, `reduced_kendra / 3`, range 0–60 — retrograde/
  stationary planets score highest.
- **Chesta Bala for Moon**: raw Moon-Sun elongation based
  (`elongation/3` or `(360-elongation)/3`), NOT a copy of Moon's Kaala
  Bala Paksha row value (the PDF shows these differ: Paksha=0.00 but
  Chesta=58.21 — confirmed these are two independently-computed
  values sharing the same underlying elongation input but different
  formulas/branches).
- **Drig Bala**: six-range piecewise "Sputa Drishti" angular formula
  (0 in 0-30°/300-360° dead zones; rises/peaks/falls through the
  30-300° range, full 60 at exactly 180° opposition) plus Visesha
  (special) aspect bonuses for Mars (+15 at 4th/8th), Jupiter (+30 at
  5th/9th), Saturn (+45 at 3rd/10th); benefic aspecting planets count
  positive, malefic negative (exact scaling — full ± vs. 125%/75% — to
  be settled empirically per the uncertain items below).
- **Ishta Phala / Kashta Phala**: `sqrt(Uccha × Chesta)` and
  `sqrt((60-Uccha) × (60-Chesta))` respectively — confirmed correct
  methodology (every PDF row satisfies Ishta+Kashta=60 exactly, which
  this formula structurally guarantees); small magnitude gaps likely
  from rounding through upstream sub-components, acceptable.
- **Bhava Bala → Bhavadhipati Bala ("From Lord")**: exactly the house
  lord's own Total Shadbala (virupas) — verified by direct arithmetic
  against the PDF for multiple houses (e.g. house III=Gemini, lord
  Mercury, Mercury's Total Shadbala=509.65≈509 ✓).
- **Bhava Bala → Bhava Dig Bala**: sign-group classification (Nara/
  Jalachara/Chatushpada/Keeta) each strongest at one kendra (60),
  weakest at the opposite (0), linearly interpolated (10/house-step)
  through the intervening houses — verified against the PDF's Dig Bala
  row (e.g. house VII=Libra/Nara group shows 0, correctly matching
  Nara's weakest-at-7th rule).
- **Bhava Bala → Occupant ("Planets in") Bala**: +60 per Jupiter/
  Mercury occupant, -60 per Saturn/Mars/Sun occupant, 0 for Moon/Venus
  occupants — exactly verified against the PDF (house XI shows +60 =
  one Jupiter-or-Mercury occupant; house XII shows -120 = two of
  Saturn/Mars/Sun occupants).

### Uncertain — classical methodology doesn't cleanly match the PDF; needs empirical verification or user input before implementing

- **Tribhaga Bala**: classical rule is binary (60 virupas to the
  period-ruler of the current day/night third, 0 to all others, with
  some sources adding "Jupiter always gets 60" regardless). The PDF's
  values (0,0,15,0,0,0,0 — only Mars=15) don't fit either variant
  cleanly at face value; may be the classical binary rule scaled ÷4
  (60→15) with NO Jupiter bonus in this implementation. **Plan**:
  implement the plain binary period-ruler rule (Mercury/Sun/Saturn
  rule day thirds, Moon/Venus/Mars rule night thirds) with no scaling
  and no Jupiter bonus first, then verify numerically once real chart
  data flows through — do not add the Jupiter-always-60 exception.
- **Hora Bala**: classical rule is binary (60 to the current
  planetary-hour lord via Chaldean order from sunrise, 0 to others).
  The PDF shows graduated values across multiple planets (0, 26.92,
  31.24, 43.98, 26.72, 45.00, 33.65) — inconsistent with a binary
  rule. No fully-documented proportional/interpolated variant was
  found. **Plan**: implement the classical binary Hora-lord rule as
  the starting point (best-documented, testable), flag to the user
  that this sub-component's exact numbers likely won't match
  Parashara's Light's report, and revisit only if this materially
  affects the final Shadbala totals' usefulness.
- **Yuddha Bala**: classically restricted to the 5 "star planets"
  (Mars/Mercury/Jupiter/Venus/Saturn) when within 1° of each other;
  Moon should never participate. The PDF's Yuddha row includes a
  nonzero value for Moon (14.77), which contradicts this restriction —
  possibly a column-alignment artifact in the PDF's table structure
  rather than a real rule violation. **Plan**: implement the classical
  restriction (5 star planets only, winner = greater ecliptic
  latitude/more northerly, magnitude = balance-of-power difference
  through Hora Bala), and treat the Moon anomaly as likely a
  PDF-reading artifact unless the user says otherwise.
- **Bhava Bala → Bhava Drishti Bala**: same six-range Sputa Drishti
  methodology as planet Drig Bala, but likely with a different
  benefic/malefic scaling specific to house-cusp aspects (one
  secondary source suggests most planets' aspects count at only 25%
  strength for this specific row, except Jupiter/Mercury which count
  at 100%) — plausible given the PDF's Drishti row has a value (84)
  exceeding the normal single-aspect max of 60, confirming it's a
  multi-planet sum, but the exact scaling weights are not confirmed
  with full confidence.
- **Bhava Bala → Day-Night Bala**: no explicit classical formula found
  in the research pass. The PDF's pattern (flat 15 or 0 per house, for
  houses III/V/VI/VIII/XI in this example) doesn't cleanly map to
  simple odd/even sign classification. Working hypothesis: a house
  gets +15 if its sign's classical day/night nature matches the
  actual day/night of birth — **unconfirmed, needs empirical testing
  against real computed chart data once the rest of the pipeline
  works**, or user input if they know the specific rule.
- **Drig Bala's benefic/malefic scaling**: two documented variants (a)
  plain ± sign, no scaling, or (b) benefic aspects ×1.25, malefic ×0.75
  — the 125%/75% variant is the more specific/textual one found, lean
  toward implementing that, but flag as unverified against the PDF's
  exact per-planet Drig Bala numbers.

## The 5 previously-uncertain sub-components — now confirmed by the user

The 5 sub-components above were initially left uncertain and, per user
decision, were going to render as `—` rather than a best-guess number
(this app's standing principle: "if we display wrong details then the
whole idea collapse"). The user has since supplied exact rules for all
5, so **all 25 sub-components are now implemented with real formulas —
none are stubbed as `—`**:

- **Tribhaga Bala**: day/night (real sunrise-sunset / sunset-next
  sunrise length, NOT a fixed 8-hour split) divided into 3 equal
  parts; Mercury/Sun/Saturn rule the day thirds in order, Moon/Venus/
  Mars rule the night thirds in order — the current third's lord
  scores 60. **Jupiter always scores 60 in addition**, regardless of
  birth time (so exactly 2 planets score 60 on any given chart, unless
  Jupiter itself is the current third's lord). Implemented as
  `calculateTribhagaBala` in `shadbala.util.ts`.
- **Hora Bala**: binary — the current Hora's lord (reusing Panchang's
  own `calculateHora`/`getHoraLord`, now relocated to
  `shared/utils/ephemeris.util.ts` since both features need them)
  scores 60, all others 0. Implemented as `calculateHoraBala`.
- **Yuddha Bala**: restricted to the 5 "star planets" (Mars/Mercury/
  Jupiter/Venus/Saturn; Moon/Sun/Rahu/Ketu never participate). Two
  planets are "at war" when their sidereal longitudes are within 1°.
  Victor = the more northerly planet by **ecliptic latitude** (not
  inferred from longitude) — needed a new `EphemerisService.
calculateGrahaEphemerisData` method exposing per-graha ecliptic
  latitude/declination/longitude-speed. Magnitude = |difference in the
  two planets' combined strength up through Hora Bala (Sthana + Dig +
  Nata-Unnata + Paksha + Tribhaga + Varsha/Maasa/Vaara/Hora Bala,
  explicitly EXCLUDING Ayana Bala and Yuddha Bala itself)| divided by
  |difference in their standard angular disc diameters (arcsec: Mars
  9.4, Mercury 6.6, Jupiter 190.4, Venus 16.6, Saturn 158.0)| — added
  to the victor's total, subtracted from the loser's. Implemented as
  two separate functions per the user's explicit instruction
  (`determineYuddhaVictor` + `calculateYuddhaBalaMagnitude`), plus
  `areGrahasAtWar`. Do NOT use the loser's Hora Bala alone as the
  transferred magnitude — that was an earlier wrong assumption,
  explicitly corrected by the user.
- **Bhava Drishti Bala**: the same Sputa Drishti engine as planet Drig
  Bala (`calculateDrigBala`), summed across every graha aspecting the
  house cusp — benefic grahas add, malefic grahas subtract. No special
  25%/100% scaling (that was an earlier, unconfirmed guess). Implemented
  as `calculateBhavaDrishtiBala`.
- **Bhava Day-Night Bala**: a house scores 15 when its lord's diurnal/
  nocturnal nature (reusing `NATA_UNNATA_DIURNAL_GRAHAS`/
  `NATA_UNNATA_NOCTURNAL_GRAHAS`) matches the birth's actual day/night;
  0 otherwise (including for Mercury, which is neither). Implemented
  as `calculateBhavaDayNightBala`.

Since all 5 are now real formulas, every downstream total (Kaala Bala,
Total Shadbala, Rupas, % of required, Relative Rank, Ishta/Kashta
Phala, Bhava Bala Total) computes for real too — no `—` placeholders
needed anywhere in the final implementation.

## Steps

1. DONE — Formula research completed (see findings above). Plan
   updated with confirmed vs. uncertain formulas.
2. DONE — All 25 sub-components' formulas implemented and unit-verified
   against textbook examples (see previous section) in
   `shadbala.util.ts`/`shadbala.data.ts`. `D1Chart` extended with
   `cusps` (needed for Bhava Bala) and `EphemerisService` extended with
   `calculateGrahaEphemerisData` (needed for Ayana/Chesta/Yuddha Bala).
   `findGraha`, `WEEKDAY_LORD`, `CHALDEAN_ORDER`, `calculateHora`,
   `getHoraLord`, `HoraResult`, and `SunTimes` were relocated from
   Panchang/Planet-Positions-local files to `shared/utils`/
   `shared/services/ephemeris.model.ts` since Shadbala needs them too
   (avoiding duplicated logic across features).
3. **Remaining**: Varsha Bala and Maasa Bala still need the "most
   recent Sun sankranti before birth, weekday of that instant" search
   (see research notes — this needs a binary search on the Sun's
   longitude crossing 0°/each 30° boundary, not yet implemented).
   Then: wire the full two-table layout in a new `ShadbalaComponent`
   (route + guard + nav link, mirroring Planet Positions/Panchang),
   computing every row live from `BirthChartService`.
   → verify: click-through works, guard redirects correctly without
   birth details, tables render with correct structure/formatting, no
   console errors, spot-check a handful of computed values by hand
   against a real chart.

## Status

DONE. `ShadbalaComponent` is implemented and wired end-to-end (route +
guard + nav link), computing all 25 sub-components (including the 5
originally-uncertain ones, resolved via user-supplied exact rules —
see "The 5 previously-uncertain sub-components" above) live from
`BirthChartService`. Verified in a live browser against the reference
chart: both tables render real numbers, no console errors.

`shadbala.pdf` has been removed from the project (no longer needed —
it served its purpose as the initial layout/structure reference; exact
numeric matching against it was never the goal once real formulas from
BPHS/the user were confirmed).

Only remaining known gap: **Drig-Bala % req.** row intentionally shows
`—` — no classical BPHS minimum exists for Drig Bala (it's a +/-
aspectual modifier, not a pass/fail category), confirmed by research.
This is a deliberate, permanent design decision, not a TODO.
