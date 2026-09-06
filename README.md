# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative, where each child takes home a different book every week. Open it Friday afternoon, tap through the check-in, confirm next week's assignments.

Mobile-first, built for the phone in the teacher's hand. All data lives in the browser — no server, no accounts.

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
pnpm test              # Vitest, both suites
pnpm test:unit         # modules in isolation (*.test.ts(x))
pnpm test:integration  # full flows through <App /> (*.integration.test.tsx)
pnpm test:e2e          # Playwright in a real browser, Open Library mocked (e2e/)
pnpm test:e2e:docker   # the same suite inside the official Playwright image
pnpm build             # TypeScript check + Vite production build
pnpm blue-ball         # lint + test + build — run before pushing
```

No environment variables, no API keys. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the three suites as separate jobs on every pull request to `main`; the e2e job runs the same Docker image as `pnpm test:e2e:docker`.

---

## Releasing

Merging to `main` runs [`.github/workflows/release.yml`](.github/workflows/release.yml): **blue ball** (`pnpm blue-ball` — lint + test + build) and the **e2e** suite run in parallel, and only if both pass does **deploy (production)** build with the Vercel CLI and promote to production. A red check stops the chain: nothing ships.

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
