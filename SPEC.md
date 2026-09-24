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

---

## Product decisions

What the code cannot tell you about why the app behaves as it does.

### Privacy & data ownership

- One phone = one teacher = one localStorage key (`src/services/storage.service.ts`). No account, no sign-in.
- The only network traffic is the Open Library search and its cover images, enforced by a Content-Security-Policy injected at build time (`src/lib/csp.ts`).
- A downloaded copy restores from the first screen on a new phone, or from the "Tus datos" sheet on one that already holds a class. The copy is previewed (class, date, headcount) and confirmed before anything is written, and the class it replaces is kept under a `libro-viajero:backup-*` key rather than deleted (`src/backup/`).

### Project setup

- The school year is stamped from the calendar (`currentSchoolYear()`, July onwards counts as the upcoming course), never chosen by the teacher.
- The project starts empty and the dashboard's empty states drive first-time setup: añadir peques → añadir libros → repartir libros.
- The **Clase** tab leads with the class list at every size, empty included; the builder sits behind a bar below it and stays open across additions, so a class of twenty stays two taps per child.
- Children go by a nickname or tag, never a real name. The avatar catalog carries **no human faces** — an avatar must never resemble a real child.
- Book search falls back to manual entry when Open Library has nothing.

### The reparto

- A book stays out **one or two weeks** (`Project.loanWeeks`, read through `loanWeeksOf()` in `src/loan/loan.model.ts`), for the whole class alike. The teacher sets it in the reparto, spelled out as a return date, and it saves with the reparto.
- The reparto opens **already filled in**, clockwise (`rotatePairs()` in `src/assign/rotation.model.ts`): books still out stay put, and each free book goes to the next child in Clase-list order without a book, starting after its last reader. Books nobody has read go to the first free children. The teacher only adjusts.
- Fewer books than children is fine: the children without a book wait for the next rotation.

### Friday check-in

- The dashboard groups children by loan state: late, due this Friday, still out.
- A return is one tap and saves on the spot; tapping again undoes it. An early return (the book is not due yet) asks to confirm first.
- There is no "confirm the check-in" step: once a book is back, the dashboard's banner leads to the reparto, which moves the books on.

### History

- There is no weekly session: a loan is the unit. A return writes `returnedOn` on the live assignment, and the next reparto closes every returned or replaced assignment into `Project.history` (`distributeBooks()` in `src/project/project.model.ts`), as does removing a child or a book.
- Tapping a child in the **Clase** list opens their loan card (`loanLogOf()` in `src/loan/loan-log.model.ts`): one dated line per book, from history plus the live assignment. Editing the child is the pencil on the card.
