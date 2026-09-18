# Memory

Project-specific feedback and conventions collected during development. Keep entries here (not in CLAUDE.md, which is generic cross-project guidance) so they're discoverable by anyone working on this repo.

## Signals over ChangeDetectorRef

Always model reactive component state with Angular signals (`signal()`, `input()`, `computed()`) rather than plain class fields. Never reach for `ChangeDetectorRef` to force re-renders.

**Why:** signals are the mechanism that makes "no component should use `ChangeDetectorRef` to force re-renders" true by construction. Plain fields under `OnPush` change detection silently fail to update the view; signals make that whole class of bug impossible.

**How to apply:** any new component state, derived value, or input/output should default to a signal. If a `ChangeDetectorRef` import ever seems necessary, that's a signal the state should be reactive (signal-based) instead — don't reach for CDR as a fix.

## No inline component styles

Never author styling inline in a component's TypeScript file — no `styles: [...]` array in `@Component`, and no style-related values in the `host` metadata block either (e.g. a `host: { class: '...' }` used purely to apply styling classes belongs in the `:host` selector of the `.scss` file instead).

**Why:** corrected directly after a `host: { class: 'contents' }` binding showed up in `button.component.ts` — all styling, including host-element styling, should live in the component's `.scss` file via `:host { @apply ...; }`, keeping the `.ts` file free of style concerns entirely.

**How to apply:** every component should use `styleUrl: './x.component.scss'` and put all styling — including host-level styling — in that file. If a host needs a style-only class (like `display: contents`), express it as `:host { @apply ...; }` in the scss, not as a `host: {...}` decorator property.

## SCSS mirrors DOM

Structure a component's SCSS as nested selectors that mirror its HTML hierarchy — a parent element's block should contain its children's selectors nested inside it, following the same tree shape as the template. Keep full descriptive (BEM-style) class names even while nesting; nesting is for structure/readability, not to shorten names.

**Why:** corrected on `modal.component.scss`, which originally had flat top-level selectors (`.modal`, `.modal-panel`, `.modal-header`, `.modal-title`, `.modal-close`, `.modal-body`, `.modal-footer` all as siblings). Without nesting, the classes become a scattered mess — flat selectors lose the parent/child relationship the DOM actually has, making the stylesheet harder to scan against the template.

**How to apply:** for every new or edited component `.scss` file, nest child element selectors inside their DOM parent's selector block, one level per DOM level. Exception: when multiple classes are modifiers applied to the _same single element_ (e.g. a button's `.sm`/`.md`/`.primary`/`.blue` size/variant/color classes all on one `<button>`), those are correctly nested as `&.modifier` under that one element's block — that's not a DOM hierarchy, so no further flattening/un-flattening is needed there.

## Theme: single light palette (not Dracula)

The app is single-theme (no light/dark toggle, no `dark:` Tailwind variant anywhere). The active theme is daisyUI's **light** theme (OKLCH values), defined in `src/styles/_variables.scss`:

```css
color-scheme: light;
--color-base-100: oklch(100% 0 0); /* page background, white */
--color-base-200: oklch(98% 0 0); /* slightly recessed surface */
--color-base-300: oklch(95% 0 0); /* borders/dividers */
--color-base-content: oklch(21% 0.006 285.885); /* near-black body text */
--color-primary: oklch(45% 0.24 277.023); /* indigo/blue */
--color-primary-content: oklch(93% 0.034 272.788);
--color-secondary: oklch(65% 0.241 354.308); /* pink/magenta */
--color-secondary-content: oklch(94% 0.028 342.258);
--color-accent: oklch(77% 0.152 181.912); /* teal/cyan */
--color-accent-content: oklch(38% 0.063 188.416);
--color-neutral: oklch(14% 0.005 285.823); /* near-black, NOT a subtle border color */
--color-neutral-content: oklch(92% 0.004 286.32);
--color-info: oklch(74% 0.16 232.661);
--color-info-content: oklch(29% 0.066 243.157);
--color-success: oklch(76% 0.177 163.223);
--color-success-content: oklch(37% 0.077 168.94);
--color-warning: oklch(82% 0.189 84.429);
--color-warning-content: oklch(41% 0.112 45.904);
--color-error: oklch(71% 0.194 13.428); /* red/coral */
--color-error-content: oklch(27% 0.105 12.094);
--radius-selector: 0.5rem;
--radius-field: 0.25rem;
--radius-box: 0.5rem;
--border: 1px;
```

**History:** the app started dark-mode-only using daisyUI's **Dracula** theme as the reference palette, then switched fully to the light theme after a visual comparison — Dracula was fully replaced, not kept as an option.

**Why:** user-driven design decision after visually comparing both via a live preview.

**How to apply:** when adding or editing colors in `src/styles/_variables.scss` or any component `.scss`, use these light-theme tokens (base-100/200/300 for surfaces, primary/secondary/accent for brand/interactive colors, info/success/warning/error for status). Gotcha from the Dracula→light migration: `--color-neutral` is near-black in the light theme (unlike Dracula, where neutral doubles as a soft border tone) — use `--color-base-300` for subtle borders/dividers instead of `--color-neutral`, or the border will look far too heavy. `color-scheme` on `:root` in `styles.scss` must stay in sync (`light`, not `dark`).

