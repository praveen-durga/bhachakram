# Plan: Planet Positions and Panchang routes (nav links below the chart)

## Goal

Add two new routed pages — Planet Positions and Panchang — reachable via
links displayed below the three charts on the default route. Both routes
must redirect to `''` (the chart page, which prompts for birth details) if
no birth details exist yet. Navigating away and back to a route must not
recompute anything already computed — already solved by the existing
`resource()` + singleton-service pattern (see decision below), no new
state library needed. Four more links (Navamsa, Vargas, Sade Sati, Astaka
Varga) will follow the same pattern later — only Planet Positions and
Panchang are in scope now. Panchang ships as placeholder UI with sample
titles (Tithi/Vaara/Nakshatra/Yoga/Karana), real calculation deferred to a
later task. Planet Positions is a full port of an existing feature
(`/Users/mankiran/Documents/Kiran/astro-software/src/features/astroParseTable`),
computed from birth details instead of pasted text.

## Key technical decisions (verified)

- **NGXS evaluated and declined** — see prior research: `resource()` +
  singleton services already give automatic params-keyed caching across
  navigation, which NGXS's own docs admit isn't built in for its store
  (hand-rolled guards needed). NGXS's one real edge — auto-persisting
  _computed_ state so a refresh skips recomputation — was measured
  directly: swisseph-wasm's calc cost is ~0.1ms per chart once the WASM
  module is warm (~27ms to load, browser-cached after first visit), so
  this wouldn't produce a meaningful load-time win here. Deferred until
  actually needed; buildable later with plain `effect()` + `localStorage`.
- **Route structure**: sibling top-level routes (`/planet-positions`,
  `/panchang`). Superseded mid-implementation — the three charts + links
  moved from a dedicated `ChartComponent`/`''` route into `AppComponent`
  itself, so they're always visible above the `<router-outlet>` on every
  route (not just at `/`). `ChartComponent` and its route were deleted.
  `<router-outlet>` and the charts/links are both gated behind the same
  `birthDetails()` check, so nothing router-related renders until birth
  details exist.
- **Guard behavior**: a single `CanMatch` functional guard
  (`hasBirthDetailsGuard`) applied to both routes, redirecting to `''` via
  `RedirectCommand` when `BirthChartService.birthDetails()` is null.
- **Caching across navigation**: already solved — `BirthChartService`/
  `EphemerisService` are `providedIn: 'root'` singletons that survive
  route navigation. Planet Positions' derived data follows the same
  pattern: a `resource()` keyed off the shared `birthDetails` signal.
- **Planet Positions scope**: the old app's reference `sample.txt` has 40+
  rows (9 grahas, Lagna, Maandi, Gulika, special Lagnas, upagrahas,
  sphutas, house cusps V2-V12) — each an independent astronomical formula.
  v1 covers only what we already compute: the 9 grahas + Ascendant/Lagna.
  Additional rows are a follow-up once their formulas are individually
  verified.
