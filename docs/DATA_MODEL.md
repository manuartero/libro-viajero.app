# Data Model Reference

The types are the source of truth and live in their domain modules (`src/child/child.model.ts`, `src/book/book.model.ts`, `src/project/project.model.ts`, `src/project/school-year.model.ts`) — read them there, invariants included. This document holds only what the types cannot express: the storage schema, the rotation algorithm design, and external-API gotchas.

---

## localStorage Schema

```
Key:   libro-viajero:v1:{googleId}   (v1 = STORAGE_VERSION; pre-versioning entries at libro-viajero:{googleId} are moved here on first read)
Value: JSON.stringify(AppData)
```

All reads and writes go through `src/services/storage.service.ts`:

- `getAppData(googleId)` — absent, unparseable, or wrong-shaped entries degrade to the empty `AppData`; an unreadable entry is moved to `libro-viajero:v1:{googleId}:backup` (the previous backup, if different, shifts to `…:backup-prev`) so it stays recoverable and is never re-backed-up on the next boot
- `saveAppData({ googleId, data })` — returns `false` (instead of throwing) when the write fails (quota, blocked storage), so callers can tell the teacher

**Anonymous namespace (pre-auth)**: until Google auth ships, all data lives under `googleId = "anonymous"` (`ANONYMOUS_USER_ID`). When auth lands, the first login must migrate the `anonymous` entry into the user's `payload.sub` namespace (same move pattern as `PREVIOUS_KEYS` in the storage service) — otherwise every pre-auth classroom silently disappears.

---

## Rotation Algorithm (not yet implemented)

**Status**: design only. The shipped behavior is the index-shift placeholder in `src/dashboard/next-week.component.tsx`. The real service (`services/rotation.service.ts`, `suggestNextAssignments({ project, returnedBookIds })`) is tracked as a repo issue.

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
| Child absent (not part of return, not receiving) | Not yet supported in v1; teacher manually handles via swap |
| New book added mid-initiative | Treated as if all children have been waiting equally long |
| New child added mid-initiative | Same as new book — equal priority |
| Fewer books than children | Some children get no book that week (handled gracefully in UI) |

---

## Open Library Integration

`src/services/open-library.service.ts` — see the code for the exact request (title search, `limit=8`, 8s timeout via `AbortSignal.any`).

The one non-obvious gotcha: cover URLs must carry `?default=false`. Without it, a missing cover serves a 1×1 placeholder GIF that loads "successfully"; with it, the covers CDN 404s and `<img onError>` can swap in the color placeholder (`BookCover`).
