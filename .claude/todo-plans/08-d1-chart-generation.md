# Plan: D1 (Rasi) Chart Generation

## Goal

Header button opens a modal to collect birth details (name, DOB, TOB, POB with
autocomplete), computes the sidereal D1 chart via swisseph-wasm, and displays
it on the default route. Header then shows a persistent summary bar with an
edit icon to reopen the modal. Chart style: North Indian by default, with
South Indian and East Indian selectable.

## Key technical decisions (already verified)

- **Ephemeris**: `swisseph-wasm` (GPL-3.0 — cleared, project is open-source).
  Supports Lahiri sidereal ayanamsa (`set_sid_mode` + `SEFLG_SIDEREAL`),
  houses/ascendant via `swe.houses_ex()` (Whole Sign, hsys `'W'`, matching
  Vedic convention). **Bundling blocker discovered and resolved**: the
  package cannot be bundled by Angular's esbuild at all — its Node-detection
  branch statically imports `node:module`/`url`/`path`, which esbuild's
  browser platform refuses to resolve, and Angular 21's `application`
  builder exposes no externalDependencies/plugin escape hatch (confirmed by
  reproducing the failure on both `ng serve` w/ Vite prebundle-exclude and a
  plain `ng build`). Fix: load it at runtime via dynamic
  `import('https://cdn.jsdelivr.net/...')` (confirmed available on jsdelivr
  and unpkg; CDN also serves `.wasm`/`.data` since the library's own
  `locateFile` resolves them relative to `import.meta.url`, which correctly
  points at the CDN when loaded this way). Verified end-to-end through the
  real Angular dev server: known Jan 1 2000 12:00 UTC reference chart
  produces correct sidereal positions (Sun 256.52° = Sagittarius, matching
  the Node.js control run). `swisseph-wasm` stays in `devDependencies` only,
  for its TypeScript types — never bundled at runtime. `public/wasm/` and
  the local-copy approach were removed as unnecessary.
- **Cities data**: ~15,000-entry `CITIES` array (name, countryCode, lat, lng,
  tzIndex) + `TZS` (143-entry IANA zone name array, tzIndex is a direct index
  into it — verified: index 12 = Africa/Cairo, index 142 = Asia/Kolkata,
  matching every Indian city in the dataset) + `CN` (country code → name).
  Goes into `src/app/shared/utils/cities.constants.ts`.
- **Autocomplete**: native `<datalist>` bound to the POB `<input>` — satisfies
  the native-HTML5-controls rule, no custom dropdown component needed.
- **Chart math**: 9 grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn,
  Rahu via mean/true node, Ketu = node + 180°) placed into 12 rasis by
  sidereal longitude; Ascendant from `swe.houses()` determines house 1.

## Steps

1. **Cities constants**: `src/app/shared/utils/cities.constants.ts` exporting
   `CITIES`, `TZS`, `CN`, plus a typed `City` type and a `findCityTimezone(city)`
   helper (Type, not interface, per project convention).
   → verify: builds, spot-check a few lookups match known cities.

2. **Ephemeris service**: `src/app/shared/services/ephemeris.service.ts`
   wrapping swisseph-wasm — lazy-inits on first use via a dynamic CDN import
   (see bundling blocker note above), `set_sid_mode` to Lahiri, exposes
   `calculateD1Chart(datetime, lat, lng)` returning graha longitudes +
   ascendant rasi for 9 grahas (Ketu derived as Rahu + 180°).
   → verify: DONE — end-to-end through the real Angular dev server, known
   Jan 1 2000 12:00 UTC / New Delhi reference chart produces correct
   sidereal positions matching a Node.js control run.

