# Product Spec — v1

## Goals

- A Friday check-in takes under **2 minutes**; setting up a new project (children + books + initial assignments) under **10 minutes**
- All data persists across sessions without a server or database
- No child's real name is ever required
- Mobile first (concrete rules in [AGENTS.md](AGENTS.md))

## Non-Goals (v1)

- Any server-side component, account, or login — including multi-teacher collaboration
- Push notifications or reminders sent to parents (WhatsApp/email), and any parent-facing view
- PDF export, report generation, grades, attendance, behavior — this is not a classroom management platform
- Offline-first / PWA / installable app
- More than one active project at a time
- Book lending tracking beyond the current week; book ratings; ISBN scanning
- Importing a downloaded `libro-viajero-*.json` (new phone, next year's teacher) — future work

---

## User Stories

Status: ✅ shipped · 🚧 placeholder · ❌ not built.

### Privacy & Data Ownership — ✅ shipped

One phone = one teacher = one localStorage key (`src/services/storage.service.ts`). The only network traffic is the Open Library search and its cover images, enforced by a Content-Security-Policy injected at build time (`src/lib/csp.ts`).

|   ID   |                                                 Story                                                  | Status |
| ------ | ------------------------------------------------------------------------------------------------------ | ------ |
| PRIV-1 | As a teacher, I can open the app and pick up where I left off, with no account and no sign-in          | ✅     |
| PRIV-2 | As a teacher, I can read in plain words, from the dashboard, what leaves my phone (nothing I don't know about) | ✅     |
| PRIV-3 | As a teacher, I can download a copy of all my data as a file, whenever I want                         | ✅     |

### Project Setup — ✅ shipped

Decisions worth knowing, since they are not obvious from the stories:

- The school year is stamped from the calendar (`currentSchoolYear()`, July onwards counts as the upcoming course), never chosen by the teacher.
- The project starts empty and the dashboard's empty states drive first-time setup: añadir peques → añadir libros → repartir libros.
- The **Clase** tab leads with the class list at every size, empty included; the builder sits behind a bar below it and stays open across additions, so a class of twenty stays two taps per child. Tapping a child opens their loan card, not the form — editing is the pencil on the card.
- The avatar catalog carries **no human faces** — an avatar must never resemble a real child.
- Book search falls back to manual entry when Open Library has nothing.
- A book stays out **one or two weeks** (`Project.loanWeeks`, read through `loanWeeksOf()` in `src/project/loan.model.ts`), for the whole class alike. The teacher sets it in the reparto, where it is spelled out as a return date, and it saves with the reparto.

|   ID    |                                                Story                                                 | Status |
| ------- | ---------------------------------------------------------------------------------------------------- | ------ |
| SETUP-1 | As a teacher, I can create a new "traveling book project" and give it a name                         | ✅     |
| SETUP-2 | As a teacher, I can add each child to the project using a nickname or tag (not their real name)      | ✅     |
| SETUP-3 | As a teacher, I can assign an emoji and background color to each child to create their avatar        | ✅     |
| SETUP-4 | As a teacher, I can add books to the project by searching by title                                   | ✅     |
| SETUP-5 | As a teacher, the app automatically finds and displays the book cover when I search                  | ✅     |
| SETUP-6 | As a teacher, I can distribute books to children from the dashboard ("Repartir libros"), at the start and mid-course | ✅     |
| SETUP-7 | As a teacher, I can run the class with fewer books than children — the children without a book wait for the next rotation | ✅     |
| SETUP-8 | As a teacher, I can choose whether the class keeps a book one week or two, and the dashboard judges returns by it | ✅     |

### Friday Check-in (Dashboard)

|   ID    |                                             Story                                              | Status |
| ------- | ---------------------------------------------------------------------------------------------- | ------ |
| DASH-1  | As a teacher, I can open the dashboard and see all children with their current book assignment, its cover, and how long they have had it — grouped by whether it is late, due this Friday, or still out | ✅     |
| DASH-2  | As a teacher, I can tap a child's avatar to mark that they returned their book, and it is saved on the spot — on time or late with one tap, early (the book is not due yet) after a confirm | ✅     |
| DASH-3  | As a teacher, I can tap again to undo a return mark                                            | ✅     |
| DASH-4  | As a teacher, I can see a live count of how many books have been returned                      | ✅     |
| DASH-5  | As a teacher, I can see a summary of which children did NOT return a book that was due, and when the rest are due | ✅     |
| DASH-7  | As a teacher, I can see the suggested assignments for next week (books that came back only)    | 🚧 index-shift placeholder; real algorithm specced in issue #5 |
| DASH-8  | As a teacher, I can swap two children's suggested assignments before confirming                | ❌     |
| DASH-9  | As a teacher, I can confirm the check-in to save the session and update current assignments    | dropped — a return saves itself (DASH-2), and the reparto (SETUP-6) is what moves the books on |
| DASH-10 | As a teacher, a book that was NOT returned does not get assigned to a new child next week      | ✅ the reparto seeds only from books still out; a returned one waits on the tray |

### History

There is no weekly session: a loan is the unit. Tapping a card writes `returnedOn` on the live assignment, and the next reparto closes every returned or replaced assignment into `Project.history` (`distributeBooks()` in `src/project/project.model.ts`), as does removing a child or a book. Tapping a child in the **Clase** list opens their loan card (`loanLogOf()` in `src/project/loan-log.model.ts`): one dated line per book, from history plus the live assignment. The edit form is behind the card's pencil.

|   ID   |                                Story                                | Status |
| ------ | ------------------------------------------------------------------- | ------ |
| HIST-1 | As a teacher, I can see a log of all past weekly sessions           | ❌     |
| HIST-2 | As a teacher, I can see which child had which book in any past week | ❌     |
| HIST-3 | As a teacher, I can tap a child in the class list and see every book they have taken home, with dates and whether it came back | ✅     |
