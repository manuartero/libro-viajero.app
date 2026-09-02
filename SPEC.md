# Product Spec — v1

## Goals

- A teacher can complete a full Friday book check-in in under **2 minutes**
- A teacher can set up a new traveling book project (children + books + initial assignments) in under **10 minutes**
- All data persists across sessions without a server or database
- Mobile first: works on modern mobile browsers (iOS Safari, Android Chrome); verified on a **Xiaomi Redmi 15C** (360×800 CSS viewport)
- No child's real name is ever required

## Non-Goals (v1)

- Multi-teacher collaboration (one account, one project set)
- Push notifications / reminders to parents
- PDF export or report generation
- Offline-first / PWA / installable app
- Multiple concurrent active projects (one active project at a time)
- Book lending tracking (who has which physical copy at any time beyond current week)
- Parent-facing view
- Any server-side component
- Accounts or login of any kind — there is nothing to log in to

---

## Stack

|         Tool          |                     Version / Notes                      |
| --------------------- | --------------------------------------------------------- |
| React                 | 19, functional components only                             |
| Vite                  | build + dev server                                         |
| Vitest                | unit tests, co-located `<module>.<role>.test.ts(x)` files  |
| CSS Modules           | `.module.css` files — no CSS framework                     |
| pnpm                  | package manager, exact versions only (`save-exact=true`)   |
| biome                 | lint + format                                              |
| Runtime deps          | **none** beyond React; `@fontsource/besley` bundles the font locally |

`pnpm blue-ball` = lint + test + build. No red gate, no merge.

**No**: react-router, Redux, Zustand, MUI, Tailwind, styled-components, Axios, date-fns, lodash, or any other library not listed.

---

## User Stories

### Privacy & Data Ownership

