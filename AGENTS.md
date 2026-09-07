client-side React + TypeScript app for teachers running a "traveling book" classroom initiative.
All data in `localStorage`.
Docs:

- [VISION.md](VISION.md) (why)
- [SPEC.md](SPEC.md) (stories, scope, build status)
- [README.md](README.md) (setup & commands).

do not create more docs — types are the source of truth for shapes, and a design for unwritten code lives in its repo issue, not in a file.

## Ground rules

### Mobile first (IMPORTANT)

- Design for **360×800 CSS px** — reference device: **Xiaomi Redmi 15C**. All user testing happens on it. Desktop is the same layout centered with `max-width`.
- `dvh`, never `vh`.
- Touch targets ≥ 44×44px.
- No horizontal scroll.

### Language

- UI copy is Spanish; docs, code, and comments are English.

### Design ("raw newsprint")

- Hard `--ink` borders, `border-radius: 0`, uppercase letter-spaced datelines.
- No shadows, no gradients.
- The palette in `src/palette/palette.json` is load-bearing by **membership** only: `Child.color` is persisted as a raw hex, so dropping an entry strands existing children.

### Dependencies

- Runtime deps are `react`, `react-dom`, `@fontsource/besley`.
- Adding any library — router, state, UI kit, CSS-in-JS, HTTP, dates, utils — is a decision: ask first.

### Conventions

- No `class`, no `this`: plain functions, closures, function factories. `new` only for built-ins. The one exception is the React error boundary, which the framework forces to be a class.
- **No ternaries in JSX.** Render with guards: `{cond && (…)}`, or two sibling guards for two branches. A branch that picks a string (a label, an `aria-label`) is a named helper with early returns.
- **Comments are the exception.** A comment records what neither the code, the tests nor this file can say: a browser or React gotcha, a caveat about data persisted by an older version, a link to the issue that owns a placeholder. Never what a function, prop or handler does — rename it or split it instead. One or two lines; no section banners.

### Platform before ARIA

Reach for the element before the attribute.

- **Modals are `<dialog>` + `showModal()`** (`privacy-note`). `ConfirmPanel` is the deliberate exception: it renders inline with no backdrop, so trapping focus in it would be worse than not. Do not "unify" the two.
- **Single-select is `<input type="radio">`** in a `fieldset` (`emoji-picker`, `color-picker`). `aria-pressed` is for genuine toggles only (`child-card`, `roster`). `role="radio"` on a `<button>` is not the answer.
- jsdom implements neither, so platform behaviour is **not** unit-testable here: verify it in a real browser and delete the test rather than assert against the stub.

### Folder layout

- No `utils/`, `types/`, `helpers/` catch-alls, and no `types.ts`. Name folders by domain; every type lives in its domain module, even if that means more files.
- `src/` root holds only the entry point, the composition root it mounts and the error boundary around it. There is no `src/app/`.

### Testing

- Two layers. Vitest + jsdom is the unit layer; Playwright (`e2e/`) is the integration and end-to-end layer: any flow that crosses screens or must survive a reload is a Playwright spec, never a jsdom test.
- Accessibility is the test contract: query by role + accessible name, then label or visible text, `getByTestId()` last. If an element isn't reachable by role + name, fix the component. Never query by CSS class or DOM shape.
- No test slop: no asserting static attributes or constants, no re-testing one code path with cosmetically different inputs, no testing platform behavior the code doesn't handle.
