# Changelog

## [0.2.0](https://github.com/manuartero/libro-viajero.app/compare/v0.1.0...v0.2.0) — 2026-09-24

### Features

- a release workflow tags the build sent to teachers ([#47](https://github.com/manuartero/libro-viajero.app/pull/47))
- "Repartir libros" shows only when there is a free book and a child to take it ([#46](https://github.com/manuartero/libro-viajero.app/pull/46))
- tap a book on the shelf to see where it has travelled ([#45](https://github.com/manuartero/libro-viajero.app/pull/45))
- the dashboard foot prints the version and opens a colophon ([#42](https://github.com/manuartero/libro-viajero.app/pull/42))
- the data sheet opens from a download icon, with shorter copy ([#40](https://github.com/manuartero/libro-viajero.app/pull/40))
- the reparto opens filled in, rotated clockwise ([#39](https://github.com/manuartero/libro-viajero.app/pull/39))

### Fixes

- the release workflow no longer needs pnpm to set up node ([#50](https://github.com/manuartero/libro-viajero.app/pull/50))

### Style

- blue-black ink on a lighter sheet, returned cards legible ([#44](https://github.com/manuartero/libro-viajero.app/pull/44))
- a trash icon on the shelf, and the return count moves into its section ([#41](https://github.com/manuartero/libro-viajero.app/pull/41))

### Chores

- trim test slop, dead code, repeated CSS and doc duplication ([#48](https://github.com/manuartero/libro-viajero.app/pull/48))
- trim AGENTS.md and SPEC.md ([#37](https://github.com/manuartero/libro-viajero.app/pull/37))
- less duplication, fewer lines, helpers pulled out ([#43](https://github.com/manuartero/libro-viajero.app/pull/43))

## [0.1.0](https://github.com/manuartero/libro-viajero.app/releases/tag/v0.1.0) — 2026-09-08

The first build shared with teachers.

### Features

- create a class in one screen: children with an emoji avatar and colour, books found on Open Library or typed in by hand ([#9](https://github.com/manuartero/libro-viajero.app/pull/9), [#10](https://github.com/manuartero/libro-viajero.app/pull/10), [#13](https://github.com/manuartero/libro-viajero.app/pull/13))
- the Friday dashboard: who returned, who is reading, who is overdue, judged by each loan rather than the calendar week ([#28](https://github.com/manuartero/libro-viajero.app/pull/28))
- a tap on a child's card saves the return ([#31](https://github.com/manuartero/libro-viajero.app/pull/31))
- the reparto hands each returned book on to the next child, launched from the dashboard ([#13](https://github.com/manuartero/libro-viajero.app/pull/13), [#31](https://github.com/manuartero/libro-viajero.app/pull/31), [#33](https://github.com/manuartero/libro-viajero.app/pull/33))
- privacy by absence: no login, no server, everything stays in the phone's `localStorage`, behind a strict CSP ([#15](https://github.com/manuartero/libro-viajero.app/pull/15))
- download your data as a copy, and restore it from the first screen or the data sheet ([#15](https://github.com/manuartero/libro-viajero.app/pull/15), [#38](https://github.com/manuartero/libro-viajero.app/pull/38))

### Style

- the "raw newsprint" look: hard ink borders, square corners, uppercase datelines ([#8](https://github.com/manuartero/libro-viajero.app/pull/8))

### Chores

- unit tests on every PR, and a Playwright suite covering the five main flows in a real browser ([#16](https://github.com/manuartero/libro-viajero.app/pull/16), [#30](https://github.com/manuartero/libro-viajero.app/pull/30))
- blue ball and e2e must pass before the Vercel deploy to libro-viajero.app runs ([#23](https://github.com/manuartero/libro-viajero.app/pull/23))
