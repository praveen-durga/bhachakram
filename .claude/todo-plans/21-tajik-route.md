# Plan: Tajik route (Varshaphal / annual chart)

## Goal

New `/tajik` route with in-page tabs: "Current ATP" (Annual Tajik
Patrika/Prediction — the current running year's full annual reading) plus 9
decade tabs ("1 to 10" through "80 to 90"). Current ATP shows the annual
(Varshapravesh) chart with Muntha, planet details, Yogi/Avayogi, Mudda Dasha,
Patyayini Dasha, and a small Muntha-Lord/Year-Lord table. Each decade tab
shows a grid of that decade's 10 individual annual charts, each with its own
Muntha marked.

## Research summary (6 parallel agents + 3 follow-up searches - full source

lists are in each agent's transcript, condensed here)

- **Varshapravesh (annual chart)**: verified directly against PyJHora source
  (`drik.py`/`charts.py`/`tajaka.py`) since this project already treats JHora
  as its reference standard (Shadbala alignment). Sidereal Sun-longitude
  match (not tropical); birth location (not current); chart computed exactly
  like a normal D1 chart at the solar-return instant, no Tajik-specific
  Ascendant formula. Search = seed with sidereal year (365.256364d) ×
  elapsed years, then day-step + converge to the exact instant, adapting the
  existing `findMostRecentSankranti` binary-search shape (forward instead of
  backward, single target longitude instead of a periodic boundary).
- **Muntha**: sign-only (no degree), `(natalAscendantRasi + yearsElapsed) %
12`, 0-indexed (birth year = Muntha at natal Lagna itself) - confirmed
  directly in PyJHora's `tajaka.py`. One vedastro.org page claims a
  degree-bearing variant per B.V. Raman, but PyJHora and two independent
  calculator sites agree on sign-only; going with PyJHora's convention since
  it's this project's established reference.
- **Year Lord (Varsheshwar)**: classical Panchadhikari = 5 CANDIDATES (not 5
  co-equal office-bearers as originally assumed): Janma Lagna lord, Varsha
  Lagna lord, Muntha lord, Dina-Ratri Pati (Sun-sign lord if day return,
  Moon-sign lord if night), Tri-Rashi Pati (triplicity lord - full 12-sign
  day/night table sourced from Balabhadra's _Hayanaratna_, a classical Tajik
  text, via wisdomlib.org). Winner = highest Panchavargiya Bala (5-component
  strength: Kshetra/Uchcha/Hadda/Drekkana/Navamsa). **Simplification**: the
  classical rule also lets a valid Tajika aspect (with Deeptamsa orbs) to the
  Varsha Lagna override raw strength - that requires a whole separate orb
  table I haven't sourced, so this implementation uses pure highest-bala-wins
  and is flagged in the UI as a simplified contest, not full classical
  practice.
- **Panchavargiya Bala** (per candidate, max 80): Kshetra Bala (own sign=30,
  friendly=15, enemy=7.5, neutral treated as 15 - not explicitly covered by
  the sourced 3-tier table, my own reasonable fill), Uchcha Bala (continuous,
  20 × angular-distance-from-debilitation/180), Hadda Bala (own Egyptian
  term=15, friendly=7.5, enemy=3.75), Drekkana Bala (own D3 sign=10,
  friendly=5, enemy=2.5), Navamsa Bala (own D9 sign=5, friendly=2.5,
  enemy=1.25) - own/friend/enemy throughout uses BPHS natural relations
  (reusing `shadbala.data.ts`'s `NATURAL_RELATION`/`RASI_LORD`, not
  re-derived). Egyptian Terms (Hadda) table sourced from a Ptolemaic-terms
  reference (kerykeion.net) - cross-summed every sign to confirm each totals
  30° across exactly the 5 non-luminary planets before trusting it.
- **Yogi/Avayogi**: Yogi Point = (Sun+Moon+93°20') mod 360, Yogi Planet =
  standard Vimshottari nakshatra lord of that point (well-corroborated, 4+
  independent sources with a worked numeric example). Avayogi Point = Yogi
  Point + 93°20' (= Sun+Moon+186°40'), Avayogi Planet = nakshatra lord of
  that point (equally well-attested formula; picked nakshatra-lord over
  sign-lord for symmetry with Yogi, per the research agent's recommendation -
  sources are split on this one detail). Uses **natal** Sun/Moon, not the
  annual chart's - sources treat this as a natal/Jaimini technique with no
  attested "annual" variant, and since Yogi/Avayogi don't change year to
  year, showing them as a fixed reference alongside the annual chart is the
  sensible reading of the request.
- **Mudda Dasha**: turned out to be much simpler than assumed - it's just
  Vimshottari's fixed year-proportions compressed into a 360-day year (Sun
  18d, Moon 30d, Mars 21d, Rahu 54d, Jupiter 48d, Saturn 57d, Mercury 51d,
  Ketu 21d, Venus 60d - i.e. `VIMSHOTTARI_DASHA_YEARS[lord] * 3`, reusing the
  Dasha page's existing constant), same 9-lord cyclic order, but the
  _starting_ lord is the **annual chart's own Moon-nakshatra lord** (not
  natal). Antardasha subdivides the same proportional way as natal
  Vimshottari - the Dasha page's existing `subdivide()`-shaped logic applies
  almost directly, just with a 360-day root instead of 120-year and a
  different starting-lord rule.
