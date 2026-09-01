# AGENTS.md

**libro-viajero.app** — 100% client-side React + TypeScript app for teachers running a "traveling book" classroom initiative. Friday check-in: tap who returned their book, see who's missing, confirm next week's assignments. All data in `localStorage`.

Docs: [VISION.md](VISION.md) (why) · [SPEC.md](SPEC.md) (stories, scope, build status) · [docs/DATA_MODEL.md](docs/DATA_MODEL.md) (storage schema, algorithms) · [README.md](README.md) (setup & commands).

## Standards

### Mobile first (IMPORTANT)

- Design for **360×800 CSS px** — reference device: **Xiaomi Redmi 15C** (6.9", 720×1600, DPR 2). All user testing happens on it.
- Desktop is just the same layout centered: `max-width` + auto margins. Nothing else.
- Media queries: `min-width` only.
- Units: `rem` for type/spacing, `%`/flex/grid for layout, `dvh` (never `vh`) for viewport height, `clamp()` for fluid sizing. `px` only for borders/shadows.
- Touch targets ≥ 44×44px. No horizontal scroll, ever.

### Language

- **UI copy is Spanish; docs, code, and comments are English.** Parent-facing strings (e.g. the reminder message) are Spanish too.

### Design language ("raw newsprint")

- Tokens in `src/styles/globals.css`: `--paper`/`--paper-dark` (ground), `--ink`/`--ink-soft` (text/borders), `--returned`/`--returned-dark` (green), `--missing` (red), `--font-body` (Helvetica), `--font-display` (Besley serif, 700).
- Hard 2–3px `--ink` borders, `border-radius: 0` on buttons, uppercase letter-spaced datelines. No shadows, no gradients.
- Two 12-color palettes exist on purpose: `AVATAR_COLORS` (child domain) and `COVER_PLACEHOLDER_COLORS` (book domain) — same hues, owned separately so domains don't cross-import.

### Dependencies

- Exact versions only (`save-exact=true`). Runtime deps are currently `react`, `react-dom`, `@fontsource/besley` — adding one is a decision, not a convenience.
- **No**: react-router, Redux, Zustand, MUI, Tailwind, styled-components, Axios, date-fns, lodash, or any other library not listed.

### Filenames

- Always `kebab-case`. Never PascalCase or camelCase.
- Pattern `<module>.<role>.ts(x)`: `storage.service.ts`, `child-avatar.component.tsx`, `open-library.service.test.ts`.

### Imports

- Absolute `src/*` paths; relative only for same-folder files (e.g. `./child-avatar.module.css`).
- `import type` for type-only imports.

### Code style

- `type` for data shapes; `interface` only for behavioral contracts (e.g. `Runnable { run() }`).
- No `class`, no `this` — plain functions, closures, function factories. `new` only for built-ins (`Date`, `Map`, `Set`, `Error`, …). Exception: React error boundaries must be class components (`app-error-boundary.component.tsx`).
- Let TypeScript infer return types; annotate only when inference fails or a public API needs it.
- 2+ params → single destructured object param.
- No `any`; use `unknown` if truly unknown.

### Components

- Functional only.
- Props type immediately above the component, named `{ComponentName}Props`. No `React.FC<>`.

### CSS

- All styling in `.module.css` — inline `style` only for values computed at runtime (e.g. avatar/cover background color).
- Custom properties in `:root` in `src/styles/globals.css`, imported once from `main.tsx`. No global class names outside it.

### Folder layout

- No `utils/`, `types/`, `helpers/` catch-alls — and no `types.ts` either. Name folders by domain; every type lives in its domain module (`src/project/project.model.ts` defines `Project`), even if that means more files.
- Accepted non-domain folders: `services/` (I/O), `styles/`, `lib/`, `data/`.

### Testing

- Co-located: `<module>.<role>.test.ts(x)` beside the source.
- Outer `describe` encodes kind: `describe('foo()')`, `describe('<Foo />')`, `describe('foo{}')`.
- Query as a user perceives the UI: role + accessible name → label/visible text → `getByTestId` as last resort. Never by CSS class or DOM shape.
- Assert behavior and handler spies, not rendering detail. Hooks via `renderHook`.
- Accessibility is the test contract: if an element isn't reachable by role + name, fix the component.
- No test slop: no asserting static attributes or constants, no re-testing the same code path with cosmetically different inputs, no testing platform behavior the code doesn't handle.
