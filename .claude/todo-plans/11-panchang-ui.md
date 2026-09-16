# Plan: Panchang details UI (structure first, real calculations later)

## Goal

Replace the Panchang route's bare `<h1>Panchang</h1>` stub with the full
card-grid layout shown in the reference screenshot: a "Panchang details"
heading with a "At the given date, time, and place (sidereal Sun–Moon)"
subtitle, followed by a responsive grid of ~20 cards (Thithi, Nakshatra,
Yoga, Karnam, Vedic Day Lord, Hora, Tithi Sphuta, Tithi Beeja, Santan
Tithi, Yogi, Ava Yogi, Mudakku, Vainashika (Lagna), Vainashika (Moon),
Mandi, and any others the user names) — each showing a label, a bold
primary value, secondary detail line(s), and some cards showing an
additional highlighted interpretive note.

Per the user's explicit sequencing (same pattern as Planet Positions):
**step 1 is UI/structure with the component computing and projecting
placeholder data into cards; step 2 (a separate follow-up) wires in the
real astronomical formulas**, which the user will supply — several of
these points (Tithi Sphuta, Tithi Beeja, Santan Tithi, Vainashika,
Mudakku, Ava Yogi) have no existing source in this codebase or the old
`astroParseTable` reference app, so they are NOT researched or guessed
at in this step.

## Key decisions (from user answers)

- **Card content**: `PanchangComponent` computes each card's data itself
  and projects the result directly into the card body — no generic
  `PanchangDetail[]`-driven `@for` loop over a uniform model. This means
  each card is written explicitly in the template (or as small
  per-card render fragments), reading from component fields/computed
  signals, mirroring how `AppComponent` explicitly lays out its three
  charts today rather than looping over a chart-config array.
- **Card shell**: reuse the existing `Card` atom
  (`shared/ui/atoms/card/`) for each of the ~20 cards — it already
  supports a `[title]`-projected label plus freely-projected body
  content, which fits "label + primary value + detail lines + optional
  note" without a new component.
- **Header text**: match the screenshot exactly — "Panchang details" as
  an `<h1>`, with the subtitle "At the given date, time, and place
  (sidereal Sun–Moon)." to its right (or below on narrow screens).
- **Data for step 1**: hardcoded placeholder values matching the
  screenshot's sample content (e.g. Thithi: "Shukla Dashami" / "100%
  elapsed"), just enough to prove out the layout — not wired to
  `BirthChartService` yet, since the underlying formulas aren't ready.
- **Highlighted note styling**: a subset of cards (Tithi Sphuta, Tithi
  Beeja, Santan Tithi, Ava Yogi in the screenshot) show a bold red/pink
  interpretive paragraph below their detail lines — model this as an
  optional "note" section per card, styled distinctly (e.g. a colored
  left border or tinted text), reusable for whichever real cards need
  it once real logic lands. One card (Ava Yogi) also has a tinted
  background on the whole card — treat that as a per-card visual
  variant, not universal.
- **Responsiveness**: grid layout, 5 columns on wide screens per the
  screenshot, collapsing to fewer columns / single column on narrow
  viewports (this app already has a mobile-responsive header — follow
  the same breakpoint conventions).

## Open items to confirm with user before/while building

- Exact list and order of all ~20 cards (the screenshot shows enough to
  infer most labels/fields, but exact secondary-line wording per card
  should be confirmed against the full screenshot rather than guessed).
- Whether "Vedic Day Lord" (rendered as "Monday" / "Lord: Moon" in the
  screenshot) and similar simple cards need any different treatment
  than the more complex multi-line cards.

## Steps

1. DONE — Built `PanchangComponent`'s template: heading + subtitle row,
   then a responsive card grid using the `Card` atom for 15 cards
   (Thithi, Nakshatra, Yoga, Karnam, Vedic Day Lord, Hora, Tithi Sphuta,
   Tithi Beeja, Santan Tithi, Yogi, Ava Yogi, Mudakku, Vainashika
   (Lagna), Vainashika (Moon), Mandi), with hardcoded placeholder
   content matching the screenshot.
   → verified: Playwright screenshots at desktop (1400px) and mobile
   (400px) widths match the reference screenshot's content and layout;
   grid collapses to a single column on mobile; no console errors.