- **Patyayini Dasha**: the actual points/degree-driven system (what I'd
  originally mis-assumed Mudda Dasha to be). 7 planets (Sun-Saturn, no
  nodes) + Lagna = 8 candidates. Order = ascending Krishamsha (degree-within-
  sign, 0-30°) in the annual chart. Patyamsha(1st/smallest) = its own
  Krishamsha; Patyamsha(n) = Krishamsha(n) - Krishamsha(n-1) for the rest.
  Duration(n) = Patyamsha(n) × 365.256363 / maxKrishamsha (telescopes so all
  8 durations sum to exactly one sidereal year - verified this algebraically).
  Antardasha(i,j) = MD(i) × MD(j) / 365. No "return"/relationship-based
  continuation rule found in any source despite a thorough search - strictly
  ascending, single pass; flagged as the sourced/standard version.

## Decisions

- **Navigation**: in-page tabs (`'current' | DecadeKey`), same
  `ButtonComponent` selected/unselected pattern as Vargas - no new routing
  pattern.
- **Decade tab layout**: grid of 10 mini `app-rasi-chart` tiles (one per
  year), reusing Ashtakavarga's grid CSS shape. Each tile only needs the
  chart + Muntha marker - no dasha/yogi/lords tables there (per the request,
  those are Current-ATP-only).
- **Muntha on the chart**: new `munthaRasi = input<number | null>(null)` on
  `RasiChartComponent`, mirroring the existing `dagdhaRasis` mechanism
  exactly (prepend a fixed marker label to whichever region matches) rather
  than generalizing both into one input - smaller, more surgical change.

## File structure

- `shared/services/ephemeris.service.ts` - new `findSolarReturn(natalSunLongitude,
targetYear, ayanamsa, lat, lng)` method, adapting `findMostRecentSankranti`'s
  day-step + binary-search shape (forward, single target, seeded by the
  sidereal year).
- `shared/ui/organisms/rasi-chart/` - `munthaRasi` input.
- `pages/tajik/tajik.model.ts` - `AnnualChart` (D1Chart + munthaRasi +
  varshapraveshInstant), `DecadeKey`, `PanchadhikariCandidate`,
  `YogiAvayogi`, dasha node types (reusing the Dasha page's `DashaNode`
  shape where possible).
- `pages/tajik/tajik.data.ts` - `TRI_RASHI_PATI` (day/night per rasi),
  `EGYPTIAN_TERMS` (Hadda table), `PANCHAVARGIYA_BALA_POINTS`.
- `pages/tajik/tajik-chart.util.ts` - Varshapravesh instant + chart build,
  Muntha, decade-year list.
- `pages/tajik/tajik-lords.util.ts` - Panchadhikari candidates,
  Panchavargiya Bala scoring, Year Lord selection.
- `pages/tajik/tajik-yogi.util.ts` - Yogi/Avayogi.
- `pages/tajik/tajik-dasha.util.ts` - Mudda Dasha + Patyayini Dasha
  (both Maha + Antar).
- `pages/tajik/tajik.component.ts/.html/.scss` - tabs, Current ATP layout,
  decade grid.
