# South Indian chart layout

## Goal

Implement the real South Indian chart geometry in `app-rasi-chart` (currently
an explicit north-aliased placeholder), and let the user switch the whole
app's chart display between North and South Indian style via a dropdown in
the header — a pure display preference, independent of which birth chart is
active.

## Decisions (confirmed with user)

- **Switcher placement:** a dropdown in the header (not inside the Birth
  Charts modal), since this is a display preference, not part of managing
  which chart is active.
- **Scope:** South Indian geometry + the header switcher. `east` stays a
  north-aliased placeholder — not in scope (no reference geometry confirmed,
  and not asked for).

## South Indian chart convention (verified)

Sourced from Wikipedia's Kundali (astrology) article and Jagannatha Hora's
own documented "South Indian regular" style — both agree:

- A 4×4 grid with the center 2×2 block merged/empty (traditionally used for
  a title — this app can leave it blank or use it for a small label).
- **Rasi positions are fixed** — they never rotate based on the Ascendant
  (unlike North Indian, where the Ascendant's house is always the top
  diamond and rasi numbers shift per-chart). Only the Ascendant marker and
  graha placements move between the 12 fixed cells, based on each one's
  actual rasi.
- Fixed mapping (0-indexed row/col, rasi 1=Aries..12=Pisces):

  | Cell (row, col) | Rasi          |
  | --------------- | ------------- |
  | (0,0)           | 12 Pisces     |
  | (0,1)           | 1 Aries       |
  | (0,2)           | 2 Taurus      |
  | (0,3)           | 3 Gemini      |
  | (1,3)           | 4 Cancer      |
  | (2,3)           | 5 Leo         |
  | (3,3)           | 6 Virgo       |
  | (3,2)           | 7 Libra       |
  | (3,1)           | 8 Scorpio     |
  | (3,0)           | 9 Sagittarius |
  | (2,0)           | 10 Capricorn  |
  | (1,0)           | 11 Aquarius   |

  i.e. top row left-to-right is Pisces, Aries, Taurus, Gemini; then
  clockwise down the right column, right-to-left along the bottom row, up
  the left column back to Pisces.

## Current architecture (relevant files)

- `rasi-chart.model.ts` — `ChartStyle = 'north' | 'south' | 'east'`,
  `RasiHouseRegion` (rasi, rasi-label position, graha labels).
- `rasi-chart.component.ts` — `regions()` computed signal maps each of the
  12 `regionPolygons` positions to a rasi via
  `rasi = (((ascendantRasi - position) % 12) + 12) % 12` — this rotation
  formula is exactly what makes North Indian rotate the Ascendant to
  position 0. It's currently applied unconditionally for every style,
  including the south/east aliases.
- `rasi-chart.component.html` — SVG template **hardcodes North Indian's
  diagonal/diamond grid lines** directly in markup (not derived from
  `regions()` or any per-style data) — this is the second hard-coded
  north-only piece, separate from the `REGION_POLYGONS_BY_STYLE` maps.
- `rasi-chart.component.scss` — generic (border/grid-line/label colors via
  theme tokens), no north-specific assumptions — stays shared as-is.
