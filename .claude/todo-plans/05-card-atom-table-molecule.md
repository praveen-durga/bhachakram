# Plan: Card atom + Table molecule (daisyUI-styled)

## Goal
Add a small-styled Card atom (daisyUI card-sm sizing) with title/body/actions
regions, and a Table molecule with a solid background, based on daisyUI's
card and table component source.

## Steps
1. Fetch daisyUI's card.css and table.css source to base structure/sizing on real values, not guesses → verify: matched against package source
2. Card atom (shared/ui/atoms/card): title input, default slot for body, [actions] slot (mirrors Modal's footer pattern), styled per card-sm (1rem padding, 0.75rem body text, 1rem title) → verify: screenshot with/without title and actions; actions slot :empty-hides like Modal's footer
3. Table molecule (shared/ui/molecules/table): generic `TableComponent<T>` with `columns: TableColumn<T>[]` (key + label) and `rows: T[]` inputs, solid base-100 background (no zebra striping per user choice), daisyUI structural spacing/border/header-weight styling → verify: builds with generic type inference, screenshot with sample data
4. Wire barrel files (atoms/card, molecules/table, category-level index.ts) → verify: resolves via shared/ui barrel

## Status: Done
