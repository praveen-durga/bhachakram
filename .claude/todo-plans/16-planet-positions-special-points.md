# Plan: Special points in Planet Positions

## Goal

Add Mandi, Hora Lagna, Indu Lagna, Bhrigu Bindu, and the 5 Sun-based
Upagrahas (Dhuma, Vyatipata, Parivesha, Chapa, Upaketu) as extra rows in
the existing Planet Positions table, below the Ascendant + 9 grahas
already shown there.

## Research findings

A research subagent first confirmed what already exists: Mandi/Gulika's
longitude calculation is fully built and chart-verified in the Panchang
feature (`getMandiInstant` + `EphemerisService.calculateAscendant`), but
Hora Lagna, Indu Lagna, Bhrigu Bindu, and every Upagraha besides Mandi
had zero prior code, data, or research in this repo.

Fetched BPHS Ch.5 (v.2-8) and Ch.3 (v.61-69) directly (same primary
source/method as the Deities and Vargas work):

- **Hora Lagna** (Ch.5 v.4-5): "repeats every 2.5 ghatis (60 minutes)
  from sunrise" = +30° of longitude per hour elapsed since sunrise,
  added to the Sun's own longitude **at sunrise** (not at birth) —
  confirmed clean, BPHS-sourced.
- **5 Sun-based Upagrahas** (Ch.3 v.61-64): Dhuma = Sun + 4 rasis
  13°20'; Vyatipata = 360° - Dhuma; Parivesha = Vyatipata + 180°; Chapa
  = 360° - Parivesha; Upaketu = Chapa + 16°40' — a clean literal chain,
  confirmed BPHS-sourced.
- **Kaala/Mrityu/Yamaghantaka/Ardhaprahara** (Ch.3 v.66-69): same verse
  block as Gulika, using an 8-part day/night division. Flagged this to
  the user: Panchang's own prior research (see
  `.claude/todo-plans/11-panchang-ui.md`) already found that literal
  8-part method gives the WRONG chart position for Gulika, replacing it
  with an empirically-verified 15-muhurta system instead — so these 4
  share Gulika's discredited method, not its verified replacement.
  **User chose to skip these 4 rather than ship likely-wrong values.**
- **Indu Lagna** and **Bhrigu Bindu**: confirmed absent from BPHS
  entirely (later Jyotish additions). Web search was intermittently
  down this session, so neither could be freshly cross-verified.
  - Bhrigu Bindu's formula (Moon-Rahu midpoint, shorter arc) is simple
    and well-established enough to implement with confidence from
    general knowledge.
  - Indu Lagna's formula (Kalanadi table + 9th-lord-from-Ascendant-and-
    Moon counting) is more elaborate and genuinely unverified this
    session. **User chose to implement it anyway, flagged `*` in the
    UI as best-effort**, rather than wait.

## Key implementation notes

- **No new ephemeris calls needed for most points** — Bhrigu Bindu, the
  5 Upagrahas, and Indu Lagna are all pure functions of `d1Chart` data
  already loaded. Only Mandi (needs `calculateAscendant` at Mandi's
  instant) and Hora Lagna (needs the Sun's longitude specifically at
  sunrise, via `calculateGrahaEphemerisData`) need new async calls —
  both reuse existing `EphemerisService` methods, no service changes.
- **Indu Lagna is sign-only** classically (no finer degree from its
  counting method), so its "longitude" for the table is represented as
  0° of the resulting sign — noted in code, not hidden.
- **Row architecture unchanged**: `buildRow()` was already generic
  (any label + longitude + D1 rasi + D9 rasi), confirmed by the
  research pass — reused as-is for every special point, just relocated
  from being a private function in the component into
  `planet-positions.util.ts` since this page now has real calculation
  logic of its own (previously it only orchestrated + display-formatted
  shared data).
