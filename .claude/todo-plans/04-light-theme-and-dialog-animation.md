# Plan: Switch to light theme, animate dialog, bold button text

## Goal

Replace Dracula dark tokens with daisyUI's light theme, add a subtle open/close
animation to the Modal's native <dialog>, and make button text semibold.

## Steps

1. Preview daisyUI light theme values (fetched from package source) before deciding → verify: screenshot comparison shown to user
2. User confirmed switching to light theme (not just previewing) → swap `_variables.scss` tokens + `color-scheme` to light
3. Fix Modal's border-color: was `--color-neutral` (near-black in light theme, unlike Dracula) → changed to `--color-base-300` for a proper subtle divider
4. Animate dialog open/close: CSS transition + `@starting-style` for entry; a `.closing` class + `transitionend`-gated `dialog.close()` for exit
5. Found & fixed a real bug: the close button and backdrop click called `dialog.close()`/relied on the native `close` event directly, bypassing the animated-close path entirely for two of three close routes. Rewired: close button emits `closed` like backdrop click does; native Esc uses the cancelable `cancel` event (preventDefault + emit `closed`) instead of `close`, so every path funnels through the same `open` signal → effect → animated close logic.
6. Verified via instrumented Playwright trace (patched `dialog.close`, listened for `transitionend`) that all three close paths (button, Esc, backdrop) go through the animation correctly
7. Button text: `font-semibold` added to `.button` base class → verified via screenshot

## Status: Done
