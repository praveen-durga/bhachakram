# Plan: Deities route

## Goal

Add a new `/deities` route, reachable via a fifth nav link alongside
Planet Positions, Panchang and Shadbala (same `chart-links` nav, same
`hasBirthDetailsGuard`, same lazy-loaded standalone page pattern). One
table: rows = Ascendant + the 9 grahas (Sun through Ketu, matching
`MATRIX_PLANETS`), columns = the presiding deity for that graha/Asc in
each of D3, D4, D9, D10, D12, D16, D24, D30, D45, D60 — the 10 vargas
requested, in that order.

## Data source

Single primary source for every deity list: **Brihat Parashara Hora
Shastra, Chapter 6 ("Shodasavarga"), verses 7–41** (R. Santhanam
translation), fetched directly from the full text. One consistent
translation used throughout — not mixed with other secondary sites —
per the user's confirmed preference to research classical sources and
only implement what's verifiable. Every constant is real (no `—`
placeholders needed); the exact BPHS verse numbers are cited as
comments in `deities.data.ts`, matching the citation style already
used in `shadbala.data.ts`.

Key finding that changes the original ask slightly: **BPHS doesn't
name individual deities for every varga.**

- D3, D4, D12: a short fixed list of deities that repeats identically
  for every sign (no odd/even variation).
- D9 (Navamsa): the text doesn't give named deities at all — only the
  three-fold **Deva / Manushya / Rakshasa** designation, cycling
  through the 9 divisions. This is the closest classical equivalent
  and is what's shown in the D9 column. Flagging this now since it's
  a different kind of label than the other 9 columns (a classification,
  not a named god) — this is the standard convention other Vedic
  astrology software uses for a Navamsa "deity" column too.
- D10, D16, D24, D60: a fixed-length list, reversed for even signs vs.
  odd signs.
- D30 (Trimsamsa): **does** have named deities (Agni/Vayu/Indra/
  Kubera/Varuna) mapped onto the same 5 unequal degree-spans already
  used for the Trimsamsa lord (Mars/Saturn/Jupiter/Mercury/Venus) —
  resolves the earlier open question about D30 cleanly, it's not just
  planetary lords.
- D45 (Akshavedamsa): a 3-deity rotation, but which of 3 possible
  rotations applies depends on the sign's modality (movable/fixed/
  dual), not odd/even.

## Verified per-varga rules (BPHS Ch.6)

| Varga | Divisions               | Deity list source                                                                                                  | Odd/even or modality rule                                                                   |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| D3    | 3, 10° each             | Narada, Agastya, Durvasa (v.7-8)                                                                                   | none — same for all signs                                                                   |
| D4    | 4, 7°30' each           | Sanaka, Sanandana, Kumara, Sanatana (v.9)                                                                          | none — same for all signs                                                                   |
| D9    | 9, 3°20' each           | Deva, Manushya, Rakshasa, cycling 3x (v.12)                                                                        | none — same cycle for all signs                                                             |
| D10   | 10, 3° each             | Indra, Agni, Yama, Rakshasa, Varuna, Vayu, Kubera, Isha, Brahma, Ananta (v.13-14)                                  | odd sign = as listed; even sign = reversed                                                  |
| D12   | 12, 2°30' each          | Ganesha, Ashwini Kumara, Yama, Sarpa, cycling 3x (v.15)                                                            | none — same for all signs                                                                   |
| D16   | 16, 1°52'30" each       | Brahma, Vishnu, Shiva, Surya, cycling 4x (v.16)                                                                    | odd sign = as listed; even sign = reversed                                                  |
| D24   | 24, 1°15' each          | Skanda, Parashurama, Agni, Vishwakarma, Bhaga, Mitra, Maya, Yama, Shiva, Vishnu, Kama, Bhima, cycling 2x (v.22-23) | odd sign = as listed; even sign = reversed                                                  |
| D30   | 5, unequal (5/5/8/7/5°) | Agni, Vayu, Indra, Kubera, Varuna (v.27-28) — same 5 segment boundaries as existing `calculateD30Rasi`             | odd sign = as listed on the odd boundaries; even sign = reversed, on the even boundaries    |
| D45   | 45, 0°40' each          | 3-deity group cycling 15x (v.31-32)                                                                                | movable sign → Brahma,Shiva,Vishnu; fixed → Shiva,Vishnu,Brahma; dual → Vishnu,Brahma,Shiva |
| D60   | 60, 0°30' each          | 60 named divisions (v.33-41)                                                                                       | odd sign = as listed; even sign = reversed                                                  |

