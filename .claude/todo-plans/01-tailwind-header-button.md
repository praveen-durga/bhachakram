# Plan: Tailwind setup, Header, Button atom

## Goal

Replace Bootstrap with Tailwind, add a Header organism with the brand name, and
port the React Button component to an Angular atom per project conventions.

## Steps

1. Remove Bootstrap + Popper.js (deps, angular.json script entry, styles.scss import) → verify: `npm ls bootstrap` empty, no bootstrap refs in repo
2. Install Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss`), add `.postcssrc.json`, import into `styles.scss` → verify: `ng build` compiles, styles.css contains Tailwind utilities
3. Add `src/styles/_variables.scss` for shared CSS variables per PROJECT.md → verify: imported in styles.scss
4. Strip `AppComponent` back to a minimal shell (header + router-outlet) → verify: builds, no bootstrap markup left
5. Create Button atom (`shared/ui/atoms/button`) — model (`type`, not `interface`), signal-based inputs, scoped scss translated from React `Button.module.scss` → verify: all variants/sizes render correctly (screenshot)
6. Create Header organism (`shared/ui/organisms/header`) with brand name only → verify: renders at top of app
7. Wire barrel files at atom/organism/shared-ui level → verify: imports resolve via barrel only

## Status: Done

Fixed incidentally: `src/index.html` had a duplicated/malformed document (two concatenated `<html>` blocks) predating this change — corrected while verifying the app rendered.
