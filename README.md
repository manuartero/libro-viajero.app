# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative — where each child takes home a different book every week. Open it Friday afternoon, tap through the check-in, confirm next week's assignments.

**All data lives in your browser. No server. No accounts. Just you and your classroom.** Mobile-first: built for the phone in the teacher's hand.

---

## Privacy

**Ningún dato sale de tu teléfono sin que tú lo sepas.**

- No server, no database, no accounts, no login. Everything lives in the browser's `localStorage`, on the teacher's phone — the same place, and the same protection, as the notes app.
- Children are never identified by real name: emoji + color avatars and a teacher-chosen nickname.
- The only network traffic is a book title sent to [Open Library](https://openlibrary.org) to find a cover. A Content-Security-Policy baked into the built page lets the browser enforce that nothing else is contacted.
- **Descargar mis datos** (the **?** button on the dashboard) downloads a JSON copy of everything, so a class survives a new phone or a cleared browser.

---

## Status

Shipped: class creation, children with emoji+color avatars (no real names), books via Open Library search with covers, the reparto, the Friday check-in dashboard (tap to mark returns, missing summary with a ready-to-copy parent reminder), and the privacy panel with data download.

Planned, not built yet: confirming/saving a week, the history view, the real rotation algorithm (current suggestion is a placeholder), and importing a downloaded data file.

---

## Running the project

```bash
pnpm install
pnpm dev               # Vite dev server at http://localhost:5173
pnpm test              # Vitest, both suites
pnpm test:unit         # modules in isolation (*.test.ts(x))
pnpm test:integration  # full flows through <App /> (*.integration.test.tsx)
pnpm build             # TypeScript check + Vite production build
pnpm blue-ball         # lint + test + build — run before pushing
```

No environment variables, no API keys.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the unit and integration suites as separate jobs on every pull request to `main`.

---

## Docs

See the index in [AGENTS.md](AGENTS.md) — vision, product spec, data model, and working conventions.

---

## License

MIT — Manuel Artero