Division index for every equal-division varga is simply
`floor(degreeInRasi / divisionSpan) % list.length` — this is
independent of which rasi the division maps to, so **none of the
existing `calculateD9Rasi`/`calculateD3Rasi`/etc. rasi-mapping
functions are needed or touched**; this is a separate, simpler
calculation (which numbered division a degree falls in, not which
sign it lands in). D30 alone needs its 5 unequal boundaries, kept as a
small local constant in `deities.data.ts` (own copy of the boundary
degrees only — not the rasi-mapping logic — so `shadbala.util.ts` is
not touched).

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

Mirrors Shadbala/Panchang's split; fully self-contained, no changes to
any other feature's files:

- `pages/deities/deities.model.ts` — `DeityRow` type (`body` +
  one string field per varga column).
- `pages/deities/deities.data.ts` — the 8 deity-list constants above,
  each with its BPHS verse citation as a comment, plus the D30
  boundary-degree constants.
- `pages/deities/deities.util.ts` — one generic division-index helper
  - one `getXDeity(longitude, isOddRasi/modality)`-style function per
    varga, composed into a `buildDeityRow(body, longitude)` function.
- `pages/deities/deities.component.ts` — orchestration only: reads
  `BirthChartService.d1Chart()`, builds the Ascendant + 9-graha rows
  via `buildDeityRow`, assembles `TableColumn[]` for the existing
  generic `Table` molecule (flat one-row-per-record shape fits
  perfectly here, unlike Shadbala's transposed layout — no hand-rolled
  markup needed).
- `pages/deities/deities.component.html` / `.scss` — same minimal
  shell as Planet Positions' page (`<h1>` + `<app-table>`), no modals.
- `shared/guards/` — reuse existing `hasBirthDetailsGuard`.
- `app.routes.ts` — add `{ path: 'deities', canMatch: [hasBirthDetailsGuard], loadComponent: ... }`.
- `app.component.html` — add a fifth `<a routerLink="/deities">Deities</a>` to `.chart-links`.

## Steps

1. Research BPHS Ch.6 deity lists for all 10 vargas → DONE (see table
   above), cross-verified D30's boundary values against the existing
   `calculateD30Rasi` implementation (segment order matches exactly).
2. Implement `deities.data.ts` (constants + citations), `deities.util.ts`
   (division-index + per-varga deity functions), `deities.model.ts`
   (`DeityRow` type).
3. Implement `DeitiesComponent` (route + guard + nav link), computing
   all 10 columns × 10 rows live from `BirthChartService.d1Chart()`.
   → verify: click-through works, guard redirects correctly without
   birth details, table renders 10 rows × 11 columns (body + 10
   vargas) with correct deity names, no console errors, spot-check a
   handful of divisions by hand against the BPHS verse table above.
4. Review generated code against `.claude/PROJECT.md` conventions
   (SRP file split, standalone component, signals, barrel-free
   page-local imports matching Shadbala's pattern).

## Status

DONE. `DeitiesComponent` is implemented and wired end-to-end (route +
guard + nav link), computing all 10 varga columns x 10 rows (Ascendant +
9 grahas) live from `BirthChartService.d1Chart()`. Verified in a live
browser against a real generated chart: table renders correctly, colors
render, D60 shows name/nature/meaning, no console errors.

Two scope additions beyond the original plan, both requested by the user
after the initial implementation:

- **Per-deity text colors** for D3, D9 and D12 (not from BPHS - specified
  directly by the user): D3's Narada/Agastya/Durvasa are
  blue/orange/lightcoral; D9's Deva/Manushya/Rakshasa use the same 3
  colors in the same position order (D9 and D3 both cycle 3 items); D12's
  Ganesha/Ashwini Kumara/Yama/Sarpa are lightcoral/green/orange/darkred.
  Implemented via `D3_DEITY_COLORS`/`D9_DEITY_COLORS`/`D12_DEITY_COLORS`
  in `deities.data.ts` and per-column `cellTemplate`s bound with
  `[style.color]`.
- **D60 nature + meaning shown in-cell**: the user wanted each D60 cell
  to show not just the deity name but whether it's benefic/malefic and a
  short meaning, referencing a screenshot from
  https://www.sarvatobhadra.com/amsha-rulers-shashtiamsha-d60/ as the
  format example. That screenshot's actual deity names (Roga, Vyadhi,
  Sudha, etc.) turned out to differ from the BPHS (Santhanam) D60 list
  originally implemented - a different textual tradition, not a
  transcription error. The user then explicitly pointed to that same
  sarvatobhadra.com page as the source to use, so the D60 deity list,
  nature and meaning were all replaced with that page's data (60 names,
  verified 1:1 against the source, no duplicates unlike the BPHS list).
  The odd/even-Rasi reversal convention (used for every other varga in
  this file) is still applied to this list since the source page doesn't
  address it one way or the other.

D3/D4/D9/D10/D12/D16/D24/D30/D45 deity names remain sourced from BPHS
Ch.6 (R. Santhanam translation) as originally planned - only D60 switched
sources.
