# Data Model Reference

The types are the source of truth and live in their domain modules (`src/child/child.model.ts`, `src/book/book.model.ts`, `src/project/project.model.ts`, `src/project/school-year.model.ts`) — read them there, invariants included. This document holds only what the types cannot express: the storage schema, the rotation algorithm design, and external-API gotchas.

---

## localStorage Schema

```
Key:   libro-viajero
Value: JSON.stringify(AppData)
```

One key. There are no accounts, so there is nothing to namespace by: one phone, one teacher.

All reads and writes go through `src/services/storage.service.ts`:

- `getAppData()` — absent, unparseable, or wrong-shaped entries degrade to the empty `AppData`; an unreadable entry is preserved under `libro-viajero:backup-{timestamp}` before being abandoned
- `saveAppData(data)` — returns `false` (instead of throwing) when the write fails (quota, blocked storage), so callers can tell the teacher

`services/export.service.ts` — `downloadAppData(data)` writes `libro-viajero-{YYYY-MM-DD}.json`, the full `AppData` pretty-printed. Same shape as the storage value, so a future import is just a validated `saveAppData()`.

---

## Rotation Algorithm (not yet implemented)

**Status**: design only. The shipped behavior is the index-shift placeholder in `src/dashboard/next-week.component.tsx`. The real service (`services/rotation.service.ts`, `suggestNextAssignments({ project, returnedBookIds })`) is tracked as a repo issue.

For each book that was returned this week, suggest which child should receive it next week: no child reads the same book twice, and children who have been waiting longest go first.

1. **Filter eligible books**: only books in `returnedBookIds` (unreturned books keep their current assignment — same child, another week)

2. **For each eligible book**, find the best next child:
   - Exclude the child who had it this week
   - Score each other child by how many weeks ago they last had this book (∞ if never)
   - Pick the highest score (waited longest); among ties, the child with the fewest total books received this initiative

3. **Resolve conflicts**: two books might want the same child. Greedy assignment with backtracking — assign pairs in order of how overdue the pairing is

4. **Return** an `Assignment[]` for the next week (next Monday as `weekStart`). On confirmation, unreturned books' assignments carry over unchanged alongside the new ones

### Edge Cases

| Case | Handling |
|------|----------|
| Child absent (not part of return, not receiving) | Not supported in v1; teacher handles manually via swap |
| New book or new child added mid-initiative | Treated as if all children have been waiting equally long |
| Fewer books than children | Some children get no book that week (handled gracefully in UI) |

---

## Open Library Integration

`src/services/open-library.service.ts` — see the code for the exact request (title search, `limit=8`, 8s timeout via `AbortSignal.any`).

The one non-obvious gotcha: cover URLs must carry `?default=false`. Without it, a missing cover serves a 1×1 placeholder GIF that loads "successfully"; with it, the covers CDN 404s and `<img onError>` can swap in the color placeholder (`BookCover`).
