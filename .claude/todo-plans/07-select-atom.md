# Plan: Select atom

## Goal

Add a Select atom matching Input's scope and styling exactly (same label/error/hint
wrapper, same border/focus-ring treatment), with a data-driven options input and
full ControlValueAccessor support.

## Steps

1. Checked daisyUI's real select.css — it includes a custom CSS gradient replacing the
   native dropdown arrow plus size/color variants. Scoped down to match Input's simpler
   treatment instead (native arrow kept, no variants) per user choice.
2. select.model.ts: SelectOption = { value, label } (Type, not interface)
3. select.component.ts: label/error/hint/placeholder signal inputs, options = input.required<SelectOption[]>(),
   same ControlValueAccessor implementation pattern as Input (writeValue/registerOnChange/
   registerOnTouched/setDisabledState, no ChangeDetectorRef)
4. select.component.html: native `<label>`/`<select>`, placeholder as a disabled/hidden
   first option, @for over options() — same hint/error conditional structure as Input
5. select.component.scss: identical border-color: color-mix(in oklab, base-content 20%,
   transparent) treatment as Input (the same fix applied there), same focus-ring/error states
6. Wire barrel files (atoms/select, atoms/index.ts)
7. Add to showcase: a zodiac-sign Select in the same reactive form as the email Input
   (Validators.required, error derived via control.events -> computed, matching Input's
   pattern) plus a plain ngModel-style binding — verified via Playwright: required error
   on blur, error clearing to hint on selection, plain binding updates a signal

## Status: Done