2. DONE — Deviated slightly from the original plan: rather than scoping
   the "tinted card" variant purely to `PanchangComponent`'s own SCSS
   (which turned out to be impossible without `::ng-deep`, since
   `Card`'s host is `display: contents` and the actual `.card` box
   lives inside `Card`'s own encapsulated template), added a small
   `variant` input (`'default' | 'error'`) to the `Card` atom itself,
   mirroring `Button`'s existing `variant`/`color` input pattern. The
   "note" text styling (bold, `--color-error` colored paragraph) stayed
   local to `PanchangComponent`'s stylesheet as originally planned.
   → verified: visual match for the tinted Ava Yogi card; `Card`'s
   other consumer (`component-showcase`) unaffected since `variant`
   defaults to `'default'`.
3. (Follow-up, separate task) Once the user supplies the calculation
   logic for each point, replace the hardcoded placeholder values with
   real computed values from `BirthChartService`/`EphemerisService`,
   card by card.

## Status

Steps 1-2 (UI/structure) done and verified: `tsc`, `prettier --check`,
and `ng build` all clean. Step 3 (real calculations) starting — formulas
below confirmed by the user for a first batch of cards.

## Step 3 — Real calculations (in progress)

Confirmed formulas, applied on top of the birth chart already computed
by `BirthChartService`/`EphemerisService` (Sun/Moon longitudes from
`d1Chart.grahas`, house lookups via the Bhava Chalit chart's cusps):

### Tithi Sphuta

`tithiSphuta = normalize360(moonLongitude - sunLongitude)`. This is a
synthetic longitude (not a real graha) — derive its sign via
`floor(longitude / 30)`, nakshatra/pada via the existing
`calculateNakshatra`/`calculatePada`. **House uses the simple whole-sign
system from the D1 chart**, not Bhava Chalit/Sripati: `house =
getRasiDistances(d1Chart.ascendantRasi, tithiSphutaRasi).forward` — no
`EphemerisService` changes needed, this is pure arithmetic on the
already-computed `d1Chart.ascendantRasi`.

Note text: static per the 3 confirmed examples only (Aries/Bharani →
health concerns + self-focus; Gemini/Ardra → anxiety about
destruction/loss, concerns re: children/studies/market; Virgo/Chitra →
profit-oriented creativity) — shown only when the computed
sign+nakshatra combination matches one of these three; no note
otherwise until more interpretations are supplied.

### Santan Tithi

`raw = normalize360(5 * (moonLongitude - sunLongitude))`
`tithiNumber = floor(raw / 12) + 1` (1-30, each tithi spans 12°).
Interpretation table (favourable vs. difficult tithis) per the user's
notes: Panchami/Dashami/Ekadashi/Trayodashi favourable for children;
Ashtami/Navami/Chaturdashi difficult — render the appropriate note text
based on which of these the computed tithi number falls on (or no note
for tithis not called out).

### Tithi Beeja

Multi-step, NOT a closed-form formula — needs careful sequencing:

1. Compute the _birth_ Tithi number the same way as Santan Tithi's raw
   value but WITHOUT the ×5 (`normalize360(moonLongitude -
sunLongitude) / 12`, floor + 1) — this is the ordinary birth Tithi
   (1-30).
2. Look up that Tithi's ruling "Graha Devata" via the confirmed
   30-entry table (Krishna Paksha 1-14 repeats the Shukla 1-14 planet
   sequence; Amavasya/Purnima are the 15th of each paksha):
   `[Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Sun, Moon,
Mars, Mercury, Jupiter, Venus]` repeated for both halves, with
   Purnima (tithi 15) = Saturn and Amavasya (tithi 30) = Rahu.
3. Find that planet's RASI (sign, 0-11) from `d1Chart.grahas`.
4. "7th from that planet" = `(planetRasi + 6) % 12` — this sign is the
   "unresolved desire" result.
5. Count sign-distance from that 7th-place sign to the Moon's sign
   (using the existing `getRasiDistances`-style forward count, 1-12).
6. Apply that same distance again, starting from the Moon's sign, to
   get a candidate result sign.
7. Exception: if the candidate result sign equals the Moon's own sign
   OR the 7th-from-Moon sign, instead count 10 signs forward from the
   candidate to get the final result sign.
8. Render the final result's sign/nakshatra/house(s) as the
   "Fulfillment path" line, and the step-4 sign as the "Unresolved
   desire" line, mirroring the reference screenshot's Tithi Beeja card
   layout ("Graha Devata: Moon (Aquarius · H12)", "Unresolved desire
   (7th): Leo · H6 — ...", "Fulfillment path: Taurus · H3 — ...").
   → verify with a hand-traced example once implemented, matching the
   reference screenshot's own worked numbers if reproducible from a
   matching birth chart, or at minimum confirming each step's
   intermediate value with the user before trusting the final output.

### Vainashika (Lagna) / Vainashika (Moon)

Confirmed NOT a formula to derive from scratch — it's a fixed positional
offset on the (nakshatra, pada) pair, verified algebraically against
the user's 27×4 reference table (Ashwini through Revati): treating
`combinedIndex = nakshatraIndex * 4 + (pada - 1)` (0-107), the result
is `resultIndex = (combinedIndex + 87) % 108`, then split back into
`resultNakshatra = floor(resultIndex / 4)`, `resultPada = (resultIndex
% 4) + 1`. Verified against 4 independent spot-checks from the table
(first row, second row, an interior row via Ardra, and the last row via
Revati) — all matched exactly, so this is implemented as a formula, not
a transcribed 108-row lookup table. Apply once using the natal Lagna's
nakshatra/pada (from `d1Chart.ascendantLongitude`) and once using the
Moon's nakshatra/pada (from `d1Chart.grahas` Moon longitude).

### Mudakku — DONE

Confirmed as two independent fixed-sum reflections of the Sun's
position, verified against every row of both reference tables (12-sign
rasi table, 27-nakshatra table — all matched exactly):
`mudakkuRasi = (4 - sunRasi + 12) % 12`,
`mudakkuNakshatra = (10 - sunNakshatra + 27) % 27`.

### Mandi — NOT STARTED, blocked

The user-provided content for Mandi was entirely a by-house
remedy/interpretation guide (12 paragraphs on what ritual to perform
depending on which house Mandi/Mudakku falls in) — it does not specify
how to calculate Mandi's actual position. Mandi (Maandi/Gulika) is
normally a weekday+sunrise/sunset-based Upagraha calculation, which
needs sunrise/sunset times that `EphemerisService` does not currently
compute. User confirmed: implement the standard Gulika/Mandi Upagraha
formula (weekday ruling planet's portion of day/night divided into 8
parts; Mandi = ascendant of that portion's start time) — this requires
adding sunrise/sunset calculation to `EphemerisService` first (a
swisseph-wasm rise/set call), then the weekday-portion logic in
`panchang.util.ts`. Scoped as a separate follow-up since it touches
`EphemerisService`, not just page-local Panchang code.

### Implementation structure (SRP)

Per explicit user instruction, Panchang calculation logic is split
across dedicated files instead of living in the component:

- `panchang.model.ts` — types for each calculated result
  (`TithiSphuta`, `SantanTithi`, `TithiBeejaResult`, `VainashikaResult`,
  `MudakkuResult`).
- `panchang.data.ts` — static reference data (Graha Devata-per-tithi
  table, Vainashika/Mudakku fixed offsets, Santan Tithi
  favourable/difficult sets and note text, Tithi Sphuta interpretation
  notes).
- `panchang.util.ts` — pure calculation functions taking a `D1Chart`
  (or raw values) and returning typed results; no Angular dependencies.
- `panchang.component.ts` — orchestration only: reads
  `BirthChartService.d1Chart()`, calls the util functions, assembles
  view-models (adding display-friendly names via `RASI_NAMES`/
  `NAKSHATRA_NAMES`) as `computed()` signals.
  This mirrors the standing project-wide rule now documented in
  `.claude/PROJECT.md`.

### Verified

All of Tithi Sphuta, Tithi Beeja (full multi-step chain, including the
10th-house exception), Santan Tithi, Vainashika (Lagna + Moon), and
Mudakku were checked against hand/script-traced arithmetic and, for
Tithi Beeja specifically, reproduced the reference screenshot's own
worked example exactly (Graha Devata Moon in Aquarius → unresolved
desire Leo → distance 7 → exception triggered → fulfillment path
Taurus). Rendered correctly in-browser with a real submitted birth
chart, no console errors, `tsc`/`prettier`/`ng build` all clean.

### Display fixes (post-implementation)

- Tithi Beeja's Graha Devata line now shows the planet's own sign and
  house (e.g. "Saturn (Capricorn · H4)"), not just the planet name —
  added `grahaDevataRasi`/`grahaDevataHouse` to `TithiBeejaResult`,
  computed the same whole-sign-house way as Tithi Sphuta.
- Santan Tithi displays a readable `<Paksha> <TithiName>` (e.g.
  "Krishna Chaturthi") instead of the raw 1-30 tithi number — added
  `TITHI_NAMES` (14 names) to `panchang.data.ts` and a
  `getPakshaTithi(tithiNumber)` util that splits the number into paksha
  - name, handling the Purnima/Amavasya 15th-tithi special case for
    each paksha. Verified against edge cases (1, 15, 16, 19, 22, 30).
- Mudakku and both Vainashika cards now also show the resulting
  nakshatra's ruling lord (e.g. "Ashlesha (pada 3) · Mercury") — added
  `NAKSHATRA_LORD_CYCLE` (the standard 9-planet Vimshottari cycle,
  repeating every 9 nakshatras: Ketu, Venus, Sun, Moon, Mars, Rahu,
  Jupiter, Saturn, Mercury) and a `getNakshatraLord(nakshatra)` util.
  Verified against all 3 of the user's reference examples (Shatabhisha
  → Rahu, Purva Ashadha → Venus, Moola → Ketu — all matched exactly).
- Mudakku and both Vainashika cards additionally show a "Planets:" line
  listing any natal graha whose OWN nakshatra shares the same ruling
  lord as the derived point's nakshatra (confirmed rule: same lord, not
  necessarily the same nakshatra) — added
  `getPlanetsWithSameNakshatraLord(d1Chart, lord)`. Line is omitted
  entirely when no planet matches.

### Second wave — DONE (standard Panchang elements)

Wired up using standard, well-documented classical formulas (no
custom/user-supplied logic needed, unlike the first wave):

- **Thithi**: `normalize360(moonLongitude - sunLongitude)`, tithi
  number = `floor(raw/12)+1`, displayed via the existing
  `getPakshaTithi` (paksha + name) plus % elapsed within the current
  tithi's 12° span.
- **Nakshatra**: Moon's own nakshatra/pada (`calculateNakshatra`/
  `calculatePada` on Moon's longitude) plus its lord via the existing
  `getNakshatraLord`.
- **Yoga**: `normalize360(sunLongitude + moonLongitude)`, divided into
  27 equal 13°20' spans (same span as nakshatra) → one of the 27 fixed
  Yoga names, plus % elapsed.
- **Karnam**: half-tithi index (`floor(raw/6)+1`, 1-60) → one of 11
  Karnam names (Kimstughna fixed at half-tithi 1; 7 movable Karnams
  cycling through half-tithis 2-57, repeating 8 times; Shakuni/
  Chatushpada/Naga fixed at 58/59/60) — verified against the standard
  classical sequence by script.
- **Vedic Day Lord**: calendar weekday of the birth date (`dob`, parsed
  in its own local wall-clock terms, no timezone conversion) → weekday
  name + ruling planet (Sun=Sunday...Saturn=Saturday) — verified June
  15 1990 → Friday → Venus, matching JS's own `Date#getDay()`.
- **Yogi / Ava Yogi**: `YogiPoint = normalize360(sunLongitude +
moonLongitude + 93°20')`, `AvayogiPoint = YogiPoint + 93°20'` again
  (186°40' total from Sun+Moon) — this exact formula was verified to
  floating-point precision against the placeholder example that was
  already in the UI (27°17' Sco Yogi → 3°57' Gem Avayogi, difference
  ~1e-14). "Planet" shown is the standard nakshatra-lord of that
  point's own nakshatra (reusing `getNakshatraLord`, no separate
  lookup table). "in star" lists any natal planet occupying that exact
  nakshatra (new `getPlanetsInNakshatra`, distinct from
  `getPlanetsWithSameNakshatraLord` — this one checks the literal same
  nakshatra, not just the same lord). Ava Yogi's static "Remedy /
  Discipline" note was removed per explicit user instruction (no real
  per-nakshatra remedy data source yet — user will revisit once that
  data is available).

### Third wave — DONE (Hora, Mandi, EphemerisService sunrise/sunset)

- **All static/placeholder note text removed** across every card per
  explicit user instruction ("remove all static data for now for all
  cards") — Tithi Sphuta/Tithi Beeja/Santan Tithi's fixed description
  paragraphs are gone (the computed-lookup notes were removed too,
  per the user's final call to remove note text everywhere, not just
  the fully-static ones). Ava Yogi's static remedy note was already
  removed in the second wave. The `.note`/`.favourable` SCSS classes
  were left in place (harmless, no churn) for whenever notes return.
- **`EphemerisService.calculateSunriseSunset(datetime, lat, lng)`**:
  new method using `swisseph-wasm`'s `rise_trans` (`SE_CALC_RISE`=1,
  `SE_CALC_SET`=2 on `SE_SUN`), converting the returned Julian Day back
  to a UTC `Date` via `jdut1_to_utc`. **Critical fix during
  implementation**: `rise_trans` searches FORWARD from the given JD,
  so passing the birth's exact instant (rather than that day's UTC
  midnight) would skip past a same-day sunrise/sunset that already
  occurred before the birth time, incorrectly returning the NEXT day's
  event instead — verified this exact failure mode via a smoke test
  (searching from 09:00 UTC returned June 16's sunrise instead of June
  15's), then fixed by always anchoring the search to UTC midnight of
  the target calendar day.
- **`EphemerisService.calculateAscendant(datetime, lat, lng, ayanamsa)`**:
  new method exposing just the Ascendant longitude for an arbitrary
  instant (needed for Mandi, which requires the Ascendant at a
  specific sub-day instant, not birth time).
- **`BirthChartService.sunTimes`**: new signal `{ sunrise, sunset,
nextSunrise }` (today's + tomorrow's sunrise, needed for night-hora/
  night-portion boundary math), computed alongside the D1/D9/Bhava
  Chalit charts whenever birth details are set or reloaded from
  storage. Not persisted to `StoreService` — cheap to recompute,
  keeps the storage schema simple.
- **Hora**: 24-hora cycle (12 day + 12 night, sunrise/sunset/next-
  sunrise-bounded), ruling planet = Chaldean order (Saturn, Jupiter,
  Mars, Sun, Venus, Mercury, Moon) starting from the weekday's own
  lord and advancing uninterrupted through all 24 horas. Verified the
  self-consistency the research flagged (Sunday hora24=Mercury →
  immediately followed by Moon = Monday's hora1, matching the
  classical weekday-lord sequence) and confirmed against the live
  chart (Friday, hora 9 → Mercury, matching a hand-computed check).
- **Mandi/Gulika**: per BPHS ch.3 ~sloka 66-70 (confirmed Mandi and
  Gulika are the same point) — day/night each split into 8 equal
  portions in plain weekday-lord order (not Chaldean), Saturn's
  portion index per weekday sourced directly from the primary text
  (`MANDI_DAY_PORTION`/`MANDI_NIGHT_PORTION` in `panchang.data.ts`),
  Mandi's longitude = the Ascendant computed at the START of that
  portion (BPHS is explicit: start, not midpoint). Implemented as an
  `effect()` in `PanchangComponent` (not a plain `computed()`, since
  it needs an async `EphemerisService.calculateAscendant` call) writing
  into a private signal — mirrors the async-signal pattern already
  used for chart loading in `BirthChartService`, since `resource()`
  can't be seeded synchronously from cache.
- All rendered correctly in-browser with a real submitted birth chart,
  no console errors; `tsc`/`prettier`/`ng build` all clean.

### Still not started

- Any per-item interpretive/remedy note content — explicitly deferred
  until the user supplies real data points (static text was removed
  rather than left as placeholder-quality content).
