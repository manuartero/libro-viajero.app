# Data Model Reference

Each type lives in its domain module: `src/child/child.model.ts`, `src/book/book.model.ts`, `src/project/project.model.ts` (`Assignment`, `WeeklySession`, `Project`, `AppData`). This document explains the data model, storage schema, and key algorithms.

---

## Type Aliases

### `Child`

Represents a child in the classroom. No real names — only a teacher-assigned tag.

```typescript
type Child = {
  id: string;      // UUID, generated at creation
  tag: string;     // nickname/label chosen by teacher, max 20 chars (e.g. "🐸 Verde", "Hermano Mayor")
  emoji: string;   // single emoji character, chosen from curated picker
  color: string;   // hex color string (e.g. "#FFD166"), chosen from fixed palette
};
```

The avatar is rendered as `emoji` centered on a circle with `color` as background.

---

### `Book`

A book in the project's library.

```typescript
type Book = {
  id: string;        // UUID, generated at creation
  title: string;     // book title as entered/found
  author?: string;   // optional, from Open Library search
  coverUrl?: string; // optional URL to cover image (Open Library CDN)
  isbn?: string;     // optional, used for direct cover URL lookup
};
```

`coverUrl` is set when a cover is found via Open Library. If absent, the UI renders a color-based placeholder.

---

### `Assignment`

Maps one child to one book for a specific week.

```typescript
type Assignment = {
  childId: string;   // Child.id
  bookId: string;    // Book.id
  weekStart: string; // ISO 8601 date of the Monday of that week (e.g. "2025-09-15")
};
```

`weekStart` is always the Monday of the week, normalized on save.

---

### `WeeklySession`

A record of what happened in one Friday check-in.

```typescript
type WeeklySession = {
  weekStart: string;           // ISO date of that week's Monday
  returnedChildIds: string[];  // children who returned their book
  missedChildIds: string[];    // children who did NOT return their book
  assignments: Assignment[];   // the assignments that were CURRENT going into this session
                               // (i.e. what each child had this week, not what they got next)
};
```

`missedChildIds` is derived from `children.map(c => c.id).filter(id => !returnedChildIds.includes(id))` at confirmation time.

---

### `Project`

Everything about one classroom's traveling book initiative.

```typescript
type Project = {
  id: string;                       // UUID
  name: string;                     // classroom name + short school year, e.g. "Clase Caracoles 2026/27"
  children: Child[];
  books: Book[];
  currentAssignments: Assignment[];  // what each child has THIS week
  history: WeeklySession[];          // past sessions, ordered oldest → newest
};
```

**Invariant**: one entry per assigned child. An unreturned book **keeps its current assignment** — the child simply holds it another week; only returned books rotate.

---

### `SchoolYear`

`project/school-year.model.ts` — a transient value, derived on demand and **never persisted** (only the `start` year is kept as wizard state).

```typescript
type SchoolYear = {
  start: number;   // calendar year the course starts in, e.g. 2026
  label: string;   // "2026/2027"
  short: string;   // "2026/27" — appended to Project.name
};
```

Constructed via `schoolYearFrom(start)`; `currentSchoolYear(today?)` applies the July cutoff (teachers set up during the summer, so July onwards counts as the upcoming course).

---

### `AppData`

The root of what's stored in localStorage.

```typescript
type AppData = {
  projects: Project[];
  activeProjectId: string | null;  // the project currently shown on dashboard
};
```

---

## localStorage Schema

```
Key:   libro-viajero
Value: JSON.stringify(AppData)
```

One key. There are no accounts, so there is nothing to namespace by: one phone, one teacher.

**Default value** (when nothing is stored):
```json
{
  "projects": [],
  "activeProjectId": null
}
```

All reads and writes go through `services/storage.service.ts`:
- `getAppData()` — absent, unparseable, or wrong-shaped entries degrade to the default value; an unreadable entry is preserved under `libro-viajero:backup-{timestamp}` before being abandoned. Data found under the legacy key `libro-viajero:anonymous` (from when a Google login was still planned) is copied to `libro-viajero` on first read; the old key is left in place
- `saveAppData(data)` — returns `false` (instead of throwing) when the write fails (quota, blocked storage), so callers can tell the teacher

---

## Export File

`services/export.service.ts` — `downloadAppData(data)`

"Descargar mis datos" in the dashboard's privacy panel. Writes `libro-viajero-{YYYY-MM-DD}.json` straight from the browser (`Blob` + `<a download>`): the full `AppData`, pretty-printed. Same shape as the storage value, so a future import is just a validated `saveAppData()`.

---

## Rotation Algorithm

`services/rotation.service.ts` — `suggestNextAssignments({ project, returnedBookIds })`

### Goal
For each book that was returned this week, suggest which child should receive it next week. Ensure no child reads the same book twice, and prioritize children who have been waiting the longest.

### Algorithm

1. **Filter eligible books**: only books in `returnedBookIds` (unreturned books keep their current assignment — same child, another week)

2. **For each eligible book**, find the best next child:
   - Exclude the child who had it this week
   - Build a score for each other child: how many weeks ago did they last have this book? (or ∞ if never)
   - Pick the child with the highest score (waited longest)
   - Among ties, pick the child with the fewest total books received this initiative (ensures even distribution)

3. **Resolve conflicts**: two books might want the same child. Use a greedy assignment with backtracking — assign book-child pairs in order of "urgency" (how overdue the pairing is)

4. **Return** an `Assignment[]` for the next week (next Monday as `weekStart`). On confirmation, unreturned books' assignments carry over unchanged alongside the new ones

### Edge Cases

| Case | Handling |
|------|----------|
| Book not returned | Not in suggestions; stays with its current child; teacher sees it in "missing" |
| Child absent (not part of return, not receiving) | Not yet supported in v1; teacher manually handles via swap |
| New book added mid-initiative | Treated as if all children have been waiting equally long |
| New child added mid-initiative | Same as new book — equal priority |
| Fewer books than children | Some children get no book that week (handled gracefully in UI) |

---

## Open Library Integration

`services/open-library.service.ts`

### Book search

```
GET https://openlibrary.org/search.json
  ?title={encodeURIComponent(title)}
  &limit=8
  &fields=title,author_name,cover_i,isbn
```

Response shape (relevant fields):
```json
{
  "docs": [
    {
      "title": "The Very Hungry Caterpillar",
      "author_name": ["Eric Carle"],
      "cover_i": 8739161,
      "isbn": ["0399208534", "9780399208539"]
    }
  ]
}
```

### Cover URL

```
https://covers.openlibrary.org/b/id/{cover_i}-M.jpg   ← from search result
https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg     ← direct from ISBN
```

Sizes: `S` (small), `M` (medium, use this), `L` (large)

**Important**: a missing cover returns a 1×1 transparent GIF, not a 404. Always use `onError` on `<img>` to detect and replace with a placeholder.

### User-Agent

Send a descriptive `User-Agent` header for the 3 req/sec rate limit tier:
```
User-Agent: libro-viajero.app/0.1 (manutero.developer@gmail.com)
```