|   ID   |                                                 Story                                                  |
| ------ | ------------------------------------------------------------------------------------------------------ |
| PRIV-1 | As a teacher, I can open the app and pick up where I left off, with no account and no sign-in          |
| PRIV-2 | As a teacher, I can read in plain words, from the dashboard, what leaves my phone (nothing I don't know about) |
| PRIV-3 | As a teacher, I can download a copy of all my data as a file, whenever I want                         |

### Project Setup

|   ID    |                                                Story                                                 |
| ------- | ---------------------------------------------------------------------------------------------------- |
| SETUP-1 | As a teacher, I can create a new "traveling book project" and give it a name                         |
| SETUP-2 | As a teacher, I can add each child to the project using a nickname or tag (not their real name)      |
| SETUP-3 | As a teacher, I can assign an emoji and background color to each child to create their avatar        |
| SETUP-4 | As a teacher, I can add books to the project by searching by title                                   |
| SETUP-5 | As a teacher, the app automatically finds and displays the book cover when I search                  |
| SETUP-6 | As a teacher, I can manually assign one book to each child at the start of the project               |
| SETUP-7 | As a teacher, I cannot start the project if the number of books doesn't match the number of children |

### Friday Check-in (Dashboard)

|   ID    |                                             Story                                              |
| ------- | ---------------------------------------------------------------------------------------------- |
| DASH-1  | As a teacher, I can open the dashboard and see all children with their current book assignment |
| DASH-2  | As a teacher, I can tap a child's avatar to mark that they returned their book                 |
| DASH-3  | As a teacher, I can tap again to undo a return mark                                            |
| DASH-4  | As a teacher, I can see a live count of how many books have been returned                      |
| DASH-5  | As a teacher, I can see a summary of which children did NOT return their book                  |
| DASH-6  | As a teacher, I can copy a pre-written parent reminder message for each missing child/book     |
| DASH-7  | As a teacher, I can see the suggested assignments for next week (books that came back only)    |
| DASH-8  | As a teacher, I can swap two children's suggested assignments before confirming                |
| DASH-9  | As a teacher, I can confirm the check-in to save the session and update current assignments    |
| DASH-10 | As a teacher, a book that was NOT returned does not get assigned to a new child next week      |

### History

|   ID   |                                Story                                |
| ------ | ------------------------------------------------------------------- |
| HIST-1 | As a teacher, I can see a log of all past weekly sessions           |
| HIST-2 | As a teacher, I can see which child had which book in any past week |

---

## Feature Breakdown

### F1: Privacy & Data Ownership
- No server, no accounts, no login. One phone = one teacher = one localStorage key
- The only network traffic is the Open Library search (book titles) and cover images
- Enforced by a Content-Security-Policy `<meta>` injected at build time (`vite.config.ts`): scripts, styles and fonts from the app's own origin only; `connect-src` limited to `openlibrary.org`; images from `covers.openlibrary.org`
- Dashboard header shows a **?** button opening "Tus datos": the promise *"Ningún dato sale de tu teléfono sin que tú lo sepas"*, what does leave (Open Library), and a warning that clearing browser data deletes the class
- **Descargar mis datos** in that panel downloads `libro-viajero-{YYYY-MM-DD}.json` with the whole `AppData`, straight from the browser

### F2: Project Management
- Create, rename, and (future) delete projects
- v1: one project can be "active" at a time
- Setup wizard: 3 steps (children → books → assign)

### F3: Child Avatars
- Nickname/tag: defaults to the tapped emoji's name ("Rana", "Dino"); the text field stays hidden until the teacher taps **Cambiar apodo**. Free text, up to 20 characters. The happy path never asks for a name
- Emoji: chosen from a curated grid of ~40 emoji (no keyboard input)
- Color: chosen from a palette of ~12 accessible background colors
- Avatar = emoji centered on a colored circle

### F4: Book Library
- Search Open Library by title
- Display up to 8 search results with covers
- Manual entry fallback if search finds nothing
- Cover stored as URL; missing covers get a color-based placeholder

### F5: Friday Check-in
- One-tap return marking per child
- Unreturned books remain assigned to the same child next week
- Rotation suggestion uses history to find the child who has waited longest for each book
- Teacher can swap pairs in the suggestion before confirming
- Confirmation saves a `WeeklySession` to history and updates `currentAssignments`

### F6: Parent Reminder
- Auto-generated message: `"Hi! Just a reminder that [tag]'s copy of '[book title]' hasn't come back yet. No worries — just whenever you can! 📚"`
- One tap to copy to clipboard

---

## Acceptance Criteria

### Friday check-in flow
- [ ] All children visible on dashboard with current book
- [ ] Tap toggles returned/not-returned state with clear visual feedback
- [ ] Missing summary updates in real time as teacher taps
- [ ] Suggested next-week assignments appear automatically
- [ ] Confirmed session appears in history
- [ ] After confirming, dashboard reflects new assignments

### Data persistence & privacy
- [ ] Reloading the page shows the same projects and history, with no sign-in
- [ ] The browser's network tab shows requests to `openlibrary.org` / `covers.openlibrary.org` only
- [ ] The built `index.html` carries the Content-Security-Policy meta tag
- [ ] "Descargar mis datos" produces a JSON file that parses back into the stored `AppData`

### Mobile UX
- [ ] All interactive elements are at least 44×44px
- [ ] Check-in works entirely in portrait mode at 360px width (Xiaomi Redmi 15C)
- [ ] No horizontal scroll on any view

---

## Success Metrics

|        Metric        |                       Target                       |
| -------------------- | -------------------------------------------------- |
| Friday check-in time | < 2 minutes for 12 children                        |
| Project setup time   | < 10 minutes first time                            |
| Task completion rate | Teacher can complete check-in without instructions |
| Data loss incidents  | Zero (localStorage + confirmation gate)            |

---

## Out of Scope (Future)

- **Notifications**: WhatsApp/email integration for parent reminders
- **PWA**: Installable, offline-capable app
- **Multi-device sync**: Same teacher, multiple devices
- **Shared projects**: Co-teachers managing the same classroom
- **Import**: restore a class from a downloaded `libro-viajero-*.json` (new phone, next year's teacher)
- **Export**: PDF summary of the semester's rotation
- **Book ratings**: Children mark how much they liked a book
- **ISBN scanning**: Camera-based book lookup