- `app.routes.ts` / `app.component.html` - new guarded route + nav link.

## Steps

1. DONE - Implemented per file structure above. `VIMSHOTTARI_DASHA_YEARS`/
   `VIMSHOTTARI_TOTAL_YEARS` relocated from `dasha.data.ts` to
   `ephemeris.util.ts` (Tajik's Mudda Dasha is a 2nd consumer). Reused
   `shadbala.data.ts`'s `NATURAL_RELATION`/`EXALTATION_LONGITUDE` via a
   direct cross-page import rather than relocating them too, given the
   overall scope - noted as a nice-to-have follow-up, not done now.
2. DONE - Verified `EGYPTIAN_TERMS` programmatically (not just by hand):
   all 12 signs sum to exactly 30° across exactly 5 distinct planets.
3. DONE - Verified in Node: Mudda Dasha day-sums to exactly 360 (and
   matches the classical Ketu21/Venus60/Sun18/Moon30/Mars21/Rahu54/
   Jupiter48/Saturn57/Mercury51 figures exactly), its Antardasha sums to
   its parent's own duration; Patyayini Dasha durations sum to exactly
   365.256363 days and its Antardasha likewise sums to its parent's own
   duration, with the "first AD = same lord as MD" case matching the
   sourced worked example's shape.
4. DONE - `findSolarReturn`'s search algorithm verified in Node against a
   synthetic linear Sun model: exact convergence (zero error) across
   multiple elapsed-year values (0/1/25/50/80) and edge cases (natal
   longitude near the 0°/360° wraparound, exactly at 180°) - the real bug
   caught here was in the TEST setup (wrong synthetic natal longitude), not
   the algorithm; fixed and re-verified.
5. DONE - `tsc --noEmit` and `ng build` both clean, including the new
   `tajik-component` chunk (~49 kB).
6. DONE - Updated `.claude/TASKS.md`, marked Status below.

## Simplifications and known gaps (flagged, not silently assumed)

- **Year Lord selection** uses pure highest-Panchavargiya-Bala-wins, not
  the full classical rule which also lets a valid Tajika aspect (with its
  own Deeptamsa orb table) to the Varsha Lagna override raw strength - that
  orb table wasn't sourced. Flagged with a `*` in the UI.
- **Panchavargiya Bala**'s "neutral" relation tier isn't covered by the
  sourced 3-tier (own/friend/enemy) point table - treated the same as
  friend, a reasonable fill rather than a sourced value.
- **Patyayini Dasha** overall has thinner sourcing than Mudda Dasha (mostly
  one blog, cross-checked against a named published author and a
  Raman-derived site) - flagged with a `*` in the UI.
- **Muntha** is sign-only (matching PyJHora), not degree-bearing (one
  source attributes a degree-bearing variant to B.V. Raman, but couldn't
  verify against Raman's original text directly).
- **Decade tab age labeling**: "1 to 10" covers ages 0-9 (the person's 1st
  through 10th year of life), every other decade's label matches its age
  range exactly (e.g. "10 to 20" = ages 10-19) - this was the only way to
  keep all 9 tabs' age ranges non-overlapping given the user's own labels
  reuse the "10" boundary between adjacent tabs.

## Follow-up: ATP rename, age selector, all-planet Bala, D9, Year Highlights

Second request: rename "Current ATP" -> "ATP"; replace the fixed
current-age-only view with an age `<app-select>` combo box (defaulting to
current age, options 0-99) driving the same full detail package for
whichever age is picked, cached per age (`#atpDataByAge`, mirroring the
existing per-decade cache); show Panchavargiya Bala for all 7 classical
planets, not just the 5 Panchadhikari role-candidates (which often repeat
the same lord); add the annual chart's own D9 (Navamsa) alongside the D1,
flagged `*` since it's the standard D9 technique applied to the annual
instant, not a distinct classical "Tajik varga" I could source; add a
"Year Highlights" card showing the Year Lord's and Muntha's house from
Varsha Lagna.

**"Year predictions" was explicitly NOT implemented as narrative text.**
Generating actual prediction prose (house impacts) would mean either
sourcing a large classical rule library (dozens of house/lord/aspect
combinations, none of which came up in the original research pass) or
fabricating plausible-sounding astrological claims with no textual basis -
the latter crosses from verifiable calculation into invented content, which
this project's whole approach (research every formula, flag uncertainty,
never guess a table) is built to avoid. Implemented the honest middle
ground instead: the Year Lord/Muntha house placements are real, sourced,
structurally-computed facts - the standard first step of Tajik
interpretation - clearly labeled as "not full predictive text" in the UI
itself so this scoping choice is visible to whoever reads the page, not
just this plan doc.

Refactored `calculatePanchavargiyaBala` (private, single-total) into
`calculatePlanetBala` (returns the full 5-component breakdown) so both the
existing 5-candidate scoring path and the new all-planet table reuse the
same underlying dignity functions - re-verified in Node afterward that
every component stays within its classical max and the breakdown sums to
`total` for all 7 planets.

DONE - `tsc --noEmit` and `ng build` both clean. Age-select wired via
`FormsModule`'s plain `[ngModel]`/`(ngModelChange)` signal binding, matching
the exact precedent already used for `app-select` outside a reactive form
(component-showcase's "Plain signal binding" example).

## Follow-up: layout tweaks, D4/D10 vargas, Avayogi bug fix

Third+fourth requests: increased chart sizing everywhere (ATP charts up to
34rem, decade grid changed from auto-fill to a fixed 4-per-row); reorganized
`.atp-details` into two explicit column wrapper divs (`.atp-details-primary`:
Planet Details + Panchavargiya Bala + a new `.atp-dasha-row` holding Mudda/
Patyayini Dasha side by side; `.atp-details-secondary`: Yogi/Avayogi, Year
Highlights, Panchadhikari); added D4 (Chaturthamsa) and D10 (Dasamsa) of the
annual chart alongside D9, reusing Vargas' own `buildVargaChart` directly
(deleted the page-local single-purpose D9 duplicate this created) rather
than re-deriving it.

**Avayogi formula was wrong, and my own research missed an already-verified
fix sitting in this same codebase.** `panchang.util.ts`/`panchang.data.ts`
already went through this exact mistake: Avayogi = Yogi Point + 93°20' again
(the formula my Tajik research concluded, sourced from web blogs) was tried
there too and found wrong against a real reported chart - the correct
formula is Avayogi = Sun + Moon + 3 x 93°20' (280°), not Yogi + 93°20' (which
is only Sun + Moon + 2 x 93°20', 186°40'). Should have grepped the codebase
for an existing Yogi/Avayogi implementation before trusting web research;
didn't, and shipped the same bug this project had already caught and fixed
once. Corrected by deleting `tajik-yogi.util.ts`'s own reimplementation
entirely and calling `panchang.util.ts`'s already-verified
`calculateYogiPoint`/`calculateAvayogiPoint` directly, so both pages can
never drift apart on this again.

Also switched Yogi/Avayogi from natal Sun/Moon to the ATP annual chart's own
Sun/Moon, per explicit correction - this reverses the "natal, since sources
describe it as a fixed Jaimini technique" call made during the original
research pass; the user's direct instruction overrides that inference.
Since `calculateYogiPoint`/`calculateAvayogiPoint` take a whole `D1Chart`,
this was a one-line change (pass `annualChart.chart` instead of natal
Sun/Moon longitudes).

Final layout pass: Panchavargiya Bala, Mudda Dasha, and Patyayini Dasha now
sit together as one full-width 3-column row (`.atp-dasha-row`, moved out of
`.atp-details-primary` back to a sibling of `.atp-details`) below the
Planet-Details/Yogi-Avayogi-Year-Highlights-Panchadhikari 2-column block,
since 3 wide tables side by side needed more room than the half-width
column could give them.

## Status

Implemented and building cleanly; core math (Mudda/Patyayini Dasha sums,
Egyptian Terms table, solar-return search algorithm, Yogi/Avayogi worked
example) verified in Node. Not yet verified in a live browser (chrome-
devtools access is off this session) - worth a manual check that the
Varshapravesh search converges quickly enough in the real ephemeris (not
just the synthetic Node model) and that the decade grid's 10 parallel
annual-chart calculations don't feel sluggish. 5. `tsc --noEmit` + `ng build` clean. 6. Update `.claude/TASKS.md`, mark Status below.

## Status

In progress.