- **`rows()` (existing sync grahas) is untouched** — special points
  populate a separate `specialPointRows` signal via a new `effect()`
  (matching the Shadbala/Sade-Sati async-signal pattern), and the
  template's table binds to a combined `allRows()` computed. This keeps
  the Navamsa Matrix (`planetMatrix`, deliberately scoped to the 9
  grahas + Ascendant per `.claude/todo-plans/10-...md`) reading from the
  original unchanged `rows()`, so it's unaffected by the new rows.

## Relocations (2nd-feature-needs-it precedent, same as prior sessions)

- `getMandiInstant` + `MANDI_DAY_MUHURTA_COUNT`/`MANDI_NIGHT_MUHURTA_COUNT`:
  `panchang.util.ts`/`panchang.data.ts` → `shared/utils/ephemeris.util.ts`
  (next to `calculateHora`/`getHoraLord`/`WEEKDAY_LORD`, the same
  "weekday/time-based point" category). `MandiResult` type and
  `MANDI_HOUSE_REMEDIES` stayed in Panchang (display-specific).
- `RASI_LORD`: `shadbala.data.ts` → `shared/utils/ephemeris.util.ts`
  (next to `RASI_NAMES`) — Indu Lagna needs "which graha owns rasi X"
  the same way Shadbala's Saptavargaja Bala already did.

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

- `pages/planet-positions/planet-positions.data.ts` — NEW: Sun-Upagraha
  offset constants, `INDU_LAGNA_KALANADI` table.
- `pages/planet-positions/planet-positions.util.ts` — NEW: `buildRow`
  (relocated from the component), `calculateHoraLagna`,
  `calculateBhriguBindu`, `calculateInduLagna`, and the 5 chained
  Upagraha functions.
- `pages/planet-positions/planet-positions.component.ts` — orchestration:
  existing `rows` computed unchanged; new `effect()` computes the 7
  synchronous special points immediately and the 2 async ones
  (Mandi/Hora Lagna) via `Promise.all`, then sets all 9 into
  `specialPointRows` together; new `allRows` computed concatenates both
  for the table.
- `pages/planet-positions/planet-positions.component.html` — table now
  binds `[rows]="allRows()"`; added a one-line `*` caveat note below it
  for Indu Lagna.
- `REFERENCES.md` — new "Special points" subsection under Planet
  Positions citing the exact BPHS verses used and flagging Indu
  Lagna/Bhrigu Bindu's un-fresh-cited status.

## Steps

1. DONE — Research subagent confirmed existing Mandi code + total
   absence of the other 4 concepts anywhere in the repo.
2. DONE — Fetched BPHS Ch.3/Ch.5 directly for Hora Lagna and the 5
   Sun-based Upagrahas; identified the Kaala/Mrityu/Yamaghantaka/
   Ardhaprahara method-reliability problem.
3. DONE — Asked the user how to handle the 4 suspect upagrahas and
   Indu Lagna's un-verified formula; both resolved with the
   recommended (skip 4 / implement Indu Lagna flagged) options.
4. DONE — Relocated `getMandiInstant`/muhurta tables and `RASI_LORD` to
   `shared/utils`, verified with `tsc --noEmit`/`ng build` after each
   relocation before continuing.
5. DONE — Implemented `planet-positions.data.ts`/`.util.ts`, wired the
   component's new effect + `allRows`, updated the template.
6. DONE — Range-swept Hora Lagna/Bhrigu Bindu/Indu Lagna/the 5
   Upagrahas in Node across representative inputs — all stay in valid
   0-360°/0-11 range, Indu Lagna produces all 12 possible rasis across
   a full sweep (not degenerate).
   → verify: `tsc --noEmit` and `ng build` both clean throughout: no
   live-browser click-through this session (chrome-devtools access is
   off) — recommend a quick manual check: generate a chart, open
   Planet Positions, confirm the 9 new rows appear below the grahas
   with sensible longitudes and no console errors.

## Addendum: Jaimini Chara Karakas

