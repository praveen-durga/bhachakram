# Transit Aspects: "Result" and "Result Time" columns (market-astrology rule engine)

## Context

The Transit Aspects page currently detects every crossing of 12 fixed angles (30/45/60/90/120/150/180/210/240/270/300/360°) between all 66 pairs of 12 bodies (9 grahas + Uranus/Neptune/Pluto), showing the exact date/time, both planets' sign, and both planets' declination trend/value/latitude per row.

The user supplied a large, self-admittedly ambiguous rules spec ("market astrology" — bullish/bearish trading signals per aspect) and asked for two new columns, **Result** and **Result Time**, placed after "Planet B Declination". The spec's own §8 lists 12 unresolved contradictions. Six of the highest-impact ones were already resolved via `AskUserQuestion` this session:

1. **Modifier rule (§4.6)**: combust/retro/debilitated on either planet → same-dispositor-group pair always **+**, different-group pair always **−** (overrides the base result).
2. **Dispositors**: modern co-rulers for outer planets + Rahu/Ketu fallback (see "Simplification" below — turns out not to require new data).
3. **Mixed benefic/malefic pairs** (pair-property rule, §4.2): fall back to the dispositor/group rule.
4. **Result scope**: Bullish/Bearish **plus the winning planet's name** where a winner is determined (jay/parajay).
5. **Result Time**: a **new** column, separate from the existing "Date & Time" (which keeps showing the exact angle-crossing instant unchanged).
6. **Angle scope**: expand from 12 angles to the **full aspect table** (40 angles total, majors + minors), not just the current 12.

This plan resolves the remaining gaps with concrete, stated interpretations (flagged `[ASSUMPTION]`) grounded in the spec's own text, and lays out the implementation. Given the scale (a full rule engine across 40 angles, 66 pairs, with directional exceptions, navamsha, dispositors, jay/parajay, drashya/drashta, and timing shifts), this is a large feature — expect ~5 new/changed files and several hundred lines.

## Remaining interpretive decisions (`[ASSUMPTION]`, for your review)

These aren't further questions — they're concrete choices made from the spec's own wording, listed so you can redirect anything before I code it.

