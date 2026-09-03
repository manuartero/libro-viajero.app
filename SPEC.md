# Product Spec — v1

## Goals

- A teacher can complete a full Friday book check-in in under **2 minutes**
- A teacher can set up a new traveling book project (children + books + initial assignments) in under **10 minutes**
- All data persists across sessions without a server or database
- Mobile first (the concrete rules live in [AGENTS.md](AGENTS.md))
- No child's real name is ever required

## Non-Goals (v1)

- Multi-teacher collaboration (one account, one project set)
- Push notifications / reminders to parents (WhatsApp/email integration)
- PDF export or report generation
- Offline-first / PWA / installable app
- Multiple concurrent active projects (one active project at a time)
- Book lending tracking (who has which physical copy beyond the current week)
- Parent-facing view
- Any server-side component
- Accounts or login of any kind — there is nothing to log in to
- Book ratings, ISBN scanning
- Grades, attendance, behavior — this is not a classroom management platform
- Importing a downloaded `libro-viajero-*.json` (new phone, next year's teacher) — future work

---

## User Stories

Status: ✅ shipped · 🚧 placeholder · ❌ not built.

### Privacy & Data Ownership — ✅ shipped

No server, no accounts, no login: one phone = one teacher = one localStorage key (see docs/DATA_MODEL.md). The only network traffic is the Open Library search (book titles) and cover images, and a Content-Security-Policy `<meta>` injected at build time (`src/lib/csp.ts`, via `vite.config.ts`) lets the browser enforce it: scripts and fonts from the app's own origin only; stylesheets from the app's origin plus inline `style` attributes (avatar and cover colours); `connect-src` limited to `openlibrary.org`; images from `covers.openlibrary.org`. The dashboard header shows a **?** button opening "Tus datos": the promise *"Ningún dato sale de tu teléfono sin que tú lo sepas"*, what does leave (Open Library), and a warning that clearing browser data deletes the class. **Descargar mis datos** in that panel downloads `libro-viajero-{YYYY-MM-DD}.json` with the whole `AppData`, straight from the browser.

|   ID   |                                                 Story                                                  | Status |
| ------ | ------------------------------------------------------------------------------------------------------ | ------ |
| PRIV-1 | As a teacher, I can open the app and pick up where I left off, with no account and no sign-in          | ✅     |
| PRIV-2 | As a teacher, I can read in plain words, from the dashboard, what leaves my phone (nothing I don't know about) | ✅     |
| PRIV-3 | As a teacher, I can download a copy of all my data as a file, whenever I want                         | ✅     |

### Project Setup — ✅ shipped

"Crear la clase" asks only for the class name; the running course is stamped onto it from the calendar (`currentSchoolYear()`, where July onwards already counts as the upcoming course), never chosen. The project starts empty and the dashboard's empty states guide the first-time setup (añadir peques → añadir libros → repartir libros). Navigation is a bottom tab bar of three sections (**Semana** · **Clase** · **Biblioteca**) driven by a single view state, no router; "Repartir libros" is a full-screen flow launched from the dashboard (the tab bar hides while it is active). Avatars: a curated grid of 20 emoji (no human faces — an avatar must never resemble a real child; each emoji carries a Spanish nickname suggestion so adding a child can be pure tapping) and a palette of 12 colors. Books: Open Library title search (up to 8 results with covers) with a manual-entry fallback.

|   ID    |                                                Story                                                 | Status |
| ------- | ---------------------------------------------------------------------------------------------------- | ------ |
| SETUP-1 | As a teacher, I can create a new "traveling book project" and give it a name                         | ✅     |
| SETUP-2 | As a teacher, I can add each child to the project using a nickname or tag (not their real name)      | ✅     |
| SETUP-3 | As a teacher, I can assign an emoji and background color to each child to create their avatar        | ✅     |
| SETUP-4 | As a teacher, I can add books to the project by searching by title                                   | ✅     |
| SETUP-5 | As a teacher, the app automatically finds and displays the book cover when I search                  | ✅     |
| SETUP-6 | As a teacher, I can distribute books to children from the dashboard ("Repartir libros"), at the start and mid-course | ✅     |
| SETUP-7 | As a teacher, I can run the class with fewer books than children — the children without a book wait for the next rotation | ✅     |

### Friday Check-in (Dashboard)

|   ID    |                                             Story                                              | Status |
| ------- | ---------------------------------------------------------------------------------------------- | ------ |
| DASH-1  | As a teacher, I can open the dashboard and see all children with their current book assignment | ✅     |
| DASH-2  | As a teacher, I can tap a child's avatar to mark that they returned their book                 | ✅     |
| DASH-3  | As a teacher, I can tap again to undo a return mark                                            | ✅     |
| DASH-4  | As a teacher, I can see a live count of how many books have been returned                      | ✅     |
| DASH-5  | As a teacher, I can see a summary of which children did NOT return their book                  | ✅     |
| DASH-6  | As a teacher, I can copy a pre-written parent reminder message for each missing child/book     | ✅     |
| DASH-7  | As a teacher, I can see the suggested assignments for next week (books that came back only)    | 🚧 index-shift placeholder; real algorithm specced in docs/DATA_MODEL.md |
| DASH-8  | As a teacher, I can swap two children's suggested assignments before confirming                | ❌     |
| DASH-9  | As a teacher, I can confirm the check-in to save the session and update current assignments    | ❌     |
| DASH-10 | As a teacher, a book that was NOT returned does not get assigned to a new child next week      | 🚧 modeled (see the invariant in `src/project/project.model.ts`), pending DASH-9 |

The reminder message text lives in `src/dashboard/missing-summary.component.tsx` — the component is its source of truth.

### History — ❌ not built

`Project.history` is modeled but only ever written as `[]`; there is no history UI yet.

|   ID   |                                Story                                |
| ------ | ------------------------------------------------------------------- |
| HIST-1 | As a teacher, I can see a log of all past weekly sessions           |
| HIST-2 | As a teacher, I can see which child had which book in any past week |