- Callers: `app.component.html` (D1/D9/Bhava Chalit) and
  `vargas.component.html` (varga chart pairs) — neither passes
  `[chartStyle]` today, both implicitly get `'north'` (the input's default).

## Step 1 — South Indian region/polygon data

Add South Indian's SVG geometry to `rasi-chart.component.ts`, following the
exact shape of the existing `NORTH_REGION_POLYGONS` /
`NORTH_RASI_LABEL_POSITIONS` / `NORTH_GRAHA_LABEL_POSITIONS` arrays (same
`viewBox="0 0 400 400"` coordinate space, so the shared template/scss don't
need to know which style is active):

- `SOUTH_REGION_POLYGONS`: 12 square polygons, one per outer cell of the
  4×4 grid (each cell is 100×100 in the 400×400 viewBox), **in the same
  fixed rasi order as `SOUTH_RASI_LABEL_POSITIONS`/`SOUTH_GRAHA_LABEL_POSITIONS`**
  (see below — south's arrays are NOT indexed by "position relative to
  Ascendant" the way north's are; they're indexed by fixed rasi directly).
- `SOUTH_RASI_LABEL_POSITIONS`: `[x, y]` per cell, using the fixed
  Pisces→Aries→Taurus… clockwise mapping above.
- `SOUTH_GRAHA_LABEL_POSITIONS`: `[x, y, stackDirection, textAnchor]` per
  cell, analogous to north's but for the fixed grid (stacking direction
  faces into the cell, away from the shared border with the empty center
  for cells adjacent to it, or downward/upward following the ring's outer
  edge otherwise).

## Step 2 — Fix the rotation logic for fixed-rasi styles

The current `regions()` computed unconditionally does
`rasi = (((ascendantRasi - position) % 12) + 12) % 12` for every style —
correct for north (rotating), wrong for south (fixed). Introduce a
per-style flag or branch:

```ts
const IS_FIXED_RASI_STYLE: Record<ChartStyle, boolean> = {
  north: false,
  south: true,
  east: false, // still north-aliased, keep rotating like north today
};
```

In `regions()`, when the active style is fixed-rasi, `rasi` for a given
array position is just `position` itself (since south's arrays are already
laid out in fixed rasi order, position 0 = Pisces per the table above — or
equivalently, index the arrays by rasi directly and skip the rotation
formula entirely for that branch). The Ascendant-highlighting logic
(`position === 0` today, which coincidentally works for north because
position 0 IS the Ascendant's house after rotation) needs its own
style-aware check for south: **find the array position whose rasi equals
`ascendantRasi`** and prepend the "Asc" label there instead of always at
index 0.

## Step 3 — Fix the hardcoded North-only SVG grid lines

`rasi-chart.component.html` draws North's diagonal+diamond grid lines as
static markup, with no south equivalent. Two options, pick based on what
looks cleanest once south's polygons are in hand:

- **(a)** Make the grid lines conditional on `chartStyle()`: north keeps its
  diagonal+diamond `<line>`/`<polygon>` elements; south adds its own
  `<line>` elements for the 4×4 grid (outer border + the lines separating
  the 12 cells + the inner square around the empty center) inside an
  `@if`/`@switch` in the template.
- **(b)** Derive grid lines generically from each region's polygon points
  (draw every polygon edge as a line) — more general but a bigger change
  to the render approach for a one-time visual difference; not needed
  unless (a) turns out messy in practice.

Start with (a) — smallest change matching the existing hardcoded-north
pattern, just extended per-style rather than replacing the whole rendering
model.

## Step 4 — Chart style preference: service + storage

New `ChartStyleService` (or an addition to an existing app-wide-preference
home if one exists by the time this is built — none exists today), mirroring
`BirthChartService`'s own `signal` + `StoreService` + `persistOnUnload`
pattern used for `PROFILES`:

```ts
// store.keys.ts
CHART_STYLE: 'bhachakram:chart-style',
```

```ts
@Injectable({ providedIn: 'root' })
export class ChartStyleService {
  #style = signal<ChartStyle>('north');
  style = this.#style.asReadonly();

  constructor() {
    const stored = this.storage.get<ChartStyle>(STORE_KEYS.CHART_STYLE);
    if (stored) {
      this.#style.set(stored);
    }
    this.storage.persistOnUnload<ChartStyle>(STORE_KEYS.CHART_STYLE, () => this.#style());
  }

  setStyle(style: ChartStyle): void {
    this.#style.set(style);
  }
}
```

- Defaults to `'north'` (matches today's implicit behavior for anyone who
  never touches the new dropdown).
- App-wide, not tied to a specific `BirthChartProfile` — a user's chosen
  display style should persist across switching between saved charts, not
  reset per-profile.
- `east` is intentionally excluded from the dropdown's options (not from
  the type) — the type stays `ChartStyle = 'north' | 'south' | 'east'` for
  forward-compatibility, but the UI only offers the two real ones.

## Step 5 — Header dropdown

Add a small `<select>` (plain native select — this is a 2-option app-wide
toggle, not a form-bound field like the birth-details form's ayanamsa
picker, so the heavier `app-select` atom with label/error/hint chrome isn't
a fit here) to `header.component.html`, next to the existing birth-chart
trigger button:

```html
<select class="chart-style-select" [value]="chartStyle.style()" (change)="onChartStyleChange($event)">
  <option value="north">North Indian</option>
  <option value="south">South Indian</option>
</select>
```

```ts
protected onChartStyleChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as ChartStyle;
  this.chartStyle.setStyle(value);
}
```

Styled to match the header's dark-background context (light text/border,
consistent with the existing `primary-inverted-outline` button), in
`header.component.scss`.

## Step 6 — Wire callers to the preference

`app.component.html` and `vargas.component.html` currently never pass
`[chartStyle]`, so both implicitly render north. Update both to bind
`[chartStyle]="chartStyleService.style()"` (injecting `ChartStyleService`
into `AppComponent` and `VargasComponent`), so every `app-rasi-chart`
instance across the app follows the one global preference consistently.

## Verification plan

1. `npx tsc --noEmit` clean after each step.
2. Manual browser check (`ng serve`):
   - Default load (no stored preference) → all charts render North Indian,
     unchanged from today.
   - Switch the header dropdown to South Indian → D1/D9/Bhava Chalit (on the
     main page) and the Vargas comparison charts all switch to the fixed
     4×4-ring layout.
   - Spot-check the fixed mapping directly: for a chart with a known
     Ascendant (e.g. Aquarius), confirm the "Asc" label appears in the
     Aquarius cell (row 1, col 0 per the table), not at a rotated position.
   - Confirm graha placements land in the correct fixed rasi cells (cross-
     check 2-3 planets against their known D1 rasi from Planet Positions).
   - Switch back to North Indian → charts rotate correctly again (no leftover
     state from the south rendering path).
   - Reload the page after selecting South Indian → preference persists
     (via `persistOnUnload`/localStorage), consistent with how the birth
     chart profile list already persists.
   - Confirm Dagdha Rasi's 🔥 marker (`dagdhaRasis` input, D1 chart only)
     still appears in the correct cell under South Indian style.
3. `npx prettier --check` on all touched files.

## Open questions / explicitly out of scope

- East Indian geometry — still out of scope, stays north-aliased.
- No per-chart-type override (e.g. "D9 always North regardless of the
  global toggle") — one global preference applies to every rendered chart,
  matching how the request was framed.
