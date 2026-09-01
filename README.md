# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative — where each child takes home a different book every week. Open it Friday afternoon, tap through the check-in, confirm next week's assignments.

**All data lives in your browser. No server. No accounts stored anywhere. Just you and your classroom.** Mobile-first: built for the phone in the teacher's hand.

---

## Status

Shipped: setup wizard (classroom → children with emoji+color avatars, no real names → books via Open Library search with covers → initial assignments) and the Friday check-in dashboard (tap to mark returns, missing summary with a ready-to-copy parent reminder).

Planned, not built yet: Google Sign-In (identification only), confirming/saving a week, the history view, and the real rotation algorithm (current suggestion is a placeholder).

---

## Running the project

```bash
pnpm install
pnpm dev         # Vite dev server at http://localhost:5173
pnpm test        # Vitest
pnpm build       # TypeScript check + Vite production build
pnpm blue-ball   # lint + test + build — run before pushing
```

---

## Docs

See the index in [AGENTS.md](AGENTS.md) — vision, product spec, data model, and working conventions.

---

## License

MIT — Manuel Artero
