# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

always make sure to have db migration scripts if db updation corrupts it.

## 5. No Lengthy Inline Comments

Default to no comments. When one is genuinely needed (a non-obvious WHY — a hidden constraint, a workaround, a subtle invariant), keep it to a single short line. Never write multi-line comment blocks or JSDoc-style explanations above a function — a well-named function/variable should carry the WHAT; only add the one-liner for the WHY that isn't obvious from the code itself.

## 6. Component Body Organization (React/Next.js)

Group same-kind declarations together instead of interleaving them — this is what keeps a component legible at a glance. Inside a component function body, order things as:

1. Context/store/custom hooks that read ambient or provider state (`usePermissions()`, `useSearchParams()`, `useRouter()`, etc.). A value destructured directly from one of these hooks' own return — e.g. `const [canEdit] = checkPermissions([...])` right after `const { checkPermissions } = usePermissions()` — belongs grouped with the hook call itself, immediately on the next line with no blank line between them, not down with the later derived consts.
2. All `useState` calls, grouped together
3. All `useRef` calls, grouped together
4. Derived plain `const` values (destructuring, computed booleans/strings) after the above, not scattered between state declarations
5. `useMemo`/derived-value hooks
6. Data-fetching hooks (`useQuery`, etc.)
7. `useEffect` calls
8. Event handlers / render-helper functions
9. Early returns, then the final JSX `return`

Import order is managed by the editor/VS Code settings — never reorder or reorganize import statements manually as part of this convention or any refactor.

A local `const` closure that exists purely to produce a chunk of JSX for the main return (not an exported component, not an event handler) should be named with a `render` prefix — e.g. `renderSummaryLoader`, `renderFlightDetails`.

Separate each group with exactly one blank line (skip the boundary if one side is empty). Keep multiple hooks of the same kind (e.g. all `useState` calls) tight together with no blank lines between them — the blank line marks the boundary between groups, not between every declaration.

A blank line is required:

- Between every distinct function (handlers, render-helpers, etc.) — never stack two `const foo = () => {...}` declarations back-to-back with no gap.
- Between every group described above, including between each `useEffect` call and the next.
- Between JSX fragments/blocks inside the render output where they read as distinct sections.
- Immediately before the final `return` statement (or an early-return guard clause), separating it from the last declaration/handler above it.

## 7. One-Codebase Consistency Bar

A good codebase reads as if one person wrote it, even with thousands of contributors — that consistency is itself the benchmark of maintenance quality. Match the established conventions (naming, structure, grouping, formatting) of the surrounding code exactly, every time you write or edit anything — never introduce a one-off style, even a "better" one, without being asked. Check this after every piece of code you write, not just at the start.

## 8. Tasks and Memorizing

Use [TASKS.md](TASKS.md) and [MEMORY.md](MEMORY.md) to keep track of todos and to remember important stuff. The todos should have the plan references when they are planned. keep the plans in `.claude/todo-plans` folder.

## 9. Steps before start coding

If ask is complex, always ensure to create a plan first. always ask questions before plan generation. After the plan got generated, add a line item in tasks for tracking. After the task is completed, review the generated code to ensure it follow the project coding guidelines.

## 10. Responsive Styles

Always use the shared breakpoint mixins in `src/styles/_mixins.scss` (`fromSm`/`fromMd`/`fromLg`, `uptoSm`/`uptoMd`/`uptoLg`, `onlySm`/`onlyMd`) for any responsive rule — never hand-write a `@container`/`@media` query with a literal pixel or rem value. Import them via the Sass alias path `@use 'styles/mixins' as *;` (resolves from any component depth via `angular.json`'s `stylePreprocessorOptions.includePaths`).

Always write mobile-first: base/unprefixed styles target the smallest screen, and larger-screen overrides are layered on via `fromSm`/`fromMd`/`fromLg` — never the reverse (e.g. don't write desktop styles as the default and use `uptoMd` to override down to mobile).

This app uses container queries, not `@media`, for component-local responsive layout — the component (or an ancestor) needs `container-type: inline-size` set on its `:host` before any of these mixins take effect.

If `sm`/`md`/`lg` genuinely don't cover a needed case, ask before adding a new mixin or reintroducing a one-off literal breakpoint.

## About project

check [PROJECT.md](PROJECT.md) for project details and guidelines.
