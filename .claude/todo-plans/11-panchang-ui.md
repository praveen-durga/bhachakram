# Plan: Panchang details UI (structure first, real calculations later)

## Goal

Replace the Panchang route's bare `<h1>Panchang</h1>` stub with the full
card-grid layout shown in the reference screenshot: a "Panchang details"
heading with a "At the given date, time, and place (sidereal Sun–Moon)"
subtitle, followed by a responsive grid of ~20 cards (Thithi, Nakshatra,
Yoga, Karnam, Vedic Day Lord, Hora, Tithi Sphuta, Tithi Beeja, Santan
Tithi, Yogi, Ava Yogi, Mudakku, Vainashika (Lagna), Vainashika (Moon),
Mandi, and any others the user names) — each showing a label, a bold
primary value, secondary detail line(s), and some cards showing an
additional highlighted interpretive note.

Per the user's explicit sequencing (same pattern as Planet Positions):
**step 1 is UI/structure with the component computing and projecting
placeholder data into cards; step 2 (a separate follow-up) wires in the
real astronomical formulas**, which the user will supply — several of
these points (Tithi Sphuta, Tithi Beeja, Santan Tithi, Vainashika,
Mudakku, Ava Yogi) have no existing source in this codebase or the old
`astroParseTable` reference app, so they are NOT researched or guessed
at in this step.

## Key decisions (from user answers)

- **Card content**: `PanchangComponent` computes each card's data itself
  and projects the result directly into the card body — no generic
  `PanchangDetail[]`-driven `@for` loop over a uniform model. This means
  each card is written explicitly in the template (or as small
  per-card render fragments), reading from component fields/computed
  signals, mirroring how `AppComponent` explicitly lays out its three
  charts today rather than looping over a chart-config array.
- **Card shell**: reuse the existing `Card` atom
  (`shared/ui/atoms/card/`) for each of the ~20 cards — it already
  supports a `[title]`-projected label plus freely-projected body
  content, which fits "label + primary value + detail lines + optional
  note" without a new component.
- **Header text**: match the screenshot exactly — "Panchang details" as
  an `<h1>`, with the subtitle "At the given date, time, and place
  (sidereal Sun–Moon)." to its right (or below on narrow screens).
- **Data for step 1**: hardcoded placeholder values matching the
  screenshot's sample content (e.g. Thithi: "Shukla Dashami" / "100%
  elapsed"), just enough to prove out the layout — not wired to
  `BirthChartService` yet, since the underlying formulas aren't ready.
- **Highlighted note styling**: a subset of cards (Tithi Sphuta, Tithi
  Beeja, Santan Tithi, Ava Yogi in the screenshot) show a bold red/pink
  interpretive paragraph below their detail lines — model this as an
  optional "note" section per card, styled distinctly (e.g. a colored
  left border or tinted text), reusable for whichever real cards need
  it once real logic lands. One card (Ava Yogi) also has a tinted
  background on the whole card — treat that as a per-card visual
  variant, not universal.
- **Responsiveness**: grid layout, 5 columns on wide screens per the
  screenshot, collapsing to fewer columns / single column on narrow
  viewports (this app already has a mobile-responsive header — follow
  the same breakpoint conventions).

## Open items to confirm with user before/while building

- Exact list and order of all ~20 cards (the screenshot shows enough to
  infer most labels/fields, but exact secondary-line wording per card
  should be confirmed against the full screenshot rather than guessed).
- Whether "Vedic Day Lord" (rendered as "Monday" / "Lord: Moon" in the
  screenshot) and similar simple cards need any different treatment
  than the more complex multi-line cards.

## Steps

1. DONE — Built `PanchangComponent`'s template: heading + subtitle row,
   then a responsive card grid using the `Card` atom for 15 cards
   (Thithi, Nakshatra, Yoga, Karnam, Vedic Day Lord, Hora, Tithi Sphuta,
   Tithi Beeja, Santan Tithi, Yogi, Ava Yogi, Mudakku, Vainashika
   (Lagna), Vainashika (Moon), Mandi), with hardcoded placeholder
   content matching the screenshot.
   → verified: Playwright screenshots at desktop (1400px) and mobile
   (400px) widths match the reference screenshot's content and layout;
   grid collapses to a single column on mobile; no console errors.
2. DONE — Deviated slightly from the original plan: rather than scoping
   the "tinted card" variant purely to `PanchangComponent`'s own SCSS
   (which turned out to be impossible without `::ng-deep`, since
   `Card`'s host is `display: contents` and the actual `.card` box
   lives inside `Card`'s own encapsulated template), added a small
   `variant` input (`'default' | 'error'`) to the `Card` atom itself,
   mirroring `Button`'s existing `variant`/`color` input pattern. The
   "note" text styling (bold, `--color-error` colored paragraph) stayed
   local to `PanchangComponent`'s stylesheet as originally planned.
   → verified: visual match for the tinted Ava Yogi card; `Card`'s
   other consumer (`component-showcase`) unaffected since `variant`
   defaults to `'default'`.
3. (Follow-up, separate task) Once the user supplies the calculation
   logic for each point, replace the hardcoded placeholder values with
   real computed values from `BirthChartService`/`EphemerisService`,
   card by card.

## Status

Steps 1-2 (UI/structure) done and verified: `tsc`, `prettier --check`,
and `ng build` all clean. Step 3 (real calculations) not started —
awaiting the user-supplied formulas.
