# Plan: Sade Sati route

## Goal

Add a new `/sade-sati` route (sixth nav link, same `hasBirthDetailsGuard`,
lazy-loaded standalone page pattern as the other 5 routes). One
chronological, mixed list of every Sade Sati, Ardhashtama Shani and
Ashtama Shani occurrence from the birth date through birth date + 80
years, each rendered as a card: a Period line (real start/end dates from
the Saturn transit dataset), a Vehicle/animal line (nakshatra-counting
method from the user's PDF), and a body-part timeline table (with the 4
"sensitive" rows highlighted).

## Source material

- `Sade Sati.pdf` (user-provided): sections 10-18 give the vehicle/animal
  calculation (nakshatra counting, remainder → animal table) and the
  90-month body-part division table, with 4 worked examples used below
  to verify the formulas.
- `Saturn_First_Sign_Entries_1920_2100_Lahiri.csv` (user-provided): 74
  rows, Saturn's first (non-retrograde-repeated) entry into each sign,
  IST timestamps, Lahiri ayanamsa, 1920-11-17 through 2099-12-26.
- Two reference screenshots (Ardashtami/Ashtama Shani cards from an
  existing tool) establishing the intended UI shape for the two
  single-sign period types.

## Data validation (done before writing any code)

The CSV's dates are `DD/MM/YY` with **no century digit** — parsed by
tracking a running century and incrementing it whenever a row's 2-digit
year is smaller than the previous row's (the only wrap is 98→00, i.e.
1998→2000). After resolving all 74 rows to full years, verified
programmatically:

- All 74 dates are strictly increasing.
- The `Sign` column cycles forward through all 12 signs with **zero
  gaps or repeats** (`sign[i+1] = (sign[i] + 1) % 12` holds for every
  row) — confirms the dataset is a clean, unbroken sequence of Saturn's
  consecutive sign entries with no missing transits.

This resolved dataset (date, time, 0-indexed rasi per row — Saturn's own
Nakshatra/Pada columns are dropped, since the PDF explicitly says not to
use Saturn's nakshatra for the animal calculation) is embedded as a
literal constant in `sade-sati.data.ts`.

## Verified calculation rules

### 1. Occurrence windows (which Saturn sign-entries matter)

Given natal Moon rasi `moonRasi` (0-11, from `d1Chart`):

- **Sade Sati**: starts when Saturn enters the 12th-from-Moon sign
  (`(moonRasi + 11) % 12`), ends when Saturn enters the 3rd-from-Moon
  sign (i.e. after also transiting 1st-from-Moon and 2nd-from-Moon) —
  a 3-sign span. In the embedded dataset this is
  `[entries[i], entries[i+3])` for every `i` where `entries[i].rasi ===
12th-from-Moon`.
- **Ardhashtama Shani**: Saturn in the 4th-from-Moon sign
  (`(moonRasi + 3) % 12`) — a single-sign span, `[entries[i],
entries[i+1])`.
- **Ashtama Shani**: Saturn in the 8th-from-Moon sign (`(moonRasi + 7) %
12`) — a single-sign span, `[entries[i], entries[i+1])`.

An occurrence is included only if its start falls within [birth date,
birth date + 80 years] **and** the dataset has the needed exit row
(near the 2099 edge of the data, a handful of birth years won't have a
computable exit for their last occurrence — that occurrence is simply
omitted rather than shown with a guessed end date).

All three types are merged into one list and sorted ascending by start
date, per the user's "display all occurrence... in ascending order"
request — not three separate sections.

### 2. Vehicle/animal (PDF §11-13, verified against both worked examples)

```
count = ((transitMoonNakshatra - janmaNakshatra + 27) % 27) + 1
remainder = count % 9 === 0 ? 9 : count % 9
```

- `janmaNakshatra` = natal Moon's nakshatra (fixed per person, same
  value on every card).
- `transitMoonNakshatra` = the **transiting** Moon's nakshatra at the
  occurrence's exact start instant — computed via
  `EphemerisService.calculateGrahaEphemerisData` (already exists, used
  by Shadbala) at that instant, not read from the CSV (the CSV only has
  Saturn's own nakshatra, which the PDF says explicitly not to use).
- Verified against both PDF examples: Ardra(idx 5)→Uttara
  Bhadrapada(idx 25) gives count 21, remainder 3 → Elephant ✓.
  Rohini(idx 3)→Uttara Bhadrapada(idx 25) gives count 23, remainder 5 →
  Lion ✓.
- Animal/indication text for remainders 1-9 (Donkey/Horse/Elephant/
  Buffalo/Lion/Jackal/Crow/Peacock/Swan) taken verbatim from the PDF's
  §12 table.

### 3. Body-part timeline (PDF §17-18)

Fixed 11-row table (Head 7, Eyes 9, Face 8, Neck 6, Heart 10, Stomach
11, Navel 5, Anus 4, Knees 13, Thighs 12, Feet 5 — sums to 90 months),
with Head/Eyes/Navel/Anus flagged sensitive (matching the PDF's §18 and
both reference screenshots, which highlight exactly these 4 rows).

- **Sade Sati**: table used as-is (90 months), laid out sequentially
  from the occurrence's real start date.
- **Ardhashtama / Ashtama**: every row's month value is divided by 3
  (matching the reference screenshots exactly — e.g. Head 7→2.333,
  Thighs 12→4 — confirmed by reproducing the Ardashtami screenshot's
  numbers exactly from the raw ÷3 table). This is what "relative
  calculation" in the request refers to: since these periods span 1
  sign (~30 months) instead of 3 (~90 months), the 90-month table is
  scaled by 30/90, not replaced with a different table. Rows are laid
  out sequentially from the real start date the same way as Sade Sati
  — note the reference screenshots show this cumulative nominal-30-month
  layout can run a little past the occurrence's real end date (Saturn's
  actual stay in a sign varies ~24-33 months due to retrograde motion);
  this matches the reference exactly and is kept as-is rather than
  force-truncated to the real end.
