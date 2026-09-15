# Plan: Input atom with reactive forms support

## Goal

Port the React Input component (label/error/hint, Headless UI Field/Label/Input)
to an Angular atom, ignoring data-testid, with full ControlValueAccessor support
so it works with formControlName/[formControl] and [(ngModel)] alike.

## Steps

1. Translate to native `<label>`/`<input>` (per native-HTML5-controls rule), label/error/hint
   as optional signal inputs → verify: builds
2. Implement ControlValueAccessor (writeValue/registerOnChange/registerOnTouched/setDisabledState)
   - NG_VALUE_ACCESSOR provider, internal value/disabled signals, no ChangeDetectorRef → verify: builds
3. Map React's ad-hoc gray/blue/red tokens to our light-theme tokens (base-100 background,
   base-300 border, base-content text, primary focus ring, error state) → verify: screenshot
4. Preserve the `hint && !error` mutual-exclusivity behavior from the React version → verify:
   confirmed via Playwright screenshots at each validation state
5. Wire barrel files (atoms/input, atoms/index.ts)
6. Add to showcase page: a real reactive form (FormGroup + Validators.required/email,
   error message derived via control.events -> computed signal since .touched alone
   isn't observable) and a plain [(ngModel)]-equivalent signal binding to prove CVA
   works both ways → verify: Playwright-driven blur/type sequence confirms required error,
   invalid-email error, valid state clearing to hint, and plain binding updates a signal

## Status: Done
