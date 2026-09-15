# Plan: D9 (Navamsa) and D1 Bhava Chalit charts, side by side with D1

## Goal

Display three charts side by side on the chart page: D1 (Rasi, already built),
D9 (Navamsa), and D1 Bhava Chalit (house-cusp-based, not whole-sign). Each
chart gets a small title above it. Responsive: side by side on desktop,
stacked on mobile. Generalize the existing North Indian chart component to
accept a `chartStyle` input (`'north' | 'south' | 'east'`) so it can be
reused across D1/D9/Bhava Chalit and, later, South/East Indian styles
(South/East geometry itself stays out of scope until reference images are
provided, per the earlier pause).

## Key technical decisions (verified)

- **D9 (Navamsa) rule**: each 30° rasi splits into 9 navamsas of 3°20'. The
  resulting navamsa rasi depends on the origin rasi's modality:
  movable (Aries/Cancer/Libra/Capricorn) → navamsa count starts from the same
  rasi; fixed (Taurus/Leo/Scorpio/Aquarius) → starts from the 9th rasi from
  it; dual (Gemini/Virgo/Sagittarius/Pisces) → starts from the 5th rasi from
  it. Verified by hand-checking textbook reference points (Aries's own first
  navamsa = Aries; Taurus's first navamsa = Capricorn; Gemini's first
  navamsa = Libra) against the formula.
- **D1 Bhava Chalit house system**: Sripati (`hsys = 'S'`), confirmed
  supported directly by swisseph-wasm via `swe.house_name('S') === 'Sripati'`.
  Bhava Chalit differs from whole-sign D1 in which HOUSE a planet falls into
  (based on cusp midpoints), not which RASI it's in — the rasi stays the
  planet's actual sidereal rasi; only the house-region-to-rasi assignment
  changes to follow cusp boundaries instead of whole 30° signs.
- **Chart component API**: generalize
  `RasiChartNorthIndianComponent` → a `chartStyle` input
  (`'north' | 'south' | 'east'`, default `'north'`) on a renamed
  `RasiChartComponent`. Internally keeps one geometry table per style; only
  `'north'` is implemented (the existing verified geometry), `'south'`/
  `'east'` remain unbuilt until reference images are available (per the
  earlier-paused step 7 of the D1 chart plan).

## Steps

1. **Navamsa calculation**: DONE — `calculateD9Rasi()` in
   `shared/utils/ephemeris.util.ts`.
   → verify: DONE — matched textbook reference points, and confirmed live
   in-browser (Sun at 256.52° sidereal → D9 rasi 4, matching hand calc).

2. **Bhava Chalit calculation**: DONE —
   `EphemerisService.calculateBhavaChalitChart()`, using
   `swe.houses_ex(jd, flags, lat, lng, 'S')` (Sripati) + a cusp-span lookup
   (`#houseForLongitude`) handling the 360° wraparound.
   → verify: DONE — confirmed the Ascendant always resolves to house 1
   (guaranteed by construction: it always falls between cusp 1 and cusp 2).

3. **Data shape**: DONE — Bhava Chalit reuses the exact `D1Chart` shape,
   with `rasi` repurposed to mean "house index" (0-indexed) instead of
   "sidereal rasi" for this one chart. The renderer doesn't need to know the
   difference — it always places grahas into 12 sequential fixed regions
   starting from index 0 = the Ascendant's own region, whether that index
   means rasi or house.
   → verify: DONE — no renderer changes needed; confirmed via live chart
   screenshots showing correctly distinct house-number sequences for D1 vs.
   Bhava Chalit.

4. **Generalize the chart component**: DONE — added
   `chartStyle = input<ChartStyle>('north')` to the existing
   `RasiChartNorthIndianComponent` (kept the file/folder name as-is to avoid
   colliding with in-progress manual coordinate tuning); geometry tables are
   now keyed by style, with `south`/`east` temporarily aliasing `north`'s
   table until reference images arrive.
   → verify: DONE — D1 chart renders identically to before the refactor.

5. **Wire up the chart page**: DONE — `BirthChartService` now exposes
   `d1Chart`, `d9Chart`, `bhavaChalitChart` as three parallel `resource()`s
   off the same birth-details signal. Chart page renders all three with
   titles ("D1 - Rasi", "D9 - Navamsa", "D1 - Bhava Chalit") in a responsive
   flex row that stacks on mobile.
   → verify: DONE — screenshots at 1200px (side by side) and 400px
   (stacked) confirm correct rendering; D1 vs. Bhava Chalit house-number
   sequences are genuinely different (as expected) while degree values
   match exactly (as expected, since Bhava Chalit doesn't change a planet's
   longitude, only its house placement).

## Status: Done — all three charts render side by side, verified visually

and against hand-calculated reference values.
