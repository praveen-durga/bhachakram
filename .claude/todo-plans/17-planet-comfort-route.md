# Plan: Planet Comfort route

## Goal

New `/planet-comfort` route implementing the user's "Star Devata Comfort

- 40 Points Generalized Scoring Framework" exactly as specified: for
  each of the 9 grahas, a 0-40 score built from 3 tiers (Guna
  compatibility, specific-enemy penalty, Yogakaraka/Subhakaraka uplift),
  classified into 4 bands.

## Validation approach

The user's own written spec contained several internal contradictions
(see below), so rather than implement from the prose alone, every piece
was reverse-verified against the **actual reference image** (a real
computed table, the most trustworthy single source available) before
writing any code:

- **Star Devata** = the nakshatra's Vimshottari lord (standard 9-cycle,
  already implemented and previously-verified as `getNakshatraLord`).
  Confirmed against all 9 rows.
- **Star Guna** = the Guna of the Star Devata itself, NOT a separately
  transcribed 27-nakshatra table. Verified this by computing it both
  ways for all 27 nakshatras — identical result every time — and the
  spec's own closing note explicitly permits this ("If you know the
  guna of each star, you can use it directly"). Confirmed against all 9
  rows' Star Guna column.
- **Tier 1** (Guna-distance base score: Same=30, Other=15, Opposite=5) —
  confirmed against all 9 rows.
- **Tier 2** (-6 for a _specific_ enemy pair, asymmetric/directional
  exactly as listed in Section 4, not classical Naisargika Maitri) —
  confirmed against all 9 rows, including which rows do vs. don't show
  the "Enemy" badge.
- **Subtotal floors at 0** — confirmed via Example 3 ("even if Enemy it
  will not go below 0").
- **Tier 3 Yogakaraka (+10)**: planet owns a Kona house (1/5/9 from the
  chart's own Ascendant) and no Trika house (6/8/12). House ownership
  uses `GRAHA_OWNED_RASIS` (RASI_LORD + the modern Rahu=Aquarius/
  Ketu=Scorpio co-rulership already established for Graha Arudha in the
  Vargas feature — reused here, not reinvented). **The chart's
  Ascendant isn't given anywhere in the image** — reverse-solved it by
  testing which Ascendant makes all 4 of the image's "+10 YK" rows
  (Moon/Mars/Jupiter/Ketu) come out as Yogakaraka while the other 5
  don't: only Pisces Lagna works, and it reproduces all 9 rows exactly.
  This isn't a fixed constant in the code — the real implementation
  uses the actual chart's own Ascendant at runtime, Pisces was only
  used to validate the _rule_, not hardcoded anywhere.

## Two rounds of clarifying questions

The spec was self-contradictory on Tier 3's second-highest uplift:

1. **SK's point value**: Section 2/6/9/the Conclusion all say +6;
   Section 5 alone says +5; the worked examples describe SK and a
   separate "Group Uplift" as two different things. Asked the user —
   confirmed these are genuinely two independent conditions, not a
   typo consolidating into one.
2. **What triggers "Group Uplift" (+5)**: nothing in the text defines
   it precisely, and my best guess (classical natural friendship)
   didn't fit Example 5. Asked again — user specified: Group Uplift
   applies when the planet's Guna equals its Star Devata's Guna (same
   condition Tier 1 scores as "Same"), independent of house lordship.

Implemented as: Tier 3 = highest of {YK=10 if Kona-no-Trika, SK=6 if
Kona-and-Trika, Group=5 if Planet Guna == Star Guna}, else 0.

**Known residual discrepancy, disclosed rather than hidden**: this
formula reproduces the real reference image exactly (9/9 rows) and 3 of
the 4 independently-testable worked examples exactly (Ex1=9, Ex2=25,
Ex4=21 all match; Ex3 has no stated Ascendant so isn't fairly
testable). Example 5 (Aries Lagna Jupiter in Punarvasu) is the one
exception: the formula gives Total=36 (SK fires, since Jupiter owns
both a Kona and a Trika house from Aries Lagna) where the example's
prose states 35 (only "Group Uplift 5"). Given the formula matches the
_real table_ and _3 other examples_ exactly, this is treated as a
one-point slip in that single hand-written example, not a flaw in the
implemented rule — flagging it here for visibility rather than quietly
picking whichever answer happened to match.

## Relocations (2nd/3rd-feature-needs-it precedent, consistent with prior sessions)

- `NAKSHATRA_LORD_CYCLE` / `getNakshatraLord`: `panchang.data.ts`/
  `panchang.util.ts` → `shared/utils/ephemeris.util.ts`.
- `GRAHA_ARUDHA_LORDSHIP` (Vargas' Graha Arudha lordship table) →
  renamed `GRAHA_OWNED_RASIS` and relocated to
  `shared/utils/ephemeris.util.ts`, since this is now the 2nd feature
  needing "which sign(s) does this graha own, including the modern
  Rahu/Ketu co-rulership convention."

## File/folder structure (SRP, per standing `.claude/PROJECT.md` rule)

- `pages/planet-comfort/planet-comfort.model.ts` — `Guna`,
  `ComfortBand`, `PlanetComfortRow` types.
- `pages/planet-comfort/planet-comfort.data.ts` — `PLANET_GUNA`,
  `SPECIFIC_ENEMY`, Tier point-value constants, Kona/Trika house
  offsets, band thresholds.
- `pages/planet-comfort/planet-comfort.util.ts` — `buildPlanetComfortRow`
  and the Tier 1/2/3 calculation functions, no ephemeris calls needed
  (pure functions of `d1Chart`, already loaded).
- `pages/planet-comfort/planet-comfort.component.ts` — orchestration:
  one synchronous `computed()` over the 9 grahas, using the existing
  generic `Table` molecule with 3 `cellTemplate`s (Star Devata + Enemy
  badge, Tier 3 + YK/SK/Group label, colored Band badge) — the row
  shape (one row per planet, mostly plain columns) fits the molecule
  well, unlike several other recent tables that needed hand-rolling.
- `app.routes.ts` / `app.component.html` — new guarded route + 8th nav
  link, same pattern as every other route.

## Steps

1. DONE — Parsed the full spec, found the internal contradictions.
2. DONE — Verified Star Devata/Star Guna/Tier1/Tier2/subtotal-clamp
   against all 9 rows of the reference image.
3. DONE — Reverse-solved the reference chart's Ascendant (Pisces) from
   the Tier 3 YK pattern, confirming the house-lordship rule.
4. DONE — Asked 2 rounds of clarifying questions to resolve the SK vs.
   Group Uplift contradiction.
5. DONE — Implemented and validated in Node: all 9 real image rows
   match exactly; 3/4 testable text examples match exactly (Ex5's
   1-point gap documented above); full 12-Ascendant × 27-nakshatra ×
   9-planet sweep (2,916 combinations) stays within the valid 0-40
   range with a valid band every time.
   → verify: `tsc --noEmit` and `ng build` both clean. No live-browser
   click-through this session (chrome-devtools access is off) —
   recommend a quick manual check: generate a chart, open Planet
   Comfort, confirm 9 rows render with sensible values and no console
   errors.

## Status

Implemented and building cleanly. Formulas validated end-to-end against
the user's own reference image (exact match, 9/9 rows) and cross-checked
against the written examples (3/4 exact, 1 known 1-point discrepancy
disclosed above). Not yet verified in a live browser.
