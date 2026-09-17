# Plan: Vargas route

## Goal

Add a new `/vargas` route (7th nav link, same `hasBirthDetailsGuard`,
lazy-loaded standalone page pattern as every other route). Layout: the
D1 - Rasi chart is always shown first, followed by a row of buttons for
D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D16, D24, D27, D30, D45, D60
(16 vargas, per the request), and the selected varga's chart renders
second, using the same `RasiChartComponent` organism the home page
already uses for D1/D9/Bhava Chalit.

## Key simplification found during investigation

`RasiChartComponent` takes a `D1Chart`-shaped object (`ascendantRasi`,
optional `ascendantLongitude`, `grahas: { graha, longitude, rasi }[]`)
and — confirmed by reading how the home page already renders the D9
chart — the degree label it shows per graha (`formatDegreeInRasi`) is
always computed from the **original D1 longitude** (`longitude % 30`),
never a re-scaled degree-within-the-division. So every varga chart is
just: take the already-loaded `d1Chart` signal, keep each graha's raw
`longitude` as-is, and replace `.rasi` with the output of that varga's
rasi-calculation function. **No new ephemeris calls are needed at all**
— this is a purely synchronous, client-side transform of data the app
already has, unlike Shadbala/Sade Sati which needed new async ephemeris
calls.

## Formula sourcing and confidence

Asked the user how to handle the 5 of 16 requested vargas that aren't
part of BPHS's classical 16-fold Shodasavarga (D5, D6, D8, D11) or whose
BPHS wording was ambiguous after two careful re-reads (D27) — chose
"show all 16 now, best-effort for the uncertain 5, clearly flagged."

**BPHS-confirmed (11 vargas)** — same primary source as the Deities
route (Ch.6 v.7-41), now applied to rasi mapping instead of deity names:
D3, D4, D7, D9 (already existed), D10, D12, D16, D24, D30, D45, D60.

**Best-effort (5 vargas, not BPHS)** — cross-checked 2+ independent
secondary sources per varga rather than one AI-summarized result, and
verified two of them against worked examples:

- **D5 (Panchamsa)**: a fixed, non-arithmetic odd/even lookup list (not
  a formula) — confirmed identical across 2 independent sources.
- **D6 (Shashthamsa)**: odd Rasi starts from Aries, even from Libra —
  2 sources agree, and reproduces a worked example exactly (Sun 17°
  Aries → Cancer).
- **D8 (Ashtamsa)**: movable→Aries, fixed→Sagittarius, dual→Leo — 2
  sources agree on this specific, non-obvious triad (the reverse of
  D16/D45's fixed=Leo/dual=Sagittarius pattern, so not just a guess
  copied from those).
- **D11 (Rudramsa)**: an algorithmic rule (count the Rasi's position
  from Aries, then count that same number backward from Aries to find
  the start) — verified against a worked example exactly (Gemini → 3rd
  from Aries → Aquarius).
- **D27 (Saptavimsamsa)**: BPHS names this varga (v.24-26) but its
  starting-Rasi wording was ambiguous even after 2 re-fetches of the
  primary text. Used instead: an element-based scheme (fire→Aries,
  earthy→Cancer, airy→Libra, watery→Capricorn — earth/water are each
  other's anchor, not their own, which is unusual but was reported
  identically by 2 independent sources).

All 16 rasi-calculation functions were regression-swept across the full
0-360° longitude range (0.29-0.37° steps) to confirm: the 4 relocated
functions (D3/D7/D12/D30) produce byte-for-byte identical output to
their pre-relocation versions, and all 11 new functions always return a
valid 0-11 rasi with no crashes. The D6/D11/D27 worked examples above
were reproduced exactly by the shipped code, not just by hand.

## Shared varga.util.ts consolidation

D3/D7/D12/D30 were previously local to `shadbala.util.ts` (used for
Saptavargaja Bala) and D9 has always lived in `shared/utils/ephemeris.util.ts`.
Since Vargas now needs D3/D7/D9/D12/D30 too, relocated D3/D7/D12/D30 into
a new `shared/utils/varga.util.ts` (D9 stays where it is — no need to
move it, the barrel already re-exports it) and updated `shadbala.util.ts`
to import them instead of defining its own copies — same relocate-when-
a-second-feature-needs-it precedent already used for `findGraha`/
`calculateHora`/etc. during the Shadbala build. `calculateD2Rasi` stayed
local to `shadbala.util.ts` since only Shadbala needs it (D2/Hora isn't
one of the 16 vargas requested here).