- **180° never uses the generic pair-property rule.** Its aspect-table row says "Planet property; drashya/drashta (§6)", and §6's heading is explicitly "180° only" with a complete, self-contained rule (drashta's benefic/malefic nature decides). So 180° always resolves via drashya/drashta, and the mixed-pair dispositor fallback (item 3 above) is never invoked for it.
- **0°/360° (conjunction) mixed-pair case uses jay/parajay, not the dispositor fallback.** §5 is literally the dedicated mechanism for conjunction; the dispositor fallback (item 3) turns out to have **zero live call sites** in the final 40-angle rule set (every angle has a more specific dedicated resolver: §4.1/§4.3/§4.4/§4.5/§5/§6). I will _not_ write an unreachable fallback branch (no dead code) — I'll note this plainly in the code comment instead.
- **"Winner's related sector does well" (§5) → the result takes the winning planet's own benefic/malefic character.** No sector mapping exists anywhere in the notes, so for a mixed-pair conjunction, winner-is-benefic → Bullish, winner-is-malefic → Bearish, and the winner's name is shown per your Result-scope answer (e.g. "Bullish (Jupiter)").
- **"Good navamsha" (§4.1, gating the 150°/210° 6/8 rule) = navamsha trikon**, reusing the exact "navamsha trikon" concept §4.5 already defines for the 120° trine (both planets' D9 signs mutually in trine — 1st/5th/9th from each other).
- **90°/270° (Kendra) is a flat default, not pair-property-gated.** The aspect table itself says "Always −, with exceptions" for 90° — read literally, that's an unconditional default, so 90°/270° checks only the two named exceptions (Sun–Jupiter → +; Mars's 4th aspect on Saturn → +, Saturn's 10th aspect on Mars → −) and otherwise flatly resolves to **−**, without consulting benefic/malefic pairing at all.
- **60°/300° and 72°/288° share one resolver** (§4.3's "always +, except Saturn's 3rd aspect (−) / 11th aspect (+)"). 72° ("Trikadasha") isn't given its own worked rule, but its stated default (+) matches 3/11's pattern, not Kendra's, and its resolver hint literally says "3/11 or kendra" — I pick 3/11.
- **45°/315° is a flat "−"**, per the aspect table's own explicit Default column and the "(Western view: −)" note — not computed via dispositor.
- **135°/225° ("6/8 or trine")**: `(dispositorsSameGroup OR navamshaTrikon) → +, else −` — combining §4.5's trine condition with §4.1's shubh-6/8 condition as two alternative positive paths, matching "Trine and shubh 6/8 → +; ashubh 6/8 → −".
- **20 minor angles (6/9/12/15/18/20/24/30/36/40°, each mirrored) all resolve via the plain §4.1 dispositor rule** — their resolver hints ("2/12 or conjunction", "2/12 or 3/11") all name 2/12 first, and I'm using the actual computed group comparison rather than forcing each angle's loosely-stated "Default" sign.
- **144°/216° and 22.5°/337.5° have no resolver** (explicitly stated in your notes) → Result shows **"—"**, Result Time shows **"—"**, no modifiers applied.
  - **Update (user follow-up):** the user has since supplied resolvers for both: 22.5°/337.5° is now a flat "Bearish" (same treatment as 45°/315°), and 144°/216° now uses the same Sadashtak (6/8) rule as 150°/210° (`resolve68`). No angle is left without a resolver any more.
- **Dispositor lookup needs no new data.** The existing `RASI_LORD` (classical rulers only, `src/app/shared/utils/ephemeris.util.ts:62-75`) already assigns all 12 signs to one of the 7 classical grahas, and — because Group A/B (§2) puts every modern co-ruler in the _same_ group as its classical counterpart (Saturn & Uranus both Group B; Jupiter & Neptune both Group A; Mars & Pluto both Group A) — a modern-co-ruler table would never change a group-based outcome. So dispositor **group** lookup reuses `RASI_LORD` unchanged; this also transparently handles Rahu/Ketu/outer planets as _occupants_ of a sign (dispositor is a property of the sign occupied, not of the occupying planet), so no special-casing is needed there either.
- **Debilitation for Uranus/Neptune/Pluto**: no classical or notes-given degree exists → always `isDebilitated = false` for these three.
- **Combustion for Sun/Rahu/Ketu/Uranus/Neptune/Pluto**: always `isCombust = false`, matching the existing app-wide convention (`COMBUSTION_ORB_DEG`, `src/app/shared/services/ephemeris.service.ts:39-46`, already excludes Sun/Rahu/Ketu; outer planets aren't part of classical combustion doctrine).
- **Debilitation is whole-sign** (classical Neecha rashi), not a narrow degree band: `floor(longitude/30) === floor((exaltationLongitude+180)/30)`.
- **"Mercury associated with a malefic" (§2, malefic override)** = Mercury is one of the pair being evaluated and the _other_ planet in that same pair is a natural malefic. Scoped to the pair itself, not the whole chart.
- **"Within 72° of Sun" (§2, Moon malefic override)** = absolute circular separation ≤ 72°, per your own `[ASSUMPTION]` in the notes.
- **§7 timing shift only uses the "Time" column of §3's table** (35min/52min/70min/210min/140min/157.5min/145min/210min/210min for 30/45/60/90/120/135/150/180/0°), not the orb/ardh-bhag arc-degree values — because this plan doesn't do orb-window detection (still exact-crossing detection, as today), only a timing nudge. This sidesteps the ⚠ 90° orb anomaly you flagged entirely, since the orb value itself is never used. **Angles without a listed Time value (72°, 144°, 22.5°, and all 6–40° minors) get no shift — Result Time = Date & Time.**
- **§7's two uncovered cases** (decisive planet north+decreasing, or south+increasing) also get no shift — Result Time = Date & Time.
  - **Update (post-implementation bug report):** this turned out to be wrong in two ways once the columns shipped as Result Start/End Time. First, `ARDH_BHAG_MINUTES_BY_ANGLE` only had keys for the 9 "primary" angles (30/45/.../180/360), not their mirrors (210/225/.../330) — so every mirror-angle row got a zero-width window regardless of trend, a straightforward bug (fixed by mirroring each entry). Second, on reflection the "uncovered cases" default was too conservative: the pattern in the notes' two worked examples is really "rising declination → after, falling → before," with north/south just describing which hemisphere those two examples happened to be in — not an independent condition. `computeResultTimeRange` now keys purely off the trend (`isDeclinationIncreasing`), covering all four hemisphere/trend combinations with no gap. Angles with no listed Time value at all (72°/144°/22.5° and the minor 6-40° set) still get no shift — that limitation is real, not a bug.
- **Kranti samya** (declination convergence within 1°, independent of longitude angle) is **not** implemented as a separate scan for new rows — it would detect a whole new, unrelated class of events, which conflicts with "add a column" scope. Jay/parajay is only evaluated at already-detected 0°/360° conjunction rows (using latitude, as §5 literally says: "compare latitudes"). If you want kranti samya as its own detection pass later, that's a separate follow-up.
- **Unused classifications** (Bimb, Tara graha, Shadow) are not implemented — the notes' own §8 item 10 says no rule uses them, and unused code isn't written per this project's conventions.

## Angle set: 12 → 40

`TRANSIT_ASPECT_ANGLES` in `src/app/pages/transit-aspects/transit-aspects.data.ts:23` expands from 12 to all angle-table entries (majors + minors, both mirrors, minus the redundant literal "0" since "360" already detects the same physical conjunction events via the existing periodic-crossing search):

```
6, 9, 12, 15, 18, 20, 22.5, 24, 30, 36, 40, 45, 60, 72, 90, 120, 135, 144, 150, 180,
210, 216, 225, 240, 270, 288, 300, 315, 320, 324, 330, 336, 337.5, 340, 342, 345, 348, 351, 354, 360
```

**Performance note**: 40 angles × 66 pairs is a >3x increase in detected-event volume over today. Separately, the smallest target (6°) requires finer sampling than the current daily grid — see below. Both changes make wide date ranges noticeably slower to compute; flagging this now since "no cap on range" was already chosen for this page.

## Sampling resolution

The existing crossing-detector's safety comment (`transit-aspects.util.ts:132-136`) says daily sampling is safe _because_ the smallest target was 30° and the fastest relative motion (Moon vs. anything) is well under 30°/day. With a 6° minimum target now in scope, that safety margin is gone — a full dip-below-6°-and-back could occur within a single day for Moon pairs and be invisible to endpoint comparison.

Fix: change `buildDailySampleDates` (`transit-aspects.util.ts:6-13`) to a parameterized `buildSampleDates(start, end, intervalHours)` and sample every **4 hours** (6 samples/day) instead of daily. At Moon's worst-case relative speed (~15°/day), that's ~2.5° of motion between samples — safely under the 6° floor for the normal (non-retrograde-station) case. This is a ~6x increase in ephemeris calls on top of the 3x angle-count increase; still expected to be tractable (WASM `calc_ut` calls are fast) but will be noticeably slower for month+ ranges.

## Ephemeris data needed per body per sample

Today `calculateTransitLongitudes` and `calculateTransitDeclinations` (`ephemeris.service.ts:195-247`) are two separate calls, each used only by this page. They're merged into one richer method:

```ts
export type TransitBodySnapshot = {
  longitude: number;
  speed: number;          // negative = retrograde (existing app convention, ephemeris.service.ts:458)
  declination: number;
  eclipticLatitude: number;
  isCombust: boolean;
  isDebilitated: boolean;
};

async calculateTransitSnapshot(datetime: Date, ayanamsa: Ayanamsa): Promise<Record<Graha | OuterPlanet, TransitBodySnapshot>>
```

- `speed`: add `EPHEMERIS_FLAG_SPEED` to the existing sidereal `calc_ut` call (already used elsewhere, e.g. `ephemeris.service.ts:174`), capture longitude speed the same way `#toGrahaPositions` does.
- `isCombust`: reuse `COMBUSTION_ORB_DEG` (`ephemeris.service.ts:39-46`) exactly as `#toGrahaPositions` already does (`ephemeris.service.ts:458-462`) — compute Sun's longitude first in the loop, then check each other body's angular distance from it against its orb (undefined orb → never combust).
- `isDebilitated`: needs `EXALTATION_LONGITUDE`. This currently lives in `src/app/pages/shadbala/shadbala.data.ts:8-18` (page-scoped, 9 grahas only). Relocate it to `src/app/shared/utils/ephemeris.constants.ts` (already the shared home for `RASI_LORD` etc.) as the canonical source, and have `shadbala.data.ts` re-export it (`export { EXALTATION_LONGITUDE } from '../../shared/utils';`) so `shadbala.util.ts` and `tajik-lords.util.ts` need no changes. `calculateTransitSnapshot` computes `isDebilitated = floor(longitude/30) === floor((EXALTATION_LONGITUDE[graha]+180)/30)` for the 9 grahas; Uranus/Neptune/Pluto always `false`.

`calculateTransitLongitudes`/`calculateTransitDeclinations` and the `TransitDeclinationData` type are removed (only consumer is this page's component).

## Rule engine (new file)

`src/app/pages/transit-aspects/transit-aspects-result.util.ts` — pure functions, no Angular/service dependencies, consuming per-event data already available (both bodies' interpolated longitude/sign/navamsha/declination-trend/latitude/speed/isCombust/isDebilitated at the event instant — navamsha computed via existing `calculateD9Rasi`, `src/app/shared/utils/ephemeris.util.ts:333-342`).

Key building blocks:

- `GROUP_A` / `GROUP_B` membership sets, `dispositorGroup(sign)` via `RASI_LORD`.
- `isNaturalBenefic(body, {declinationSeparationFromSun, otherBodyInPair})` — encodes the Moon-within-72°-of-Sun and Mercury-associated-with-malefic conditional overrides (§2).
- One resolver function per rule family: `resolveDispositorPair` (§4.1, used by 30/330, 150/210, and the 20 minor dispositor-rule angles), `flatMinus` (45/315), `resolve3Or11` (§4.3, used by 60/300 and 72/288, with the Saturn directional check via `degnorm(longitudeB - longitudeA)` at the interpolated event — already computed in `transit-aspects.util.ts`, just needs to flow through unwrapped/not-abs), `resolveKendra` (§4.4, 90/270, Sun-Jupiter and Mars/Saturn directional checks the same way), `resolveTrine` (§4.5, 120/240), `resolveTrineOr68` (§4.1+§4.5 combo, 135/225), `resolveDrashyaDrashta` (§6, 180 only, fixed Makar-lagna houses via `houseFromMakarLagna(sign) = ((sign - 9 + 12) % 12) + 1`), `resolveConjunction` (§4.2 + §5 jay/parajay, 360 only), `noResolver` (144/216, 22.5/337.5, returns `null`).
- `applyModifiers(baseResult, bodyA, bodyB)` — the §4.6 override, applied after the base resolver (skipped when base is `null`).
- `computeResultTime(event, decisivePlanetInfo)` — §7's shift, using the fixed minute table for the 9 angles that have one.

A dispatch table maps each of the 40 angles to its resolver function (many share one, as listed above).

## Wiring into the existing crossing detector

`transit-aspects.util.ts`'s `findAngleCrossings`/`findTransitAspectEvents` already interpolate longitude/sign/declination/latitude at each crossing — extended to also interpolate `speed`, recompute `isCombust`/`isDebilitated` at the interpolated longitude (not interpolate the booleans themselves, consistent with how sign/declination-trend are already recomputed rather than carried forward), compute each body's navamsha sign, and call into the new rule-engine dispatch table to fill `result`/`resultTime`. Sun's own unwrapped-longitude array needs to be available inside `findAngleCrossings` for every pair's combustion check (not just when Sun is bodyA/bodyB) — passed through as an extra parameter.

`TransitAspectEvent` (`transit-aspects.model.ts`) gains:

```ts
result: string; // "Bullish" | "Bearish" | "Bullish (Jupiter)" | "—" | ...
resultTime: Date;
```

## UI changes

`transit-aspects.component.html`: two new `<th>`/`<td>` pairs ("Result", "Result Time") after "Planet B Declination", `colspan` on the empty-state row goes from 8 to 10. `resultTime` formatted with the same `DatePipe` format as the existing Date & Time column.

`transit-aspects.component.ts`: `findAspects()` collapses its two parallel `Promise.all`s into one, calling `calculateTransitSnapshot`; `buildDailySampleDates` call becomes `buildSampleDates(start, end, 4)`.

## Files touched

- `src/app/shared/services/ephemeris.service.ts` — replace the two transit methods with `calculateTransitSnapshot`; relocate combustion logic reuse.
- `src/app/shared/utils/ephemeris.constants.ts` — add `EXALTATION_LONGITUDE` (moved from shadbala.data.ts).
- `src/app/pages/shadbala/shadbala.data.ts` — re-export `EXALTATION_LONGITUDE` instead of defining it.
- `src/app/pages/transit-aspects/transit-aspects.data.ts` — expand `TRANSIT_ASPECT_ANGLES` to 40 entries.
- `src/app/pages/transit-aspects/transit-aspects.util.ts` — sampling interval param, richer interpolation, wiring to the rule engine.
- `src/app/pages/transit-aspects/transit-aspects-result.util.ts` — new, the rule engine.
- `src/app/pages/transit-aspects/transit-aspects.model.ts` — add `result`/`resultTime` fields.
- `src/app/pages/transit-aspects/transit-aspects.component.ts` — single snapshot call, finer sampling.
- `src/app/pages/transit-aspects/transit-aspects.component.html` — two new columns.

## Verification

1. `npx tsc --noEmit -p tsconfig.app.json` — clean.
2. Synthetic unit checks via `npx tsx` (same technique used earlier this session for the crossing detector and the declination-direction logic) against the new rule-engine functions directly: a same-group dispositor pair at 30° → Bullish; a Saturn 60°-forward pair → Bearish (3rd aspect) vs Saturn 300°-forward → Bullish (11th aspect); Sun–Jupiter at 90° → Bullish; a combust same-group pair → Bullish (modifier override); a 144° pair → "—".
3. `npx prettier --write` on all touched files.
4. `npx ng build` — confirm only the pre-existing unrelated SCSS-budget errors remain (vargas/modal/select/button/tajik/input).
5. `npx ng serve` smoke test — confirm the `transit-aspects-component` chunk compiles with no errors; grep for `ERROR` in the output.
6. No browser automation available in this environment — build/serve success is the extent of verification, stated explicitly when reporting completion, same as every prior feature this session.
