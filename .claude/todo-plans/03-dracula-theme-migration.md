# Plan: Migrate to Dracula theme palette

## Goal

Replace the ad-hoc dark-mode tokens with daisyUI's Dracula OKLCH palette
(user-designated reference for all future color work) and remap
Header/Button/Modal to it.

## Steps

1. Look up Dracula theme's exact OKLCH values from daisyUI source → verify: matched against published package CSS
2. Rewrite `_variables.scss` with the full Dracula token set → verify: no leftover old tokens (grep)
3. Update `styles.scss` body colors to base-100/base-content → verify: builds
4. Remap Header to `--color-primary`/`primary-content` → verify: screenshot
5. Remap Button: danger/dangerOutline always error-red; color=blue/red map to primary/error; ghost to neutral; removed dead top-level variant rules shadowed by color overrides → verify: screenshot all variants, colors correct
6. Remap Modal panel/border/text to base-200/neutral/base-content → verify: screenshot
7. Grep for leftover blue-_/red-_/gray-* Tailwind classes or old var names → verify: none found

## Status: Done