## Delete completed plan docs

When a task tracked via `.claude/todo-plans/NN-*.md` + `TASKS.md` is fully complete (checked off `[x]`), delete the plan file and remove its `TASKS.md` line entirely — don't leave completed plans sitting in the repo as a history log.

**Why:** explicitly requested ("delete the plans for completed todos") rather than archive or keep them for reference. `TASKS.md`/`todo-plans/` is a working-set of open, in-progress plans, not a changelog — git history already records what was done.

**How to apply:** after finishing a plan-tracked task, immediately delete `.claude/todo-plans/NN-*.md` for that task and remove its line from `TASKS.md`, rather than leaving the entry checked. Only keep plan files for tasks that are still open or partially done (e.g. a step explicitly paused pending more info). Do this proactively, not just when asked.

## NG0203 from *ngTemplateOutlet can be stale dev-server state

An intermittent `NG0203` ("ViewContainerRef token injection failed") was seen from `TableComponent`'s `*ngTemplateOutlet` (inside a nested `@for` rows × columns, `src/app/shared/ui/molecules/table/table.component.html`) when refreshing on `/planet-positions`. Two code-level theories (reading `viewChild.required()` inside a `computed()`; the structural `*ngTemplateOutlet` + `@if` form itself) both turned out to be wrong — a plain `ng serve` restart made the error disappear, with the original code completely unchanged.

**Why:** this was a stale dev-server/Vite-HMR state issue, not an Angular framework defect or an application bug. Could not reproduce via any scripted Playwright timing test (fresh contexts, hard reloads, fast/slow navigation) — only a real `ng serve` process in a bad HMR state reproduced it, and only a restart cleared it.

**How to apply:** if a change to a component/template that touches structural directives (`@for`, `@if`, `*ngTemplateOutlet`) throws an injection-context error (`NG0203`/similar) that a fresh `tsc`/`ng build` doesn't reproduce, and a synthetic repro also can't trigger it, suspect stale dev-server/HMR state first — restart `ng serve` before doing a deep framework-internals investigation or rewriting working code. The `*ngTemplateOutlet` + `@if (column.cellTemplate; as template)` pattern in the Table molecule's nested `@for` is fine as-is; no need to switch to the `[ngTemplateOutlet]` attribute-binding form defensively.

## Astro logic: strict SRP

Astrology/ephemeris domain logic is inherently complex (many independent formulas, lookup tables, multi-step procedures). Never accumulate this logic inline in a page/component's `.ts` file as it grows — strictly enforce single-responsibility-principle separation:

- **Pure calculation functions** (formulas taking primitive/model inputs, returning primitive/model outputs, no Angular DI, no signals) go in a dedicated `*.util.ts` file — e.g. `panchang.util.ts` for Tithi Sphuta, Santan Tithi, Tithi Beeja, Vainashika calculations, separate from `ephemeris.util.ts` (which holds the more general rasi/nakshatra primitives shared across features).
- **Static reference data** (lookup tables, constant maps like a Graha-Devata-per-tithi table, interpretation/note text tables) go in their own `*.data.ts` or `*.constants.ts` file, never inlined as literals inside a calculation function or component.
- **Types/models** for a feature's data shapes go in `*.model.ts`.
- The page/component `.ts` file itself should only orchestrate: read birth chart signals, call the pure util functions, assemble the view-model, handle UI state (dialogs, hover, etc.) — it should not contain the actual astronomical formulas or tables inline.

**Why:** explicit instruction while building the Panchang feature's real calculations (Tithi Sphuta/Beeja, Santan Tithi, Vainashika, etc.) — astro logic has many independent, easy-to-confuse formulas and lookup tables; keeping them scattered inline in one growing component file makes the codebase hard to maintain and error-prone to modify.

**How to apply:** any time new astrology/Panchang/chart calculation logic is added, default to creating/extending a dedicated util+data(+model) file trio for that logic domain, mirroring the existing pattern established for Planet Positions (`shared/data/karmic-dosha.data.ts`, `nakshatra-pada.data.ts`, `navamsa-combination.data.ts` + functions in `shared/utils/ephemeris.util.ts`). Apply this proactively, not just when asked.

## Responsive styles: breakpoint mixins, mobile-first

Always use the shared breakpoint mixins in `src/styles/_mixins.scss` (`fromSm`/`fromMd`/`fromLg`, `uptoSm`/`uptoMd`/`uptoLg`, `onlySm`/`onlyMd`) for any responsive rule — never hand-write a `@container`/`@media` query with a literal pixel or rem value. Import them via the Sass alias path `@use 'styles/mixins' as *;` (resolves from any component depth via `angular.json`'s `stylePreprocessorOptions.includePaths`).

Always write mobile-first: base/unprefixed styles target the smallest screen, and larger-screen overrides are layered on via `fromSm`/`fromMd`/`fromLg` — never the reverse (e.g. don't write desktop styles as the default and use `uptoMd` to override down to mobile).

This app uses container queries, not `@media`, for component-local responsive layout — the component (or an ancestor) needs `container-type: inline-size` set on its `:host` before any of these mixins take effect.

If `sm`/`md`/`lg` genuinely don't cover a needed case, ask before adding a new mixin or reintroducing a one-off literal breakpoint.
