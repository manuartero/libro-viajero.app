# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative, where each child takes home a different book every week. Open it Friday afternoon, tap through the check-in, confirm next week's assignments.

Mobile-first, built for the phone in the teacher's hand. All data lives in the browser — no server, no accounts.

Live at **[libro-viajero.app](https://libro-viajero.app)**.

---

## Privacy

**Ningún dato sale de tu teléfono sin que tú lo sepas.**

- Everything lives in the browser's `localStorage`, on the teacher's phone — the same place, and the same protection, as the notes app.
- Children are never identified by real name: emoji + color avatars and a teacher-chosen nickname.
- The only network traffic is a book title sent to [Open Library](https://openlibrary.org) to find a cover. A Content-Security-Policy baked into the built page lets the browser enforce that nothing else is contacted.
- **Descargar mis datos** (the **?** button on the dashboard) downloads a JSON copy of everything, so a class survives a new phone or a cleared browser.

---

## Running the project

```bash
pnpm install
pnpm dev               # Vite dev server at http://localhost:5173
pnpm test              # Vitest unit tests, one module at a time (src/**/*.test.ts(x))
pnpm test:e2e          # Playwright flows in a real browser, Open Library mocked (e2e/)
pnpm test:e2e:docker   # the same suite inside the official Playwright image
pnpm build             # TypeScript check + Vite production build
pnpm blue-ball         # lint + test + build — run before pushing
```

No environment variables, no API keys. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the three suites as separate jobs on every pull request to `main`; the e2e job runs the same Docker image as `pnpm test:e2e:docker`.

### Sample classrooms

[`samples/`](samples/) holds three downloaded copies, each eight children and twelve books, to try the restore with ("Recuperar una copia") or to fill a phone for a demo. Nicknames and avatars only, no real children; covers come from Open Library.

| File | Class | What it shows |
| --- | --- | --- |
| `long-history-2026-06-19.json` | Las Ardillas 2025/26 | Last year's class: a full course of history, five books back and three still out since June, so every loan is overdue today |
| `new-classroom-2026-09-07.json` | Los Caracoles 2026/27 | The course just started: two weeks per book, one trial round in the history, two newcomers without a book yet |
| `mixed-week-2026-09-08.json` | Los Búhos 2026/27 | Every dashboard section at once: overdue, due this Friday, reading, two early returns, one book that never came home |

The date stays at the end of each name because the restore preview reads "Copia del…" from it. Dates are absolute, so the third file was built for the week of 7 September 2026 and its sections drift as weeks pass. `src/backup/samples.test.ts` keeps the three restorable as the model moves on.

---

## Releasing

Merging to `main` runs [`.github/workflows/release.yml`](.github/workflows/release.yml): **blue ball** (`pnpm blue-ball` — lint + test + build) and the **e2e** suite run in parallel, and only if both pass does **deploy (production)** build with the Vercel CLI and promote to production at [libro-viajero.app](https://libro-viajero.app). A red check stops the chain: nothing ships.

Vercel's own auto-deploy for `main` is switched off in [`vercel.json`](vercel.json) (`git.deploymentEnabled`) precisely so that the workflow is the only thing that can ship to production — otherwise Vercel would deploy on push, before the checks had a chance to run. Preview deploys for pull requests are unaffected.

### Versioning

The `version` in `package.json` is bumped by hand, in the PR that earns it. No tooling reads it; it is a label for humans.

### One-time setup

Three secrets under **Settings → Secrets and variables → Actions**, none of which can be committed: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. The two IDs come from `.vercel/project.json` after a local `vercel link`.

---

## Docs

[VISION.md](VISION.md) (why) · [SPEC.md](SPEC.md) (stories and what is built) · [AGENTS.md](AGENTS.md) (conventions).

There is no data-model doc: the types are the source of truth in their domain modules (`src/*/*.model.ts`), and the storage schema is `src/services/storage.service.ts`.

---

## License

MIT — Manuel Artero
