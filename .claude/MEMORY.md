# Memory

Project-specific feedback and conventions collected during development. Keep entries here (not in CLAUDE.md, which is generic cross-project guidance) so they're discoverable by anyone working on this repo.

## Responsive styles: breakpoint mixins, mobile-first

Always use the shared breakpoint mixins in `src/styles/_mixins.scss` (`fromSm`/`fromMd`/`fromLg`, `uptoSm`/`uptoMd`/`uptoLg`, `onlySm`/`onlyMd`) for any responsive rule — never hand-write a `@container`/`@media` query with a literal pixel or rem value. Import them via the Sass alias path `@use 'styles/mixins' as *;` (resolves from any component depth via `angular.json`'s `stylePreprocessorOptions.includePaths`).

Always write mobile-first: base/unprefixed styles target the smallest screen, and larger-screen overrides are layered on via `fromSm`/`fromMd`/`fromLg` — never the reverse (e.g. don't write desktop styles as the default and use `uptoMd` to override down to mobile).

This app uses container queries, not `@media`, for component-local responsive layout — the component (or an ancestor) needs `container-type: inline-size` set on its `:host` before any of these mixins take effect.

If `sm`/`md`/`lg` genuinely don't cover a needed case, ask before adding a new mixin or reintroducing a one-off literal breakpoint.
