# AGENTS.md

**libro-viajero.app** — client-side React + TypeScript app for teachers running a "traveling book" classroom initiative. All data in `localStorage`. Docs: [VISION.md](VISION.md) (why) · [SPEC.md](SPEC.md) (stories, scope, build status) · [README.md](README.md) (setup & commands). Four docs, and no more — types are the source of truth for shapes, and a design for unwritten code lives in its repo issue, not in a file.

## Decisions the code cannot tell you

### Mobile first (IMPORTANT)

- Design for **360×800 CSS px** — reference device: **Xiaomi Redmi 15C**. All user testing happens on it. Desktop is the same layout centered with `max-width`, nothing else.
- `dvh`, never `vh`. Touch targets ≥ 44×44px. No horizontal scroll, ever.

### Language

- **UI copy is Spanish; docs, code, and comments are English.**

### Design language ("raw newsprint")

- Hard `--ink` borders, `border-radius: 0`, uppercase letter-spaced datelines. No shadows, no gradients.
- The palette in `src/palette/palette.json` is load-bearing by **membership** only: `Child.color` is persisted as a raw hex, so dropping an entry strands existing children. Adding or reordering is free.

### Dependencies

- Runtime deps are `react`, `react-dom`, `@fontsource/besley`. Adding any library — router, state, UI kit, CSS-in-JS, HTTP, dates, utils — is a decision to raise first, not a convenience.

### Components

- No `class`, no `this`: plain functions, closures, function factories. `new` only for built-ins. The one exception is the React error boundary, which the framework forces to be a class.
- **No ternaries in JSX.** Render with guards: `{cond && (…)}`, or two sibling guards for two branches. Numbers need an explicit test (`list.length > 0 &&`), or React renders the `0`. Branching that picks a *string* (a label, an `aria-label`) goes in a named helper with early returns, not inline in the markup.
- Every screen opens with `<ProjectHeading />`, which owns the one `<h1>`; sections below start at `<h2>`. A DOM `id` referenced by `aria-labelledby`/`aria-describedby` comes from `useId()`, never a literal.

### Platform before ARIA (IMPORTANT)

Reach for the element before the attribute. Both rules replaced hand-rolled versions that were longer and less correct in a real browser.

- **Modals are `<dialog>` + `showModal()`** (`privacy-note`). `ConfirmPanel` is the deliberate exception: it renders inline with no backdrop, so trapping focus in it would be worse than not. Do not "unify" the two.
- **Single-select is `<input type="radio">`** in a `fieldset` (`emoji-picker`, `color-picker`). `aria-pressed` is for genuine toggles only (`child-card`, `roster`). `role="radio"` on a `<button>` is not the answer.
- jsdom implements neither, so platform behaviour is **not** unit-testable here: verify it in a real browser and delete the test rather than assert against the stub.

### Folder layout

- No `utils/`, `types/`, `helpers/` catch-alls, and no `types.ts`. Name folders by domain; every type lives in its domain module, even if that means more files.
- `src/` root holds only the entry point and the composition root it mounts. There is no `src/app/`: a composition root is not a domain, and a folder named after the app is the same catch-all as `utils/`.

### Testing

- Two layers, no third. **Vitest + jsdom is the unit layer**: one module at a time, and `app.component.test.tsx` covers only the composition root's own wiring. **Playwright (`e2e/`) is the integration and end-to-end layer**: any flow that crosses screens or must survive a reload is a spec there, never a jsdom test.
- Accessibility is the test contract: query by role + accessible name, then label or visible text, `getByTestId` last. If an element isn't reachable by role + name, fix the component. Never query by CSS class or DOM shape.
- No test slop: no asserting static attributes or constants, no re-testing one code path with cosmetically different inputs, no testing platform behavior the code doesn't handle.
