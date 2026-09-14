# Plan: Modal molecule

## Goal
Add a Modal component (title prop, footer slot, default slot for body) using
native `<dialog>` per the project's native-HTML5-controls rule.

## Steps
1. Create `shared/ui/molecules/modal` with model/component/template/styles → verify: builds
2. `open` input signal + `effect()` calling `showModal()`/`close()` on the native dialog; `closed` output for Esc/backdrop/close-button → verify: Playwright smoke test — all three close paths work
3. Footer slot via `<ng-content select="[footer]">`, hidden via `:empty` when unused → verify: confirmed empty `<footer>` renders with no placeholder node, `:empty` matches, `display:none` applied
4. Wire barrel files (molecules/modal, molecules, shared/ui) → verify: resolves via shared/ui barrel
5. Nest SCSS selectors to mirror DOM structure (Modal + retrofit Header) per user feedback → verify: rebuild clean

## Status: Done
