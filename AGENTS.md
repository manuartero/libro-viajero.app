# AGENTS.md

**libro-viajero.app** — 100% client-side React + TypeScript app for teachers running a "traveling book" classroom initiative. Friday check-in: tap who returned their book, see who's missing, confirm next week's assignments. All data in `localStorage`.

Docs: [VISION.md](VISION.md) (why) · [SPEC.md](SPEC.md) (stack, stories, acceptance criteria) · [docs/DATA_MODEL.md](docs/DATA_MODEL.md) (types, storage, algorithms) · [README.md](README.md) (setup & commands).

## Plan Mode

- Plans extremely concise; sacrifice grammar for concision.
- End every plan with the list of unresolved questions, if any.

## Standards

### Mobile first (IMPORTANT)

- Design for **360×800 CSS px** — reference device: **Xiaomi Redmi 15C** (6.9", 720×1600, DPR 2). All user testing happens on it.
- Desktop is just the same layout centered: `max-width` + auto margins. Nothing else.
- Media queries: `min-width` only.
- Units: `rem` for type/spacing, `%`/flex/grid for layout, `dvh` (never `vh`) for viewport height, `clamp()` for fluid sizing. `px` only for borders/shadows.
- Touch targets ≥ 44×44px. No horizontal scroll, ever.

### Filenames

- Always `kebab-case`. Never PascalCase or camelCase.
- Pattern `<module>.<role>.ts(x)`: `storage.service.ts`, `child-avatar.component.tsx`, `rotation.service.test.ts`.

### Imports

- Absolute `src/*` paths; relative only for same-folder files (e.g. `./child-avatar.module.css`).
- `import type` for type-only imports.

### Code style

- `type` for data shapes; `interface` only for behavioral contracts (e.g. `Runnable { run() }`).
- No `class`, no `this`, no `new` — plain functions, closures, function factories.
- Let TypeScript infer return types; annotate only when inference fails or a public API needs it.
- 2+ params → single destructured object param.
- No `any`; use `unknown` if truly unknown.

### Components

- Functional only.
- Props type immediately above the component, named `{ComponentName}Props`. No `React.FC<>`.

### CSS

- All styling in `.module.css` — no inline styles.
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