The user asked to add Chara Karakas next to each graha in the same
table, referencing a screenshot ("Sun - PK", "Mars (R) - AmK", etc.)
and explicitly requesting the 7-planet scheme (Sun-Saturn, no
Rahu/Ketu).

- Rank the 7 classical grahas by degree-within-sign descending:
  highest = Atmakaraka (AK), down to Darakaraka (DK) for the lowest.
  Verified against the screenshot's exact ranking order (Saturn=AK,
  Mars=AmK, Jupiter=BK, Mercury=MK, Sun=PK, Moon=GK, Venus=DK) with a
  synthetic Node test reproducing that ordering exactly.
- Confirmed via 2 independent sources that retrograde planets (Mars in
  the screenshot) use their degree as-is for ranking — no adjustment.
  The "30 minus degree" rule some sources mention is specific to Rahu
  in the 8-planet scheme, not applicable here.
- New ephemeris call added to the existing special-points `effect()`:
  `calculateGrahaEphemerisData(birthTime, ayanamsa)` for `longitudeSpeed`
  (retrograde detection) - reuses the same method Shadbala already
  uses for its own retrograde-sensitive sub-components, no service
  changes needed.
- **Deliberately did not bake the karaka label into `PlanetPositionRow.body`**
  for graha rows - the Navamsa Matrix (`planetMatrix`/`matrixCell`)
  keys off `row.body` matching plain graha names from `MATRIX_PLANETS`,
  and decorating it (e.g. "Mars (R) - AmK") would have silently broken
  every matrix lookup. Used a `bodyCell` table `cellTemplate` instead
  (same mechanism already used for the Karmic Dosha/Karmic Planet
  columns) so the underlying `row.body` stays a plain graha name
  everywhere except this one display spot.

## Addendum: Bhava Positions table

A new hand-rolled table (houses 1-12 as columns, matching Shadbala's
Bhava Bala table's shape/styling precedent, not the generic `Table`
molecule) with 4 rows, all derived from data already computed
elsewhere - no new ephemeris calls, no new research needed:

- **House Lord**: house N's sign = Ascendant's sign + N-1 (whole-sign
  houses, matching every other house-counting feature already in this
  app - Sade Sati, Graha Arudha, Mandi's house remedies all use plain
  sign-counting, not bhava-chalit cusps, so this stays consistent
  rather than introducing a second house convention). Lord = `RASI_LORD`
  of that sign.
- **NTR**: the D9 sign the House Lord graha is posited in (kept the
  user's own label verbatim rather than guessing an expansion for the
  abbreviation).
- **Dispositors**: D1 dispositor = lord of the House Lord's own D1
  sign; D9 dispositor = lord of the House Lord's D9 sign (i.e. lord of
  the NTR sign). A graha can be its own dispositor (e.g. Mars sitting
  in Scorpio, which Mars also rules) - this falls out naturally from
  the lookup, no special-casing needed, verified in a Node sweep.
- **Dispositor Combinations**: reuses each dispositor's own
  already-computed `rasiCombination` string from the main table's rows
  (via a `body -> rasiCombination` lookup map) - no recalculation, per
  the user's explicit instruction to just display the existing value.
- Verified with a full 12-house Node sweep (fake chart data) that every
  house lord/dispositor is always one of the 7 classical grahas (never
  Rahu/Ketu, since `RASI_LORD` never returns them) and every house's
  sign cycles correctly from the Ascendant.

## Status

Implemented and building cleanly. Formulas researched from BPHS directly
where possible (Hora Lagna, 5 Sun-Upagrahas) and range-tested in Node;
Indu Lagna and Bhrigu Bindu are from general knowledge, not fresh
citations, per the user's explicit choice to proceed anyway. Chara
Karakas verified against the user's own reference screenshot. Bhava
Positions is a pure reuse/derivation of already-computed data, verified
with a Node sweep. Not yet verified in a live browser.
