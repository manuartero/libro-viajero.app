# Changelog

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