3. **Birth details model + form**: DONE —
   `src/app/features/birth-chart/`. `BirthDetails` type (name, dob, tob,
   cityLabel, lat, lng, timezone). Modal content: Input (name) + native
   `<input type="date">` (DOB) + native `<input type="time">` (TOB) + Input
   with `<datalist>` (POB) — all via reactive forms, existing Input atom
   (extended with a `list` input for datalist support) and a `cityValidator`
   requiring an exact match against a known city.
   **Bug found + fixed during review**: the raw CITIES dataset has ~90+
   pairs of entries sharing the same "City, Country" label with different
   coordinates (e.g. two distinct "Udaipur, India"s) — caused a real
   Angular NG0955 duplicate-track-key runtime error in the datalist and
   meant `findCityByLabel` could silently resolve to the wrong city's
   lat/lng/timezone. Fixed by precomputing `CITY_LABELS` in
   `cities.constants.ts`: colliding labels get `(lat, lng)` appended to
   disambiguate; lookup now matches against this same array by index
   instead of reconstructing an ambiguous label. Verified: no more NG0955,
   chart renders correctly after fix.
   → verify: DONE — filled form via Playwright, confirmed correct
   BirthDetails emitted and chart rendered.

4. **State service**: DONE — `src/app/shared/services/birth-chart.service.ts`,
   using Angular's `resource()` API keyed on the birth-details signal, with
   a `wallTimeToUtc()` utility (`shared/utils/timezone.util.ts`, using
   `Intl.DateTimeFormat` offset math) to correctly convert the birth city's
   local wall-clock time to UTC before calling the ephemeris service —
   necessary since the browser's local timezone can differ from the birth
   city's.
   → verify: DONE — end-to-end through the real app.

5. **Header integration**: DONE — Header shows "Generate Chart" button when
   no chart exists; once submitted, shows a persistent summary bar
   (name/dob/tob/pob + edit pencil glyph) that reopens the modal.
   **Bug found + fixed during review**: at mobile width (375px) the fixed
   `h-14` header couldn't fit the brand + summary text side by side, so
   they wrapped and visually overlapped — a mobile-first violation. Fixed
   with `truncate`/`min-w-0`/`shrink-0` so the summary text ellipsizes
   instead of wrapping; verified at both 375px and 1200px via Playwright
   screenshots, no regression at desktop width.
   → verify: DONE — screenshots at both mobile and desktop widths.

6. **Chart rendering — North Indian style (default)**: DONE —
   `shared/ui/organisms/rasi-chart-north-indian/`. 12 fixed regions (4 kites
   at cardinal points + 8 corner triangles) drawn via SVG grid lines (2 full
   diagonals + diamond connecting side-midpoints); geometry verified against
   a user-provided reference chart image (LunarLight Astrology-style),
   including confirming the numbers shown are RASI numbers (not house
   numbers) — the top kite always shows the Ascendant's rasi, and rasi
   numbers decrease by 1 going clockwise. Region label positions use exact
   polygon centroids (computed via Python, not eyeballed). Verified
   end-to-end: screenshot of a real generated chart cross-checked
   graha-by-graha against independently-computed ephemeris longitudes (Sun,
   Mercury both rasi 9; Moon rasi 7; Venus rasi 8; Mars rasi 11; Jupiter,
   Saturn both rasi 1; Rahu rasi 4; Ketu rasi 10 — all matched).

7. **Chart style options**: South Indian (4x4 grid) and East Indian variants
   as additional SVG-based organism components, with a selector (native
   `<select>` or segmented control) to switch between them — same computed
   data, different SVG layout components.
   → PAUSED — awaiting a reference image (same verification approach used
   for North Indian) before building, per user request.
   → verify: screenshot all three styles render the same data correctly.

8. **Routing**: DONE — default route (`''`) lazy-loads `pages/chart/`,
   wired to the birth-chart state service.
   → verify: DONE — navigating to `/` shows the chart or the empty
   "Generate Chart" prompt.

## Post-implementation review (CLAUDE.md rule #9)

Checked against PROJECT.md/CLAUDE.md guidelines: no `ChangeDetectorRef`
usage anywhere, no `interface` (all `type`), atomic-design folder placement
correct (services/utils/features/pages/shared-ui), barrel files present at
every level, native HTML5 controls used throughout (date/time inputs,
datalist, dialog), signals used for all component state. Two real bugs were
found and fixed during this review (see steps 3 and 5 above) — both via
actual Playwright-driven browser testing, not just static review.

## Status: In progress — steps 1–6 and 8 done and verified. Step 7

(South/East Indian styles) paused, awaiting a reference image.
