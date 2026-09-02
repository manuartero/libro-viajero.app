# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

---

## What is this?

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative — where each child takes home a different book every week.

Every Friday the teacher needs to:
- Collect returned books
- Track who didn't bring theirs back
- Decide which book goes in which backpack for next week
- Remind parents when needed

This app makes all of that frictionless. Open it Friday afternoon, tap through the check-in, confirm next week's assignments. Done in under 2 minutes.

**Mobile-first**: built for the phone in the teacher's hand (user testing on a Xiaomi Redmi 15C). Desktop just gets the same layout, centered.

---

## Privacy

**Ningún dato sale de tu teléfono sin que tú lo sepas.**

- No server, no database, no accounts, no login. Everything lives in the browser's `localStorage`, on the teacher's phone — the same place, and the same protection, as the notes app.
- Children are never identified by real name: emoji + color avatars and a teacher-chosen nickname.
- The only network traffic is a book title sent to [Open Library](https://openlibrary.org) to find a cover. A Content-Security-Policy baked into the built page lets the browser enforce that nothing else is contacted.
- **Descargar mis datos** (the **?** button on the dashboard) downloads a JSON copy of everything, so a class survives a new phone or a cleared browser.

---

## Features

- **Child avatars**: emoji + color, no real names
- **Book covers**: found automatically via Open Library search, or entered by hand
- **Friday check-in**: tap to mark returns; see who's missing, with a ready-to-copy parent reminder
- **Smart rotation**: next week's assignments suggested automatically — every child reads every book
- **History**: every past week's check-in
- **Your data, your file**: one-tap download of all app data

---

## Running the project

```bash
pnpm install
pnpm dev         # Vite dev server at http://localhost:5173
pnpm test        # Vitest
pnpm build       # TypeScript check + Vite production build
pnpm blue-ball   # lint + test + build — run before pushing
```

No environment variables, no API keys.

---

## Docs

- [VISION.md](VISION.md) — the story behind this project
- [SPEC.md](SPEC.md) — product spec, user stories, acceptance criteria
- [AGENTS.md](AGENTS.md) — AI agent working instructions
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — data model reference

---

## License

MIT — Manuel Artero