- **Nakshatra/Pada formula verified**: nakshatra index = `floor(longitude
/ (360/27))`; pada = `floor((longitude % (360/27)) / (360/27/4)) + 1`.
  Hand-checked against two sample.txt rows (Lagna: 28°44'39.56" in Aries →
  Krit pada 1; Sun: 5°52'17.50" in Pisces → UBha pada 1) — both matched
  exactly.
- **Rasi Combination formula** (`getRasiDistances` from the old service):
  forward/backward rasi distance between D1 and D9 rasi, plus a Vargottam
  flag when both distances are 1 (i.e., D1 rasi === D9 rasi). Pure
  arithmetic on rasi indices already available from `D1Chart`/D9 data, no
  new astronomical calculation.
- **Static reference data to port verbatim** from the old app (well-formed
  existing content, not new domain research):
  `data/NakshatraPada.data.ts` (27×4 Characteristics/Career Path/etc.),
  `data/KarmicDoshas.ts` (`KarmicNakshatras`, `KarmicDoshas`,
  `KarmicPlanets`), and the nakshatra/rasi full-name maps from
  `data/constants.ts`.
- **Navamsa Matrix**: 9×9 grid (scoped to our 9 grahas, dropping the old
  app's Uranus/Neptune/Pluto/Maandi/Bhrigu Bindu columns per the graha
  scope decision above) showing pairwise rasi distance, with row/column
  hover highlighting — ported from the old component's matrix logic.

## Steps

Execution order: **structure first, then port logic** — step 1 builds the
full skeleton (routes, guard, stub pages, links) wired end-to-end with
placeholder content everywhere, verified to navigate/guard correctly.
Step 2 fills each stub in with real ported logic and data, one piece at a
time.

### Step 1 — Structure — DONE

1a. DONE — `hasBirthDetailsGuard` (`shared/guards/`), functional
`CanMatch`, redirects to `''` via `RedirectCommand` when
`birthDetails()` is null.

1b. DONE — stub pages `pages/planet-positions/` and `pages/panchang/`,
each just a titled placeholder, lazy-loaded.

1c. DONE — both routes wired in `app.routes.ts` with the guard applied;
links added (moved into `app.component.html` alongside the charts —
see route-structure decision above).

    → verify: DONE — full click-through confirmed (birth details
    submission → charts+links visible on every route → Planet Positions
    → back → Panchang → back), no console errors, direct navigation to
    either route without birth details redirects to `/`, and
    `<router-outlet>` itself is absent from the DOM (not just visually
    empty) when there are no birth details.

### Step 2 — Port logic into the structure

2a. **Nakshatra/Pada utilities**: add `calculateNakshatra(longitude)` and
`calculatePada(longitude)` to `shared/utils/ephemeris.util.ts`,
alongside a `NAKSHATRA_NAMES` (27 short codes) constant.
→ verify: unit-style checks against the two hand-verified sample.txt
rows above, plus 2-3 more spot checks across different rasis.

2b. **Rasi Combination utility**: port `getRasiDistances` logic as a pure
function taking two 0-indexed rasi numbers, returning
`{ forward, backward, isVargottam }`.
→ verify: spot-check against old app's output for a few graha pairs
from sample.txt (e.g. Sun D1=Pisces, D9=Leo).

2c. **Static reference data**: port `NakshatraPadaData`,
`KarmicNakshatras`, `KarmicDoshas`, `KarmicPlanets`, and nakshatra
full names into `shared/utils/` or a new `shared/data/` folder (TBD
at implementation based on size — these are large, content-heavy
files; likely warrant their own folder rather than living in
`utils/`).
→ verify: data ports without transformation errors, spot-check a few
entries render correctly.

2d. **Planet Positions real content**: component computes the 9-graha +
Lagna table rows from `BirthChartService.d1Chart()` + `d9Chart()`
(nakshatra/pada/rasi-combo computed client-side from longitude; no
new ephemeris calls needed beyond what D1/D9 already provide),
renders the full table with Characteristics/Career Path/Karmic
Dosha/Karmic Planet columns and their dialogs (native `<dialog>`,
matching the Modal molecule's pattern), plus the Navamsa Matrix
sub-table with hover highlighting.
→ verify: table values cross-checked against sample.txt for the same
birth data if reproducible, or against independently recomputed
values; dialogs open/close correctly; matrix hover highlighting
works.

2e. **Panchang real content**: replace stub with placeholder titles
(Tithi/Vaara/Nakshatra/Yoga/Karana labels with sample values) — real
calculation deferred further, this step only replaces the bare stub
with the intended placeholder layout.

## Status: Step 1 (structure) and the computed-state persistence addendum

(below) are both done and verified. Step 2 (porting real logic/data) not
started yet — resumes next.

## Addendum: in-house computed-state persistence — DONE

Separate from this plan's original scope, discovered while discussing
NGXS: persist _computed_ chart data (not just raw `BirthDetails`) so a
page refresh restores charts instantly instead of recomputing — valuable
on slow networks, where `swisseph-wasm`'s CDN fetch (not the calculation
itself) is the bottleneck. Explicit rule from the user: the CDN module
must always be preloaded regardless of cache state; only the _calculation_
is skipped on a cache hit.

**Design**: `StoreService` (`shared/services/store.service.ts`)
— a small generic typed `get`/`set`/`remove` wrapper around `localStorage`
with try/catch guards, usable directly by any component or by a
domain service for more complex cases. `BirthChartService` is the
"complex case": on construction it unconditionally calls
`EphemerisService.preload()` (new method, just calls the existing lazy
`#getSwe()` internal init) to warm the CDN module, then checks
`StoreService` for a previously-stored
`{ birthDetails, d1Chart, d9Chart, bhavaChalitChart }` bundle and seeds
its signals synchronously if present — no `resource()` involved anymore
for this, since `resource()` has no hook to seed a value synchronously
before its loader runs. `d1Chart`/`d9Chart`/`bhavaChalitChart` are now
plain `signal().asReadonly()` rather than `resource()`-backed computed
values (no consumer depended on resource-specific state like
`.isLoading()`, confirmed by search). `setBirthDetails()` always
recomputes via `EphemerisService` (any new submission invalidates the old
cache) and persists the fresh result via `StoreService` afterward.

**Verified**: cache-hit refresh dropped from ~895ms (measured earlier,
cold CDN + fresh compute) to ~105-108ms (repeated across two test runs,
before and after extracting `StoreService`); CDN requests still
fire on a cached refresh (preload rule holds); submitting new birth
details correctly overwrites the cached bundle and updates the UI; a
fully cold context (no localStorage at all) still computes and renders
correctly from scratch.
