# Plan: Dagdha Rasi fire indicator on the Main D1 chart

## Goal

Show a small 🔥 marker in whichever house(s) of the MAIN D1 (birth Rasi)
chart — the one at the top of the dashboard in `app.component.html` — are
"Dagdha Rasi" (burnt sign) for the birth tithi. D9 and Bhava Chalit (also
rendered on the dashboard) and the Vargas page's own D1 chart are
unaffected — only the main dashboard's D1 chart gets this.

## Scope decision: birth tithi, not "today"

Dagdha Rasi is classically a Muhurta (electional) concept tied to the
_current_ tithi at the moment of an activity. But this app has no "today"
concept anywhere — every Panchang calculation (tithi, nakshatra, yoga,
karana, etc.) is derived from the birth D1 chart, not the current date, and
there's no stored "current location" to compute a live chart with. Treating
this as birth-chart annotation (using the birth tithi, already computed
elsewhere in Panchang) is consistent with how the rest of the app works, so
proceeded without asking — reusing `calculateBirthTithiNumber`, not adding
new "current moment" ephemeris plumbing.

## Data verification

The Tithi → Dagdha Rasi table (14 tithi-within-paksha slots, same table for
both Shukla and Krishna paksha; Purnima/Amavasya have none) was cross-checked
against 3 independent sources:

- 2 sources ([jyotishkalpadrum.blogspot.com](https://jyotishkalpadrum.blogspot.com/2020/06/Dagdha-Sign-in-tithi.html),
  a WebSearch aggregate) agreed exactly on all 14 rows.
- A 3rd source ([freevedicastro.com](https://www.freevedicastro.com/dagdharashis.html))
  disagreed on 2 rows (Dashami, Trayodashi). A 4th source
  ([navagrah.blogspot.com](http://navagrah.blogspot.com/2014/08/dagdha-rashi-and-dagdha-yoga.html))
  broke the tie in favor of the original 2, which is what's implemented:
  Dashami = Leo+Scorpio, Trayodashi = Taurus+Leo (not freevedicastro's
  Libra+Scorpio / Taurus+Aquarius).
- Validated the lookup/indexing logic in Node across all 30 tithi numbers
  (1-30 correctly wraps to the 1-14 paksha-relative table, 15/30 both
  resolve to Purnima/Amavasya's empty list).

## Implementation

- Relocated `calculateBirthTithiNumber` from `panchang.util.ts` to
  `shared/utils/ephemeris.util.ts` (2nd consumer — `app.component.ts` needs
  it too now), consistent with this project's "relocate to shared when a
  2nd/3rd feature needs it" precedent. `panchang.util.ts` now imports it
  back; its one internal call site (`calculateTithiBeeja`) is unaffected.
- Added `DAGDHA_RASI_BY_TITHI` (private lookup table) + `getDagdhaRasis(tithiNumber)`
  to `ephemeris.util.ts`, alongside the app's other tithi/rasi lookup
  helpers (same file as `NAKSHATRA_LORD_CYCLE`/`getNakshatraLord`,
  `GRAHA_OWNED_RASIS`, etc.).
- `RasiChartComponent` (`shared/ui/organisms/rasi-chart`) gained one new
  optional input, `dagdhaRasis = input<number[]>([])` — defaults to empty,
  so every other usage (D9, Bhava Chalit, Vargas' D1/varga charts) is
  unaffected without any changes to their call sites.
- The 🔥 marker reuses the _existing_ graha-label-stacking mechanism rather
  than adding new SVG geometry: it's unshifted into the same `labelTexts`
  array that graha abbreviations (and house 1's "Asc" text) already stack
  into, so it renders using the same tuned per-region anchor positions with
  zero new geometry/CSS. Order per house: Asc (house 1 only), then 🔥 (if
  dagdha), then graha labels.
- `app.component.ts` added a `dagdhaRasis` computed signal (birth Sun/Moon
  longitude → `calculateBirthTithiNumber` → `getDagdhaRasis`); wired only
  onto the main D1 `<app-rasi-chart>` in `app.component.html`.

## Status

Implemented, `tsc --noEmit` and `ng build` clean (pre-existing unrelated
budget-limit build errors, same as prior features this session). Not yet
verified in a live browser (chrome-devtools access is off this session).