All 11 new rasi functions (D4/D5/D6/D8/D10/D11/D16/D24/D27/D45/D60) were
added to this same new `varga.util.ts`, so every varga rasi-calculator
the app has now lives in one place.

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

- `shared/utils/varga.util.ts` — every varga rasi-calculation function
  (relocated + new, see above).
- `pages/vargas/vargas.model.ts` — `VargaOption` type.
- `pages/vargas/vargas.data.ts` — `VARGA_OPTIONS` (the 16 buttons, each
  paired with its rasi function) and `UNVERIFIED_VARGA_KEYS` (drives the
  best-effort-formula caution badge in the UI).
- `pages/vargas/vargas.util.ts` — `buildVargaChart(d1Chart, calculateRasi)`,
  the pure synchronous transform described above.
- `pages/vargas/vargas.component.ts` — orchestration: a `selectedKey`
  signal (defaults to the first option, D3) driving a `computed` that
  rebuilds the displayed varga chart whenever the selection or the D1
  chart changes. No `effect()`/async needed, unlike every other
  non-trivial route so far, since there's no ephemeris call in the
  critical path.
- `pages/vargas/vargas.component.html` / `.scss` — D1 chart + button row
  - selected varga chart, reusing the home page's existing
    `.charts`/`.chart-item`/`.chart-title` class structure (redeclared
    locally since Angular view encapsulation means `app.component.scss`
    doesn't reach here) and the existing `Button`/`RasiChart` components.
- `app.routes.ts` / `app.component.html` — new guarded route + 7th nav
  link, same as every other route.

## Steps

1. DONE — Confirmed `RasiChartComponent`'s data contract and that no new
   ephemeris calls are needed.
2. DONE — Researched and cross-verified rasi formulas for all 16 vargas
   (11 BPHS-confirmed, 5 best-effort per the user's explicit choice).
3. DONE — Relocated D3/D7/D12/D30 into `shared/utils/varga.util.ts`,
   verified behavior-preserving via a full-range regression sweep, added
   the 11 new functions.
4. DONE — Implemented `vargas.model.ts` / `vargas.data.ts` /
   `vargas.util.ts` / `vargas.component.*`.
5. DONE — Wired route + nav link.
   → verify: `tsc --noEmit` and `ng build` both clean; full-range sweep
   script confirms every function's output stays in range and the
   relocation didn't change Shadbala's behavior; worked examples for
   D6/D11/D27 reproduced exactly. No live browser click-through this
   session (chrome-devtools access was turned off) — recommend a quick
   manual check: generate a chart, open `/vargas`, click through a few
   buttons (especially the `*`-marked best-effort ones) and confirm the
   chart repositions planets and nothing errors in the console.

## Addendum: D3 Jagannatha and D3 Somanatha (D3J, D3S)

The user asked to add these as two more buttons, alongside the standard
Parashari D3 (not replacing it) — alternate Drekkana schemes used by
some software.

- **D3 Jagannatha**: found a directly-quoted starting-sign rule
  ("movable sign starts from itself, fixed from the 9th, dual from the
  5th"). Verified this always resolves to the movable member of the
  Rasi's own triplicity (`TRIPLICITY_MOVABLE_SIGN` in `varga.util.ts`)
  across all 12 signs/all 3 modalities by direct computation, not just
  a couple of spot checks. The division-to-division stepping (+4, same
  trine step as Parashari's own D3) is inferred by analogy since no
  source gave the complete rule - flagged as the one uncertain part.
- **D3 Somanatha**: this is the weakest formula in the whole route.
  Three searches found only a vague paraphrase ("similar to Parivritti
  Drekkana but odd signs normal order, even signs reversed") with no
  worked example and no fully-specified rule. Implemented a best-effort
  reading (odd Rasi steps forward to adjacent signs, even Rasi steps
  backward) but this is a reconstruction, not a confirmed rule -
  explicitly called out to the user as the lowest-confidence item here,
  distinct from (and weaker than) the other best-effort formulas.

Both are marked in `UNVERIFIED_VARGA_KEYS` alongside D5/D6/D8/D11/D27.
Range-swept both across the full 0-360° longitude span - stay within
valid 0-11 output, no crashes.

## Status

Implemented and building cleanly. Formulas regression-tested outside the
browser (Node sweep + worked examples), but not yet clicked through live
in the actual running app.
