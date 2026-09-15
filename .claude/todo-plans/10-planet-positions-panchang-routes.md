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

2a. DONE — **Nakshatra/Pada utilities**: `calculateNakshatra(longitude)` and
`calculatePada(longitude)` added to `shared/utils/ephemeris.util.ts`,
alongside `NAKSHATRA_NAMES`/`RASI_NAMES` constants.

2b. DONE — **Rasi Combination utility**: `getRasiDistances(rasiA, rasiB)`
ported as a pure function on 0-indexed rasi numbers, returning
`{ forward, backward, isVargottam }`.

2c. DONE — **Static reference data**: ported into a new `shared/data/`
folder (`nakshatra-pada.data.ts`, `karmic-dosha.data.ts`,
`navamsa-combination.data.ts`), re-keyed from the old app's 2/4-letter
codes to numeric rasi/nakshatra indices matching this app's `D1Chart`
model; verified against the originals programmatically.

2d. DONE — **Planet Positions real content**: `PlanetPositionsComponent`
computes the 9-graha + Ascendant table from `BirthChartService.d1Chart()`

- `d9Chart()`, renders Characteristics/Career Path/Rasi Combination/
  Karmic Dosha/Karmic Planet columns with `app-modal`-based dialogs
  (not native `<dialog>` — reused the existing Modal molecule instead),
  plus an always-visible Navamsa Matrix sub-table with row/column hover
  highlighting. The generic `Table` molecule was extended with an
  optional per-column `cellTemplate` (`TemplateRef`) to support the
  custom View-button cells.
  → verified: full click-through with a real submitted birth chart,
  dialogs open/close with correct data, matrix hover highlighting works,
  values cross-checked by hand against the Navamsa combination formula.

2e. **Panchang real content**: still a bare stub (`<h1>Panchang</h1>`) —
not started.

## Status

Step 1 (structure), the computed-state persistence addendum, and Step 2
items 2a-2d (Planet Positions) are all done and verified. Only 2e
(Panchang real content) remains.

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