- Date math: initially tried a flat `scaledMonths × 365.25/12` days
  offset, which matched the screenshot's first row exactly but drifted
  by 1-2 days further down the table (a flat average doesn't account
  for which specific months/leap-years are actually being crossed).
  Switched to calendar-aware fractional-month addition instead - step
  the whole-month part via `Date#setUTCMonth` (so it lands on the same
  day-of-month using each month's real length automatically), then
  convert the fractional remainder to days using the number of days in
  the month it lands in. This matches 6 of the screenshot's 11 rows
  exactly and is off by at most 2 days on the rest (accumulated
  fractional-day rounding, inherent to any such approximation without
  knowing the reference tool's exact internal rounding) - a strictly
  better match than the flat-average model, and the more defensible
  choice since it respects real calendar/leap-year lengths.

### 4. Display timezone

All Period/From/To dates are shown in **IST** (`Asia/Kolkata`), not the
birth location's timezone. Verified this is required, not just a style
choice: Saturn enters Sagittarius at `1987-12-17 02:52 IST`, which is
`1987-12-16 21:22 UTC` - displaying in UTC (or any other timezone)
shifts the calendar date shown by a day versus the CSV and the
reference screenshots. `SATURN_DATA_TIMEZONE` in `sade-sati.data.ts`
documents this.

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

- `pages/sade-sati/sade-sati.model.ts` — `SaturnTransitEntry`,
  `OccurrenceType`, `Occurrence`, `BodyPartRow`, `VehicleInfo` types.
- `pages/sade-sati/sade-sati.data.ts` — the embedded 74-row
  `SATURN_SIGN_ENTRIES` dataset, the animal/indication table, the
  90-month body-part table with sensitivity flags. Feature-local (not
  `shared/utils`) since nothing else in the app needs Saturn transit
  history, matching how Shadbala's own reference tables stayed
  feature-local.
- `pages/sade-sati/sade-sati.util.ts` — pure functions: sign-offset
  helpers, `findOccurrenceWindows` (sync, no ephemeris), vehicle
  count/remainder calc, `buildBodyPartTimeline`. One async function
  (`buildOccurrence`) that calls `EphemerisService` for the transit Moon
  and assembles the final per-card view-model.
- `pages/sade-sati/sade-sati.component.ts` — orchestration: an
  `effect()` (matching Shadbala's established async-signal pattern —
  this codebase doesn't use the newer `resource()` API anywhere) that
  reads `birthDetails()`/`d1Chart()`, finds raw occurrence windows,
  `Promise.all`s the small number of per-occurrence ephemeris calls
  (~6-9 for an 80-year window, one Saturn cycle ≈ 29.5 years), and sets
  a signal of finished `Occurrence[]`.
- `pages/sade-sati/sade-sati.component.html` / `.scss` — hand-rolled
  card list (not the generic `Table` molecule — same reasoning as
  Shadbala's tables: per-row "sensitive" highlighting doesn't fit the
  molecule's per-column-only `cellTemplate` model), reusing the existing
  `Card` atom for each occurrence.
- `app.routes.ts` / `app.component.html` — new guarded route + 6th nav
  link, same as every other route.

## Steps

1. DONE — Validate and transcribe the CSV into `SATURN_SIGN_ENTRIES`.
2. DONE — Verify vehicle/animal and body-part-timeline formulas against
   all 4 PDF/screenshot worked examples.
3. DONE — Implement `sade-sati.model.ts` / `sade-sati.data.ts` /
   `sade-sati.util.ts` / `sade-sati.component.*`.
4. DONE — Wire route + nav link.
   → verify: `ng build` and `tsc --noEmit` both clean (no chrome
   devtools available this session, so no live-browser click-through
   this time - flagging that as an open item below rather than skipping
   it silently).

## Status

Implemented and building cleanly (`ng build`, `tsc --noEmit`). Not yet
verified in a live browser (chrome-devtools access was turned off
mid-session) - recommend a quick click-through before considering this
fully done: generate a chart, open `/sade-sati`, confirm cards render,
dates look right, and no console errors.
