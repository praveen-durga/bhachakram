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

## Status

Implemented and building cleanly. Formulas researched from BPHS directly
where possible (Hora Lagna, 5 Sun-Upagrahas) and range-tested in Node;
Indu Lagna and Bhrigu Bindu are from general knowledge, not fresh
citations, per the user's explicit choice to proceed anyway. Not yet
verified in a live browser.
